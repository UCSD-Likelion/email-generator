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
  const preview = message.getPlainBody().slice(0, 200); // first 200 chars

  // 3. Build a simple card showing the info
  const section = CardService.newCardSection()
    .addWidget(CardService.newKeyValue().setTopLabel("From").setContent(from))
    .addWidget(
      CardService.newTextParagraph().setText(`<b>Preview</b><br>${preview}`)
    );

  const card = CardService.newCardBuilder()
    .setHeader(
      CardService.newCardHeader().setTitle("Current email").setSubtitle(subject)
    )
    .addSection(section)
    .build();

  // Gmail add-ons expect an array of cards
  return [card];
}
