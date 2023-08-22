/// Global Varibles are set like this because Apps Script forgets things over time. Make sure all values are in the quotes
var apiDomain = "" /// This is your Canvas url Example: https://canvas.instructure.com
var authToken = "" /// Enter your api token. Here is how to get one: https://shorturl.at/foYZ4"
var email = "" /// Enter the email you would like the notification to go to.
var theNotificationTime = "" /// How long should an import be running before you get notified? This measurement is in hours.
var totalChanges = "" ///If a SIS Import has this many total state changes you will get notified. 



/////// Do not edit past here ///////

///Creates the menu in the sheet
function onOpen() {
    SpreadsheetApp.getUi().createMenu("Canvas 🐼")
        .addItem("Setup", "sheetSetup")
        .addSeparator()
        .addItem("Fetch SIS Import Data", "sisImportAPI")
        .addItem("Abort SIS Import", "abortImport")
        .addItem("Abort All Pending SIS Imports", "abortAllPending")
        .addToUi();
};

///Creates Headers.Deletes any triggers and creates a new one. Also brings in a SIS Import.
function sheetSetup() {
    var sheet = SpreadsheetApp.getActiveSheet();
    const sheetHeaders = [
        "Import ID",
        "Created At",
        "Started At",
        "Updated At",
        "Ended At",
        "Progress",
        "Status Changes Made",
        "Workflow State"
    ];

    for (let col = 0; col < sheetHeaders.length; col++) {
        sheet.getRange(1, col + 1).setValue(sheetHeaders[col]);
    }

    var triggers = ScriptApp.getProjectTriggers();

    for (var i = 0; i < triggers.length; i++) {
        ScriptApp.deleteTrigger(triggers[i]);
    }
    ScriptApp.newTrigger(sisNotification)
        .timeBased()
        .everyHours(1)
        .create()

    sisImportAPI()
};



///Main Function
function sisNotification() {
    sisImportAPI()
    sendEmail()
};

///Brings in the 3 lastest imports. 
function sisImportAPI() {

    var sheet = SpreadsheetApp.getActiveSheet();
    var headers = {
        'Authorization': 'Bearer ' + authToken
    };
    var response = UrlFetchApp.fetch(apiDomain + "/api/v1/accounts/self/sis_imports?per_page=3", {
        method: 'get',
        headers: headers,
        'muteHttpExceptions': true,
        contentType: 'application/json',
    });

    if (response.getResponseCode() === 401) {
        MailApp.sendEmail(email,
            "IMPORTANT: SIS Import Notification Sheet Error",
            "Hello, your SIS Import Notification Sheet threw a 400 error. Please update your authenication token by running the setup again. "
        )
    }

    var data = JSON.parse(response.getContentText());

    var sisId = data.sis_imports.map(({
        id
    }) => [id]);
    var sisCreated = data.sis_imports.map(({
        created_at
    }) => [created_at]);
    var sisStarted = data.sis_imports.map(({
        started_at
    }) => [started_at]);
    var sisUpdated = data.sis_imports.map(({
        updated_at
    }) => [updated_at]);
    var sisEndedAt = data.sis_imports.map(({
        ended_at
    }) => [ended_at]);
    var sisProgress = data.sis_imports.map(({
        progress
    }) => [progress]);
    var sisWorkFlow = data.sis_imports.map(({
        workflow_state
    }) => [workflow_state]);

    sheet.getRange(2, 1, sisId.length).setValues(sisId);
    sheet.getRange(2, 2, sisCreated.length).setValues(sisCreated);
    sheet.getRange(2, 3, sisStarted.length).setValues(sisStarted);
    sheet.getRange(2, 4, sisUpdated.length).setValues(sisUpdated);
    sheet.getRange(2, 5, sisEndedAt.length).setValues(sisEndedAt);
    sheet.getRange(2, 6, sisProgress.length).setValues(sisProgress);
    sheet.getRange(2, 8, sisWorkFlow.length).setValues(sisWorkFlow);

    const sisImports = data.sis_imports;

    for (let i = 0; i < Math.min(sisImports.length, 3); i++) {
        const stateChanges = sisImports[i]?.data?.statistics?.total_state_changes || 0;
        sheet.getRange(i + 2, 7).setValue(stateChanges);
    }
};

