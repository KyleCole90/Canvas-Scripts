function onOpen() {
    SpreadsheetApp.getUi().createMenu("Canvas 🐼")
        .addItem("Check Characters", "highlightNonUTF8Characters")
        .addToUi();
}


function highlightNonUTF8Characters() {
  var sheet = SpreadsheetApp.getActiveSheet();
  var range = sheet.getDataRange();
  var values = range.getValues();

  var nonUTF8CharactersRegex = /[^\x00-\x7F]+/g; // Matches any characters not in the UTF-8 range

  for (var i = 0; i < values.length; i++) {
    for (var j = 0; j < values[i].length; j++) {
      var cellValue = values[i][j];
      if (nonUTF8CharactersRegex.test(cellValue)) {
        // Highlight the cell with non-UTF-8 characters
        range.getCell(i + 1, j + 1).setBackground('red'); 
      }
    }
  }
}
