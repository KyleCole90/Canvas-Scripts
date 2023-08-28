function onOpen() {
    SpreadsheetApp.getUi().createMenu("Canvas 🐼")
        .addItem("Fetch Courses without SIS IDs", "getCoursesWithNullSISIDs")
        .addItem("Fetch Users without SIS IDs", "getUsersWithNullSISIDs")
        .addSeparator()
        .addItem("Genrate Random SIS IDs", "assignRandomSISID")
        .addSeparator()
        .addItem("Post New SIS IDs to Canvas", "updateSISID")
        .addToUi();
};

function getUsersWithNullSISIDs() {
    const sheet = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet();

    ////Set Sheet Headers
    const sheetHeaders = [
        "Canvas ID",
        "User's Name",
        "SIS ID",
        "Login ID"
    ];

    for (let col = 0; col < sheetHeaders.length; col++) {
        sheet.getRange(1, col + 1).setValue(sheetHeaders[col]);
    }

    /// Get URL and Token
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

    ///API Call
    const users = [];

    let page = 1;
    let morePages = true;

    while (morePages) {
        const response = UrlFetchApp.fetch(`${url}/api/v1/accounts/self/users?per_page=100&page=${page}&access_token=${authToken}`);

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

    // Filter users with null SIS IDs
    const usersWithNullSISIDs = users.filter(users => users.sis_user_id === null);

    // Write response to Google Sheet
    const values = usersWithNullSISIDs.map(users => [users.id, users.name]);
    sheet.getRange(2, 1, values.length, 2).setValues(values);

    ///Get the ID of the Login ID
    var rows = sheet.getDataRange().getValues();
    rows.forEach(function(row, index) {
        if (index !== 0) {
            const canvasID = row[0];

            // Introduce a 5 millisecond delay so there wont be throttling issues
            Utilities.sleep(5);
            const loginResponse = UrlFetchApp.fetch(`${url}/api/v1/users/${canvasID}/logins?access_token=${authToken}`);
            var loginData = JSON.parse(loginResponse.getContentText());

            if (loginData.length > 0) {
                var loginIDs = loginData.map(({
                    id
                }) => [id]);

                // Update the correct row with login IDs
                sheet.getRange(index + 1, 4, loginIDs.length, 1).setValues(loginIDs);
            }
        }
    });
    
};

function getCoursesWithNullSISIDs() {
  const sheet = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet();

  ////Set Sheet Headers
  const sheetHeaders = [
        "Canvas ID",
        "Course Name",
        "SIS ID",
    ];

    for (let col = 0; col < sheetHeaders.length; col++) {
        sheet.getRange(1, col + 1).setValue(sheetHeaders[col]);
    }

    /// Get URL and Token
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

  ///API Call
  const courses = [];

  let page = 1;
  let morePages = true;

  while (morePages) {
    const response = UrlFetchApp.fetch(`${url}/api/v1/courses?per_page=100&page=${page}&access_token=${authToken}`);

    const data = JSON.parse(response.getContentText());
    courses.push(...data);

    // Check if there are more pages to fetch
    if (response.getHeaders()['Link']) {
      morePages = response.getHeaders()['Link'].includes('rel="next"');
    } else {
      morePages = false;
    }

    page++;
  }

  // Filter courses with null SIS IDs
  const coursesWithNullSISIDs = courses.filter(course => course.sis_course_id === null);

  // Write response to Google Sheet
  const values = coursesWithNullSISIDs.map(course => [course.id, course.name]);
  sheet.getRange(2, 1, values.length, 2).setValues(values);
};

function updateSISID() {
    const sheet = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet();
    sheet.getRange("E1").setValue("Response");

    const rows = sheet.getDataRange().getValues();

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

    const cell = sheet.getRange('B1');
    rows.forEach(function(row, index) {
        if (index !== 0) {
            const canvasID = row[0];
            const sisID = row[2];
            const loginIDValue = row[3];

            if (cell.getValue() === "Course Name") {
                const courseResponse = UrlFetchApp.fetch(`${url}/api/v1/courses/${canvasID}?course[sis_course_id]=${sisID}`, {
                    method: 'PUT',
                    headers: headers,
                    'muteHttpExceptions': true,
                    contentType: 'application/json',
                });
                if (courseResponse.getResponseCode() === 200) {
                    sheet.getRange(index + 1, 5).setValue('SIS ID has been changed');
                } else {
                    sheet.getRange(index + 1, 5).setValue('SIS ID was not changed' + courseResponse);
                }
            } else if (cell.getValue() === "User's Name") {
                const userResponse = UrlFetchApp.fetch(`${url}/api/v1/accounts/self/logins/${loginIDValue}?login[sis_user_id]=${sisID}`, {
                    method: 'PUT',
                    headers: headers,
                    'muteHttpExceptions': true,
                    contentType: 'application/json',
                });
                if (userResponse.getResponseCode() === 200) {
                    sheet.getRange(index + 1, 5).setValue('SIS ID has been changed');
                } else {
                    sheet.getRange(index + 1, 5).setValue('SIS ID was not changed' + userResponse);
                }
            }
        }
    });
};

function generateRandomString(length) {
  const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let result = '';
  for (let i = 0; i < length; i++) {
    result += characters.charAt(Math.floor(Math.random() * characters.length));
  }
  return result;
};

function assignRandomSISID() {
  const sheet = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet();
  const column = 3; 

  const numRows = sheet.getLastRow();
  for (let row = 2; row <= numRows; row++) { 
    const randomString = generateRandomString(8);
    sheet.getRange(row, column).setValue(randomString);
  }
};
