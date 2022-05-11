const FlightsDatabase = require("../../models/userFlight.mongo");

const skyscannerHomePage = async (page, newUser) => {
  await page.goto("https://www.skyscanner.net", { waitUntil: "networkidle0", timeout: 60000 });
  
  const UserFlight = await FlightsDatabase.findOne({ ref: newUser.ref });
  console.log("fired");

  // Document is now being scanned at this point
  UserFlight.isBeingScanned = true;
  await UserFlight.save();

  // Accept TOS
  await page.waitForSelector("#acceptCookieButton")
  await page.click("#acceptCookieButton");


  // Grab all info you want from here
  const originDestination = "#fsc-origin-search";
  const arrivalDestination = "#fsc-destination-search";
  const originInput = "#depart-fsc-datepicker-button";
  const originInputWholeMonth =
    "#depart-fsc-datepicker-popover > div > div > div.BpkMobileScrollContainer_bpk-mobile-scroll-container__ZmY2O.bpk-horizontal-nav.BpkHorizontalNav_bpk-horizontal-nav--show-default-underline__ZWM0M.FlightDatepicker_fsc-datepicker__tab-bar__YzRlM > div > nav > div > div:nth-child(2) > button";
  const originInputCheapestMonth =
    "#depart-fsc-datepicker-popover > div > div > div.FlightDatepicker_fsc-datepicker__monthselector-container__ZWE4Y > div > button:nth-child(3)";
  const arrivalInput = "#return-fsc-datepicker-button";
  const arrivalInputCheapestMonth =
    "#return-fsc-datepicker-popover > div > div > div.FlightDatepicker_fsc-datepicker__monthselector-container__ZWE4Y > div > button:nth-child(3)";

  console.log("hello");
  // await page.waitForTimeout(1000000)

  // Setting up from and away
  await page.focus(originDestination);
  await page.waitForTimeout(100);
  await page.keyboard.type(UserFlight.flights.departure);
  await page.keyboard.press("Enter");

  // Setting up from and away
  await page.focus(arrivalDestination);
  await page.waitForTimeout(100);
  await page.keyboard.type(UserFlight.flights.arrival);
  await page.keyboard.press("Enter");

  // Clicking Cheapest month setup
  await page.click(originInput);
  await page.waitForSelector(originInputWholeMonth);
  await page.click(originInputWholeMonth);
  await page.waitForSelector(originInputCheapestMonth);
  await page.click(originInputCheapestMonth);

  await page.click(arrivalInput);
  await page.waitForSelector(arrivalInputCheapestMonth);
  await page.click(arrivalInputCheapestMonth);

  // Submit Page
  await page.waitForTimeout(100);
  await page.click(
    "#flights-search-controls-root > div > div > form > div:nth-child(3) > button"
  );
  console.log(page)
  await page.waitForTimeout(5000);
  let url = await page.url()
  console.log(url)
  // done
  return {page, url};
};

module.exports = skyscannerHomePage;
