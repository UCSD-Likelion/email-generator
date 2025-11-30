function showErrorCard(errorMessage) {
  const card = CardService.newCardBuilder()
    .setHeader(
      CardService.newCardHeader()
        .setTitle("Something went wrong")
        .setImageUrl(
          "https://www.gstatic.com/images/icons/material/system/1x/error_outline_black_48dp.png"
        )
        .setImageStyle(CardService.ImageStyle.CIRCLE)
    )
    .addSection(
      CardService.newCardSection()
        .addWidget(
          CardService.newTextParagraph().setText(
            `An error occurred: ${errorMessage}`
          )
        )
        .addWidget(
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
}
