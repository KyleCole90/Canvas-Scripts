function onOpen() {
    SpreadsheetApp.getUi().createMenu("Canvas 🐼")
        .addItem("Fetch All Students", "getStudentUsers")
        .addSeparator()
        .addItem("Genrate Pairing Codes", "postPairingCodes")
        .addToUi();
};

function getStudentUsers() {
    const sheet = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet();

    ///Build Sheet Headers
    const sheetHeaders = [
        "Canvas ID",
        "User's Name",
        "SIS ID",
        "Login ID"
    ];

    for (let col = 0; col < sheetHeaders.length; col++) {
        sheet.getRange(1, col + 1).setValue(sheetHeaders[col]);
    }

    // Get URL and Token
    var urlUI = SpreadsheetApp.getUi();
    var canvasURL = urlUI.prompt("What is your Canvas url? Example: https://canvas.instructure.com");
    var url = canvasURL.getResponseText();
    var regex = /^https:\/\/.*$/;
    if (url.includes("http://")) {
        url = "https://" + url.slice(7);
    } else if (!regex.test(url)) {
        url = "https://" + url;
    }
    if (url == "https://") {
        return
    }

    var authUI = SpreadsheetApp.getUi();
    var auth = authUI.prompt("Enter your api token. Here is how to get one: https://shorturl.at/foYZ4");
    var authToken = auth.getResponseText();
    if (authToken == "") {
        return
    }

    /// Build API Call 
    const users = [];

    let page = 1;
    let morePages = true;

    while (morePages) {
        const response = UrlFetchApp.fetch(`${url}/api/v1/accounts/self/users?enrollment_type=student&per_page=100&page=${page}&access_token=${authToken}`);

        const data = JSON.parse(response.getContentText());
        users.push(...data);

        // Introduce a 5 millisecond delay so there wont be throttling issues
        Utilities.sleep(5);

        // Check if there are more pages to fetch
        if (response.getHeaders()['Link']) {
            morePages = response.getHeaders()['Link'].includes('rel="next"');
        } else {
            morePages = false;
        }

        page++;
    }

    // Write response to Google Sheet
    const values = users.map(users => [users.id, users.name, users.sis_user_id, users.login_id]);
    sheet.getRange(2, 1, values.length, 4).setValues(values);
};

function postPairingCodes() {
    const sheet = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet();
    sheet.getRange("E1").setValue("Pairing Code");
    sheet.getRange("F1").setValue("Expires At");
    sheet.getRange("G1").setValue("Response");

    const urlUI = SpreadsheetApp.getUi();
    const canvasURL = urlUI.prompt("What is your Canvas URL? Example: https://canvas.instructure.com").getResponseText();
    const regex = /^https:\/\/.*$/;

    let url = canvasURL;
    if (url.includes("http://")) {
        url = "https://" + url.slice(7);
    } else if (!regex.test(url)) {
        url = "https://" + url;
    }

    if (url === "https://") {
        return;
    }

    const authUI = SpreadsheetApp.getUi();
    const authToken = authUI.prompt("Enter your API token. Here is how to get one: https://shorturl.at/foYZ4").getResponseText();
    if (authToken === "") {
        return;
    }

    const headers = {
        'Authorization': 'Bearer ' + authToken
    };

    ///API Call
    const rows = SpreadsheetApp.getActiveSheet().getDataRange().getValues();
    rows.forEach(function(row, index) {
        if (index !== 0) {
            const canvasID = row[0];

            const pairResponse = UrlFetchApp.fetch(`${url}/api/v1/users/${canvasID}/observer_pairing_codes`, {
                method: 'post',
                headers: headers,
                'muteHttpExceptions': true,
                contentType: 'application/json',
            });

            ///Printing Pairing Code and Reponse
            var data = JSON.parse(pairResponse.getContentText());
            if (pairResponse.getResponseCode() === 200) {
                sheet.getRange(index + 1, 5).setValue(data.code);
                sheet.getRange(index + 1, 6).setValue(data.expires_at);
                sheet.getRange(index + 1, 7).setValue('Pairing Code Generated');
            } else {
                sheet.getRange(index + 1, 5).setValue('Pairing Code not generated');
                sheet.getRange(index + 1, 7).setValue('Response: ' + pairResponse.getContentText());
            }
        }
    });
};
