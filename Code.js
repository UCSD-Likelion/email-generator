function buildAddOn(e) {
  // Safety check: if there is no message context
  if (!e || !e.messageMetadata || !e.messageMetadata.messageId) {
    const card = CardService.newCardBuilder()
      .setHeader(CardService.newCardHeader().setTitle("No message selected"))
      .addSection(
        CardService.newCardSection().addWidget(
          CardService.newTextParagraph().setText(
            "Open an email to use this add-on."
          )
        )
      )
      .build();
    return [card];
  }

  // 1. Get the message ID from the event
  const messageId = e.messageMetadata.messageId;

  // 2. Fetch the GmailMessage object
  const message = GmailApp.getMessageById(messageId);

  const subject = message.getSubject();
  const from = message.getFrom();
  const preview = message.getPlainBody();

  // 3. Build a simple card showing the info
  const section = CardService.newCardSection()
    .addWidget(CardService.newTextParagraph().setText(`<b>From</b><br>${from}`))
    .addWidget(
      CardService.newTextParagraph().setText(`<b>Preview</b><br>${preview}`)
    );

  // 4. Add buttons for actions
  const buttonSection = CardService.newCardSection().addWidget(
    CardService.newButtonSet().addButton(
      CardService.newTextButton()
        .setText("Summarize Email")
        .setBackgroundColor("#4285f4")
        .setOnClickAction(
          CardService.newAction()
            .setFunctionName("handleSummarizeEmail")
            .setParameters({ messageId: messageId })
            .setLoadIndicator(CardService.LoadIndicator.SPINNER)
        )
    )
  );

  const card = CardService.newCardBuilder()
    .setHeader(
      CardService.newCardHeader().setTitle("Current email").setSubtitle(subject)
    )
    .addSection(section)
    .addSection(buttonSection)
    .build();

  // Gmail add-ons expect an array of cards
  return [card];
}

function handleSummarizeEmail(e) {
  const messageId = e.parameters.messageId;
  const message = GmailApp.getMessageById(messageId);
  const emailText = message.getPlainBody();

  try {
    const summary = summarizeEmail(emailText);

    const calendarEvent = extractCalendarEvents(emailText);

    const section = CardService.newCardSection().addWidget(
      CardService.newTextParagraph().setText(`<b>Summary</b><br>${summary}`)
    );

    if (calendarEvent.hasCalendarEvent) {
      const action = CardService.newAction()
        .setFunctionName("createCalendarEvent")
        .setParameters({
          title: calendarEvent.title,
          start: calendarEvent.start,
          end: calendarEvent.end,
        });

      const addToCalendarButton = CardService.newTextButton()
        .setText("Add Event to Calendar")
        .setOnClickAction(action)
        .setBackgroundColor("#34A853");

      section.addWidget(addToCalendarButton);
    }

    // Create a new card showing the summary
    const card = CardService.newCardBuilder()
      .setHeader(CardService.newCardHeader().setTitle("Email Summary"))
      .addSection(section)
      .addSection(
        CardService.newCardSection().addWidget(
          CardService.newTextButton()
            .setText("Back")
            .setOnClickAction(
              CardService.newAction().setFunctionName("buildAddOn")
            )
        )
      )
      .build();

    return CardService.newActionResponseBuilder()
      .setNavigation(CardService.newNavigation().pushCard(card))
      .build();
  } catch (error) {
    return showErrorCard(error.message);
  }
}
