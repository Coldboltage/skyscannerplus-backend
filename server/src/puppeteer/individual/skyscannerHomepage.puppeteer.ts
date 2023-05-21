import { AppDataSource } from "../../data-source";
import { UserFlightTypeORM } from "../../entity/user-flight.entity";
const userFlightRepository = AppDataSource.getRepository(UserFlightTypeORM)


const FlightsDatabase = require("../../models/userFlight.mongo");
const cheerio = require("cheerio")
console.log("Started skyscannerHomepage")

const skyscannerHomePage = async (page: any, userFlight: UserFlightTypeORM) => {
  await page.goto("https://www.skyscanner.net?currency=GBP&locale=en-GB&market=UK", { waitUntil: "networkidle0", timeout: 60000 });

  const UserFlight = await userFlightRepository.findOneBy({ ref: userFlight.ref });
  console.log("fired");
  if (!UserFlight) return false

  // Accept TOS
  await page.waitForSelector("html.bpk-no-touch-support body.fonts_fontsLoaded__YjBmN div#modal-container div div.bpk-scrim-content_bpk-scrim-content__NGQwN.UserPreferencesDialog_dialog__ZDMxO section#user-preferences-dialog.BpkDialogInner_bpk-dialog-inner__ZDdlM.undefined div.BpkDialogInner_bpk-dialog-inner__content__N2U4M div.UserPreferencesContent_container__OTcyO div.UserPreferencesContent_buttonsWrapper__Yjc4N button.BpkButtonBase_bpk-button__NmRiZ.UserPreferencesContent_buttons__YTQ4Y.UserPreferencesContent_acceptButton__NjQxZ")
  await page.click("html.bpk-no-touch-support body.fonts_fontsLoaded__YjBmN div#modal-container div div.bpk-scrim-content_bpk-scrim-content__NGQwN.UserPreferencesDialog_dialog__ZDMxO section#user-preferences-dialog.BpkDialogInner_bpk-dialog-inner__ZDdlM.undefined div.BpkDialogInner_bpk-dialog-inner__content__N2U4M div.UserPreferencesContent_container__OTcyO div.UserPreferencesContent_buttonsWrapper__Yjc4N button.BpkButtonBase_bpk-button__NmRiZ.UserPreferencesContent_buttons__YTQ4Y.UserPreferencesContent_acceptButton__NjQxZ");


  // Grab all info you want from here
  const originDestination = "#originInput-input";
  const arrivalDestination = "#destinationInput-input";
  const originInput = "#app-root > div.Routes_container__ODc5Z > div > main > div.Homepage_searchControlsContainer__ZWI2N > div > div > div > div.DateSearchControlsGroup_desktopDatesContainer__ZWZkZ.DateSearchControlsGroup_flexibilDateContainer__ODI1M > div:nth-child(1)";
  const originInputWholeMonth = 'button.BpkSelectableChip_bpk-chip__MjMxO:nth-child(2) > span:nth-child(1) > span:nth-child(1)'
  const originInputCheapestMonth =
    '#app-root > div.Routes_container__ODc5Z > div > main > div.Homepage_searchControlsContainer__ZWI2N > div > div > div > div.DateSearchControlsGroup_desktopDatesContainer__ZWZkZ.DateSearchControlsGroup_flexibilDateContainer__ODI1M > div.SearchControlSelectorPopOver_container__ZTFjM.DateSearchControlsGroup_newDatesSelectorPopover__Y2YyN.DateSearchControlsGroup_datesSelectorPopover__NGVhM > div > div.DatePicker_form__Yzg4N > section > div > div:nth-child(1) > button'
  const arrivalInput = '#app-root > div.Routes_container__ODc5Z > div > main > div.Homepage_searchControlsContainer__ZWI2N > div > div > div > div.DateSearchControlsGroup_desktopDatesContainer__ZWZkZ.DateSearchControlsGroup_flexibilDateContainer__ODI1M > div:nth-child(2) > div > button > span.BpkText_bpk-text__OTg0N.BpkText_bpk-text--body-default__N2U4M.SearchControlButton_placeholder__MThkM';
  const arrivalInputCheapestMonth = '#app-root > div.Routes_container__ODc5Z > div > main > div.Homepage_searchControlsContainer__ZWI2N > div > div > div > div.DateSearchControlsGroup_desktopDatesContainer__ZWZkZ.DateSearchControlsGroup_flexibilDateContainer__ODI1M > div.SearchControlSelectorPopOver_container__ZTFjM.DateSearchControlsGroup_newDatesSelectorPopover__Y2YyN.DateSearchControlsGroup_datesSelectorPopover__NGVhM > div > div.DatePicker_form__Yzg4N > section > div > div:nth-child(1) > button'
  // await page.waitForTimeout(1000000)

  // Setting up from and away
  await page.focus(originDestination);
  await page.waitForTimeout(300);
  await page.keyboard.type(UserFlight.flights.departure);
  await page.waitForTimeout(1000);
  await page.keyboard.press('ArrowDown');
  await page.keyboard.press("Enter");

  // Setting up from and away
  await page.focus(arrivalDestination);
  await page.waitForTimeout(300);
  await page.keyboard.type(UserFlight.flights.arrival);
  await page.waitForTimeout(1000);
  await page.keyboard.press('ArrowDown');
  await page.keyboard.press("Enter");

  // CHECKING
  let verifyNames = true;
  const $ = cheerio.load(await page.content())
  const originDestinationVerification = $(originDestination).val()
  const arrivalDestinationVerification = $(arrivalDestination).val()
  if ((originDestinationVerification.includes(UserFlight.flights.departure)) || (arrivalDestinationVerification.includes(UserFlight.flights.arrival))) {
    console.log("All good")
  } else {
    console.log(`${originDestinationVerification} - ${UserFlight.flights.departure} and ${arrivalDestinationVerification} - ${UserFlight.flights.arrival}`)
    console.log("FALSE FALSE FALSE")
    verifyNames = false
  }

  await page.waitForTimeout(2000)

  console.log("Names correct move on")

  // Clicking Cheapest month setup
  await page.click(originInput);
  console.log("Before")
  await page.waitForSelector(originInputWholeMonth);
  console.log("After")
  await page.waitForTimeout(100);
  await page.click(originInputWholeMonth);
  await page.waitForSelector(originInputCheapestMonth);
  await page.waitForTimeout(100);
  await page.click(originInputCheapestMonth);
  await page.waitForTimeout(100);
  await page.click(arrivalInput);
  await page.waitForSelector(arrivalInputCheapestMonth);
  await page.waitForTimeout(100);
  await page.click(arrivalInputCheapestMonth);

  // Submit Page
  await page.waitForTimeout(2000);

  await page.click(
    "#app-root > div.Routes_container__ODc5Z > div > main > div.Homepage_searchControlsContainer__ZWI2N > div > div > div > button"
  );
  await page.click(
    "#app-root > div.Routes_container__ODc5Z > div > main > div.Homepage_searchControlsContainer__ZWI2N > div > div > div > button"
  );
  // console.log(page)

  await page.waitForTimeout(2000);
  let url = await page.url()
  console.log(url)
  // done
  return { page, url, verifyNames };
};

module.exports = skyscannerHomePage;

export default skyscannerHomePage
