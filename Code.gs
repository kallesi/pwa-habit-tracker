function doGet() {
  return HtmlService.createHtmlOutputFromFile('index')
    .setTitle('Habit Tracker')
    .addMetaTag(
      'viewport',
      'width=device-width, initial-scale=1.0, user-scalable=no'
    )
    .addMetaTag('apple-mobile-web-app-capable', 'yes')
    .addMetaTag('mobile-web-app-capable', 'yes');
}

function getAllHabitsData() {
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

  const allData = trackerData.map((row) => ({
    date: formatDate(row[0]),
    habit: row[1],
  }));

  return { habits: habits, trackerData: allData };
}

function calculateStreak(trackerData, habit, date) {
  let streak = 0;
  let currentDate = new Date(date);
  currentDate.setHours(0, 0, 0, 0);

  trackerData.sort((a, b) => new Date(b.date) - new Date(a.date));

  for (let i = 0; i < trackerData.length; i++) {
    const trackDate = trackerData[i].date;
    const trackHabit = trackerData[i].habit;
    if (trackHabit === habit) {
      if (trackDate === formatDate(currentDate)) {
        streak++;
        currentDate.setDate(currentDate.getDate() - 1);
      } else if (new Date(trackDate) < currentDate) {
        break;
      }
    }
  }

  return streak;
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
