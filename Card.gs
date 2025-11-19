/*
 * AI Email Polisher & Calendar Sync Project
 * Frontend UI logic
 */

/**
 * Builds the main card displayed on the Gmail homepage/sidebar.
 * @returns {Card} - The UI card.
 */
function buildHomepageCard() {
  const cardBuilder = CardService.newCardBuilder();

  // 1. Header
  const cardHeader = CardService.newCardHeader();
  cardHeader.setImageUrl('https://fonts.gstatic.com/s/i/googlematerialicons/auto_fix_high/v6/black-24dp/1x/gm_auto_fix_high_black_24dp.png');
  cardHeader.setImageStyle(CardService.ImageStyle.CIRCLE);
  cardHeader.setTitle("AI Email Polisher");
  cardHeader.setSubtitle("Draft perfectly toned replies");
  cardBuilder.setHeader(cardHeader);

  // 2. Input Section
  const inputSection = CardService.newCardSection();

  // Widget A: Tone Selector
  const toneDropdown = CardService.newSelectionInput()
    .setType(CardService.SelectionInputType.DROPDOWN)
    .setTitle("Select Response Tone")
    .setFieldName("selectedTone")
    .addItem("Professional", "Professional", true)
    .addItem("Friendly/Casual", "Friendly", false)
    .addItem("Assertive", "Assertive", false)
    .addItem("Empathetic", "Empathetic", false);
  
  inputSection.addWidget(toneDropdown);

  // Widget B: Calendar Sync
  const calendarSwitch = CardService.newSwitch()
    .setControlType(CardService.SwitchControlType.SWITCH)
    .setFieldName("calendarSync")
    .setValue("true")
    .setSelected(false);

  const calendarWidget = CardService.newDecoratedText()
    .setTopLabel("Integrations")
    .setText("Add events to Calendar")
    .setWrapText(true)
    .setSwitchControl(calendarSwitch);

  inputSection.addWidget(calendarWidget);

  // Widget C: The Rough Draft
  const draftInput = CardService.newTextInput()
    .setFieldName("userDraft")
    .setMultiline(true)
    .setTitle("Your Rough Draft")
    .setHint("Paste your points or rough draft here...");

  inputSection.addWidget(draftInput);

  // 3. Action Section
  const actionSection = CardService.newCardSection();
  const buttonSet = CardService.newButtonSet();

  // Point to the 'onPolishEmail' function
  const polishButton = createFilledButton(
      'Polish My Reply', 
      'onPolishEmail', 
      '#1a73e8'
  );
  
  buttonSet.addButton(polishButton);
  actionSection.addWidget(buttonSet);

  cardBuilder.addSection(inputSection);
  cardBuilder.addSection(actionSection);

  return cardBuilder.build();
}

/**
 * Creates a filled text button style helper.
 */
function createFilledButton(text, functionName, color) {
  const textButton = CardService.newTextButton();
  textButton.setText(text);
  textButton.setTextButtonStyle(CardService.TextButtonStyle.FILLED);
  textButton.setBackgroundColor(color);

  const action = CardService.newAction()
      .setFunctionName(functionName)
      .setLoadIndicator(CardService.LoadIndicator.SPINNER);

  textButton.setOnClickAction(action);
  return textButton;
}

/**
 * MAIN TRIGGER: Runs when the user clicks "Polish My Reply".
 * This connects the frontend (Card.gs) to the backend (vertex.gs).
 */
function onPolishEmail(e) {
  // 1. Extract Data from UI
  const tone = e.formInput.selectedTone;
  const draft = e.formInput.userDraft;
  // (Future implementation: Use syncCalendar to trigger Calendar API)
  const syncCalendar = e.formInput.calendarSync; 

  // 2. Validation
  if (!draft || draft.trim() === "") {
    return CardService.newActionResponseBuilder()
      .setNotification(CardService.newNotification().setText("Please enter a draft first."))
      .build();
  }

  try {
    // 3. Prepare data for Vertex.gs
    // Since vertex.gs only accepts one string argument, we combine tone and draft here.
    const combinedInput = `(INSTRUCTION: Rewrite the text below in a ${tone} tone): \n\n"${draft}"`;

    // 4. CALL THE AI (This calls the function in vertex.gs)
    const aiResult = processEmail(combinedInput);

    // 5. Show the Result
    // We push a NEW card onto the stack to display the polished email.
    return displayResultCard(aiResult);

  } catch (error) {
    console.error(error);
    return CardService.newActionResponseBuilder()
      .setNotification(CardService.newNotification().setText("Error: " + error.message))
      .build();
  }
}

/**
 * Helper: Creates a new card to display the AI result.
 */
function displayResultCard(polishedText) {
  const cardBuilder = CardService.newCardBuilder();
  const header = CardService.newCardHeader().setTitle("Polished Result");
  cardBuilder.setHeader(header);

  const section = CardService.newCardSection();

  // Display the AI text
  const textWidget = CardService.newTextInput()
    .setFieldName("finalResult")
    .setValue(polishedText)
    .setMultiline(true)
    .setTitle("Copy this text:");

  section.addWidget(textWidget);
  cardBuilder.addSection(section);

  // Create a 'Go Back' navigation
  const nav = CardService.newNavigation().pushCard(cardBuilder.build());
  
  return CardService.newActionResponseBuilder()
    .setNavigation(nav)
    .build();
}
