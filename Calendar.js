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