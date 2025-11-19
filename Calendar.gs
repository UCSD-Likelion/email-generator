
// Create a Google Calendar event from data passed from the Card UI.
// Woosik
 
function createCalendarEvent(e) {
  try {
    const params = e.commonEventObject.parameters;

    const title = params.title;
    const start = new Date(params.start);
    const end = new Date(params.end);

    const calendar = CalendarApp.getDefaultCalendar();

    calendar.createEvent(title, start, end);

    return CardService.newActionResponseBuilder()
      .setNotification(
        CardService.newNotification().setText("Event added to Google Calendar!")
      )
      .build();

  } catch (err) {
    return CardService.newActionResponseBuilder()
      .setNotification(
        CardService.newNotification().setText(
          "Failed to create event: " + err.message
        )
      )
      .build();
  }
}

//test case
function testCreateCalendarEvent() {
  const fakeEvent = {
    commonEventObject: {
      parameters: {
        title: "Test Meeting from Apps Script",
        start: "2025-11-18T18:00:00Z",
        end:   "2025-11-18T19:00:00Z"
      }
    }
  };

  createCalendarEvent(fakeEvent);
}
