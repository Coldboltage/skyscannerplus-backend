const skyscannerHomePage = async (page) => {
  await page.goto("https://www.skyscanner.net/#/date-picker", {
    waitUntil: "networkidle2",
  });

  // Accept TOS
  await page.click("#acceptCookieButton")

  // Grab all info you want from here
  const originDestination = "#fsc-origin-search";
  const arrivalDestination = "#fsc-destination-search";
  const originInput = "#depart-fsc-datepicker-button"
  const originInputWholeMonth = "#depart-fsc-datepicker-popover > div > div > div.BpkMobileScrollContainer_bpk-mobile-scroll-container__ZmY2O.bpk-horizontal-nav.BpkHorizontalNav_bpk-horizontal-nav--show-default-underline__ZWM0M.FlightDatepicker_fsc-datepicker__tab-bar__YzRlM > div > nav > div > div:nth-child(2) > button"
  const originInputCheapestMonth = "#depart-fsc-datepicker-popover > div > div > div.FlightDatepicker_fsc-datepicker__monthselector-container__ZWE4Y > div > button.BpkButtonBase_bpk-button__NTM4Y.BpkButtonSecondary_bpk-button--secondary__MWI2Z.Monthselector_monthselector__wholeyear__NDU5N"
  const arrivalInput = "#return-fsc-datepicker-button"
  const arrivalInputCheapestMonth = "#return-fsc-datepicker-popover > div > div > div.FlightDatepicker_fsc-datepicker__monthselector-container__ZWE4Y > div > button.BpkButtonBase_bpk-button__NTM4Y.BpkButtonSecondary_bpk-button--secondary__MWI2Z.Monthselector_monthselector__wholeyear__NDU5N"

  // Setting up from and away
  await page.focus(arrivalDestination);
  await page.waitForTimeout(100)
  await page.keyboard.type("London");
  await page.keyboard.press('Enter');

  // Clicking Cheapest month setup
  await page.click(originInput)
  await page.waitForSelector(originInputWholeMonth)
  await page.click(originInputWholeMonth)
  await page.waitForSelector(originInputCheapestMonth)
  await page.click(originInputCheapestMonth)

  await page.click(arrivalInput)
  await page.waitForSelector(arrivalInputCheapestMonth)
  await page.click(arrivalInputCheapestMonth)

  // Submit Page
  await page.waitForTimeout(100)
  await page.click("#flights-search-controls-root > div > div > form > div:nth-child(3) > button")

  // done
  return page
}

module.exports = skyscannerHomePage