///Sends an email in the event that the workflow state is either "importing" or "cleanup_batch," and if the duration exceeds the specified notification time. Additionally, emails will be sent if the workflow state is categorized as "failed" or "failed with messages." Also, sends an email when there has been a mass change.
function sendEmail() {

    var rows = SpreadsheetApp.getActiveSheet().getDataRange().getValues()
    var flatrows = SpreadsheetApp.getActiveSheet().getDataRange().getValues().flat();
    var pendingCounter = flatrows.filter(x => x == 'created').length;

    var toMilliseconds = (hrs, min, sec) => (hrs * 60 * 60 + min * 60 + sec) * 1000;
    notificationTime = toMilliseconds(theNotificationTime, 0, 0)

    rows.forEach(function(rows, index) {
        if (index !== 0) {
            var rowId = rows[0]
            var rowUpdatedAt = new Date(rows[3])
            var mmTimeUpdatedAt = rowUpdatedAt.getTime()
            var rowProgress = rows[5]
            var rowWorkFlow = rows[7]
            var rightNow = new Date()
            var mmRightNow = rightNow.getTime()
            var stateChangesValue = rows[6]

            if (mmRightNow - mmTimeUpdatedAt >= notificationTime && (rowWorkFlow === "placeholder") || (rowWorkFlow === "importing") || (rowWorkFlow === "cleanup_batch")) {
                MailApp.sendEmail(email,
                    "IMPORTANT: Canvas SIS Import Notification",
                    "Hello, SIS import " + rowId + " is taking longer than expected. It is in the " + rowWorkFlow + " work flow state and is at " + rowProgress + " progress. You also have " + pendingCounter + " or more pending imports.If you would like to abort it, go to your SIS Import Notification Google Sheet and go to Canvas in the tool bar, click on Abort SIS Import and type in " + rowId + ". If you would like to abort all pending SIS imports as well, go to your SIS Import Notification Google Sheet and go to Canvas in the tool bar, click on Abort All Pending SIS Imports."
                )
            } else if ((rowWorkFlow === "failed") || (rowWorkFlow === "failed_with_messages")) {
                MailApp.sendEmail(email,
                    "IMPORTANT: Failed Canvas SIS Import Notification",
                    "Hello, SIS import " + rowId + " has " + rowWorkFlow + ". Just a friendly heads up!"
                )
            } else if (stateChangesValue >= totalChanges) {
                MailApp.sendEmail(email,
                    "IMPORTANT: Mass Change Alert: Canvas SIS Import Notification",
                    "Hello, SIS import " + rowId + " has " + stateChangesValue + " total state changes. Just a friendly heads up!"
                )
            } else {
                return
            }
        }
    })
};

///Aborts import
function abortImport() {
    var headers = {
        'Authorization': 'Bearer ' + authToken
    };

    var abortPrompt = SpreadsheetApp.getUi().prompt("What is the id of the SIS import you would like to abort?");
    var abortID = abortPrompt.getResponseText();

    var abortResponse = UrlFetchApp.fetch(apiDomain + "/api/v1/accounts/self/sis_imports/" + abortID + "/abort", {
        method: 'put',
        headers: headers,
        'muteHttpExceptions': true,
        contentType: 'application/json',
    });

    if (abortResponse.getResponseCode() === 200) {
        SpreadsheetApp.getUi().alert('Successfully aborted');
    } else {
        SpreadsheetApp.getUi().alert('Could not abort the import' + abortResponse);
    }
};

///Aborts all pending imports
function abortAllPending() {
    var headers = {
        'Authorization': 'Bearer ' + authToken
    };

    var abortAllResponse = UrlFetchApp.fetch(apiDomain + "/api/v1/accounts/self/sis_imports/abort_all_pending", {
        method: 'put',
        headers: headers,
        'muteHttpExceptions': true,
        contentType: 'application/json',
    });

    if (abortAllResponse.getResponseCode() === 200) {
        SpreadsheetApp.getUi().alert('Successfully aborted');
    } else {
        SpreadsheetApp.getUi().alert('Could not abort the imports' + abortResponse);
    }
};
