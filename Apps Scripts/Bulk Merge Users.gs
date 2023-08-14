function onOpen() {
    SpreadsheetApp.getUi().createMenu("Canvas 🐼")
        .addItem("Merge User", "mergeUser")
        .addSeparator()
        .addItem("Merge User Across Acccounts", "mergeacrossAccounts")
        .addSeparator()
        .addItem("Unmerge User", "unmergeUser")
        .addToUi();
}


function mergeUser() {

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
    var token = auth.getResponseText();
    if (token == "") {
        return
    }

    var headers = {
        'Authorization': 'Bearer ' + token
    };

    var rows = SpreadsheetApp.getActiveSheet().getDataRange().getValues();
    rows.forEach(function(rows, index) {
        if (index !== 0) {
            var canvasID = rows[0];
            var destinationID = rows[1];

            var mergeResponse = UrlFetchApp.fetch(url + '/api/v1/users/' + canvasID + '/merge_into/' + destinationID, {
                method: 'put',
                headers: headers,
                'muteHttpExceptions': true,
                contentType: 'application/json',
            });

            if (mergeResponse.getResponseCode() === 200) {
                SpreadsheetApp.getActiveSheet().getRange(index + 1, 3).setValue('Users merged successfully.');
            } else {
                SpreadsheetApp.getActiveSheet().getRange(index + 1, 3).setValue('Users could not be merged:' + mergeResponse);
            }
        }
    })
};

function unmergeUser() {

    var urlUI = SpreadsheetApp.getUi();
    var canvasURL = urlUI.prompt("What is your Canvas url? Example: https://canvas.instructure.com");
    var url = canvasURL.getResponseText();
    var regex = /^https:\/\/.*$/;
    if (url.includes("http://")) {
        url = "https://" + url.slice(7);
    } else if (!regex.test(url)) {
        url = "https://" + url;
    }

    var authUI = SpreadsheetApp.getUi();
    var auth = authUI.prompt("Enter your api token. Here is how to get one: https://shorturl.at/foYZ4");
    var token = auth.getResponseText();

    var headers = {
        'Authorization': 'Bearer ' + token
    };

    var rows = SpreadsheetApp.getActiveSheet().getDataRange().getValues();
    rows.forEach(function(rows, index) {
        if (index !== 0) {
            var userID = rows[0];

            var unmergeResponse = UrlFetchApp.fetch(url + '/api/v1/users/' + userID + '/split', {
                method: 'post',
                headers: headers,
                'muteHttpExceptions': true,
                contentType: 'application/json',
            });

            if (unmergeResponse.getResponseCode() === 200) {
                SpreadsheetApp.getActiveSheet().getRange(index + 1, 2).setValue('Users unmerged successfully.');
            } else {
                SpreadsheetApp.getActiveSheet().getRange(index + 1, 2).setValue('Users could not be unmerged:' + unmergeResponse);
            }
        }
    })
};

function mergeacrossAccounts() {

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
    var token = auth.getResponseText();
    if (token == "") {
        return
    }

    var headers = {
        'Authorization': 'Bearer ' + token
    };

    var rows = SpreadsheetApp.getActiveSheet().getDataRange().getValues();
    rows.forEach(function(rows, index) {
        if (index !== 0) {
            var canvasID = rows[0];
            var destinationDomain = rows[1];
            var destinationID = rows[2];
            var destinationDomain = destinationDomain.replace(/^(?:https?:\/\/)?(?:www\.)?/i, "").split('/')[0]

            var mergeResponse = UrlFetchApp.fetch(url + '/api/v1/users/' + canvasID + '/merge_into/accounts/' + destinationDomain + "/users/" + destinationID, {
                method: 'put',
                headers: headers,
                'muteHttpExceptions': true,
                contentType: 'application/json',
            });
            console.log(mergeResponse)
            if (mergeResponse.getResponseCode() === 200) {
                SpreadsheetApp.getActiveSheet().getRange(index + 1, 4).setValue('Users merged successfully.');
            } else {
                SpreadsheetApp.getActiveSheet().getRange(index + 1, 4).setValue('Users could not be merged:' + mergeResponse);
            }
        }
    })
};
