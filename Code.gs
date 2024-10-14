function doGet() {
  return HtmlService.createHtmlOutputFromFile('index')
    .setTitle('Habit Tracker')
    .addMetaTag(
      'viewport',
      'width=device-width, initial-scale=1.0, user-scalable=no'
    )
    .addMetaTag('apple-mobile-web-app-capable', 'yes');
}

function getHabitsWithStatus(date) {
  const metadataSheet =
    SpreadsheetApp.getActiveSpreadsheet().getSheetByName('Metadata');
  const habitTrackerSheet =
    SpreadsheetApp.getActiveSpreadsheet().getSheetByName('HabitTracker');

  const habits = metadataSheet
    .getRange('A:A')
    .getValues()
    .flat()
    .filter((habit) => habit);
  const trackerData = habitTrackerSheet.getDataRange().getValues();

  const habitStatus = habits.map((habit) => {
    const done = trackerData.some(
      (row) => formatDate(row[0]) === date && row[1] === habit
    );
    return { habit: habit, done: done };
  });

  Logger.log({ habits: habitStatus, date: date });
  return { habits: habitStatus, date: date };
}

function toggleHabitStatus(date, habit, status) {
  const habitTrackerSheet =
    SpreadsheetApp.getActiveSpreadsheet().getSheetByName('HabitTracker');
  const data = habitTrackerSheet.getDataRange().getValues();

  if (status) {
    habitTrackerSheet.appendRow([new Date(date), habit]);
  } else {
    for (let i = data.length - 1; i >= 0; i--) {
      if (formatDate(data[i][0]) === date && data[i][1] === habit) {
        habitTrackerSheet.deleteRow(i + 1);
        break;
      }
    }
  }
}

function formatDate(date) {
  return Utilities.formatDate(
    new Date(date),
    Session.getScriptTimeZone(),
    'yyyy-MM-dd'
  );
}
