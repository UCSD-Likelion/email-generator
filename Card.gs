/*
 * AI Email Polisher & Calendar Sync Project
 * Custom UI built with Google Workspace CardService
 */

/**
 * Builds the main card displayed on the Gmail homepage/sidebar.
 * @returns {Card} - The UI card.
 */
function buildHomepageCard() {
  // 1. Create a new card builder
  const cardBuilder = CardService.newCardBuilder();

  // 2. Create the Header
  const cardHeader = CardService.newCardHeader();
  // Using a 'magic wand' icon to represent AI polishing
  cardHeader.setImageUrl('https://fonts.gstatic.com/s/i/googlematerialicons/auto_fix_high/v6/black-24dp/1x/gm_auto_fix_high_black_24dp.png');
  cardHeader.setImageStyle(CardService.ImageStyle.CIRCLE);
  cardHeader.setTitle("AI Email Polisher");
  cardHeader.setSubtitle("Draft perfectly toned replies");
  cardBuilder.setHeader(cardHeader);

  // 3. Create the Input Section
  const inputSection = CardService.newCardSection();

  // -- Widget A: Tone Selector (Dropdown) --
  const toneDropdown = CardService.newSelectionInput()
    .setType(CardService.SelectionInputType.DROPDOWN)
    .setTitle("Select Response Tone")
    .setFieldName("selectedTone") // Key to retrieve value later
    .addItem("Professional", "professional", true) // Default
    .addItem("Friendly/Casual", "friendly", false)
    .addItem("Assertive", "assertive", false)
    .addItem("Empathetic", "empathetic", false);
  
  inputSection.addWidget(toneDropdown);

  // -- Widget B: Calendar Sync (Switch) --
  // We use a switch inside a DecoratedText for a cleaner UI look
  const calendarSwitch = CardService.newSwitch()
    .setControlType(CardService.SwitchControlType.SWITCH)
    .setFieldName("calendarSync")
    .setValue("true")
    .setSelected(false); // Default to off

  const calendarWidget = CardService.newDecoratedText()
    .setTopLabel("Integrations")
    .setText("Add events to Calendar")
    .setWrapText(true)
    .setSwitchControl(calendarSwitch);

  inputSection.addWidget(calendarWidget);

  // -- Widget C: The Rough Draft (Text Input) --
  const draftInput = CardService.newTextInput()
    .setFieldName("userDraft")
    .setMultiline(true) // Allow multiple lines
    .setTitle("Your Rough Draft")
    .setHint("Paste your points or rough draft here...");

  inputSection.addWidget(draftInput);

  // 4. Create the Action Section
  const actionSection = CardService.newCardSection();
  const buttonSet = CardService.newButtonSet();

  // Use the helper function to create the main trigger button
  // This points to the 'onPolishEmail' function below
  const polishButton = createFilledButton(
      'Polish My Reply', 
      'onPolishEmail', 
      '#1a73e8' // Google Blue
  );
  
  buttonSet.addButton(polishButton);
  actionSection.addWidget(buttonSet);

  // 5. Assemble the card
  cardBuilder.addSection(inputSection);
  cardBuilder.addSection(actionSection);

  return cardBuilder.build();
}

/**
 * Creates a filled text button with the specified text, function, and color.
 * * @param {string} text - The text to display on the button.
 * @param {string} functionName - The name of the function to call when clicked.
 * @param {string} color - The background color of the button (Hex).
 * @returns {TextButton} - The created text button.
 */
function createFilledButton(text, functionName, color) {
  const textButton = CardService.newTextButton();
  textButton.setText(text);
  
  // Set the button style to filled and apply color
  textButton.setTextButtonStyle(CardService.TextButtonStyle.FILLED);
  textButton.setBackgroundColor(color);

  // Create the Action
  // We add a SPINNER load indicator so the user knows the AI is processing
  const action = CardService.newAction()
      .setFunctionName(functionName)
      .setLoadIndicator(CardService.LoadIndicator.SPINNER);

  textButton.setOnClickAction(action);
  return textButton;
}

/**
 * The Action Handler: This runs when the user clicks "Polish My Reply".
 * It retrieves the inputs from the UI.
 *
 * @param {Object} e - The event object containing form inputs.
 */
function onPolishEmail(e) {
  // 1. Extract User Inputs using the field names defined in buildHomepageCard
  const tone = e.formInput.selectedTone;
  const draft = e.formInput.userDraft;
  const syncCalendar = e.formInput.calendarSync ? true : false;

  // 2. Basic Validation
  if (!draft || draft.trim() === "") {
    return buildNotificationResponse("Please enter a draft before polishing.");
  }

  // 3. Backend Logic Placeholder
  // TODO: Connect this to your AI API (OpenAI/Gemini) and Calendar API
  console.log("--- Processing Request ---");
  console.log("Tone:", tone);
  console.log("Calendar Sync:", syncCalendar);
  console.log("Draft Length:", draft.length);
  
  // 4. Return a notification to the UI
  return buildNotificationResponse(`Processing email with ${tone} tone...`);
}

/**
 * Creates a notification response with the specified text.
 *
 * @param {string} notificationText - The text to display in the notification.
 * @returns {ActionResponse} - The created action response.
 */
function buildNotificationResponse(notificationText) {
  const notification = CardService.newNotification()
      .setText(notificationText);
      
  return CardService.newActionResponseBuilder()
      .setNotification(notification)
      .build();
}
