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
    const streak = calculateStreak(trackerData, habit, date);
    return { habit: habit, done: done, streak: streak };
  });

  Logger.log({ habits: habitStatus, date: date });
  return { habits: habitStatus, date: date };
}

function calculateStreak(trackerData, habit) {
  let streak = 0;
  let currentDate = new Date();
  currentDate.setHours(0, 0, 0, 0); // Normalize to start of day

  // Sort tracker data by date descending
  trackerData.sort((a, b) => new Date(b[0]) - new Date(a[0]));

  for (let i = 0; i < trackerData.length; i++) {
    const [trackDate, trackHabit] = trackerData[i];
    if (trackHabit === habit) {
      const trackDateFormatted = formatDate(trackDate);
      const currentDateFormatted = formatDate(currentDate);
      if (trackDateFormatted === currentDateFormatted) {
        streak++;
        currentDate.setDate(currentDate.getDate() - 1); // Move to the previous day
      } else if (new Date(trackDate) < currentDate) {
        break;
      }
    }
  }

  return streak;
}

function formatDate(date) {
  return Utilities.formatDate(
    new Date(date),
    Session.getScriptTimeZone(),
    'yyyy-MM-dd'
  );
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
