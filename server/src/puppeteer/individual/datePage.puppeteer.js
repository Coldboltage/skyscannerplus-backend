const FlightsDatabase = require("../../models/userFlight.mongo");
const cheerio = require("cheerio");

// Puppeteer Package
const processPage = require("./processPage.puppeteer");
const { Browser } = require("puppeteer");

const monthNames = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
];

const datePage = async (page, browser) => {
  console.log("Entered Date page");
  const userFlight = await FlightsDatabase.findOne({
    _id: "626c131504a5343611d12787",
  });
  const html = await page.content();
  const $ = cheerio.load(html);

  const departureDate = {
    fullDate: +userFlight.dates.departureDate.getTime(),
    date: userFlight.dates.departureDate.getUTCDate(),
    month: userFlight.dates.departureDate.getUTCMonth(),
  };

  const returnDate = {
    fullDate: +userFlight.dates.returnDate.getTime(),
    date: +userFlight.dates.returnDate.getUTCDate(),
    month: +userFlight.dates.returnDate.getUTCMonth(),
  };

  const minimalHolidayInMili = userFlight.dates.minimalHoliday * 86400000;

  console.log(departureDate.fullDate);
  console.log(returnDate.fullDate);

  const departArriveDifference =
    (returnDate.fullDate - departureDate.fullDate) / 86400000;
  console.log(
    `Days difference between return and depart: ${departArriveDifference}`
  );

  // Have selectors ready
  const departGraph = {
    fullGraph: ".month-view-chart-with-month-selector:nth-child(1)",
    monthSelector: "#outbound_select",
    radioButtons:
      ".month-view-chart-with-month-selector:nth-child(1) .bar-chart",
  };

  const returnGraph = {
    fullGraph: ".month-view-chart-with-month-selector:nth-child(2)",
    monthSelector: "#inbound_select",
    radioButtons:
      ".month-view-chart-with-month-selector:nth-child(2) .bar-chart",
  };

  // Test out loops
  // We know what the first day is,  = 1
  // We know the minimal holiday = 14
  // We know for certain the end day = 21
  // We know that when we iterate over the 2nd loop to it's end, we add one, simple

  // Select ChartMode
  await page.waitForTimeout(2000);
  await page.waitForSelector(
    "#app-root > div > div > div:nth-child(1) > div > div:nth-child(3) > div.month-view__card > div.month-view__tabbed-panels > div:nth-child(2) > div > div.CalendarChartSwitch > button:nth-child(2) > p"
  );
  await page.click(
    "#app-root > div > div > div:nth-child(1) > div > div:nth-child(3) > div.month-view__card > div.month-view__tabbed-panels > div:nth-child(2) > div > div.CalendarChartSwitch > button:nth-child(2) > p"
  );

  //  Add day reps the amount of days added to the depart day.
  for (
    let addDepartDay = 0;
    addDepartDay + userFlight.dates.minimalHoliday <= departArriveDifference;
    addDepartDay++
  ) {
    // Find out Day
    const departPickDay = new Date(
      departureDate.fullDate + addDepartDay * 86400000
    ).getDate();
    const departPickMonth = new Date(
      departureDate.fullDate + addDepartDay * 86400000
    ).getMonth();
    const departPickYear = new Date(
      departureDate.fullDate + addDepartDay * 86400000
    ).getFullYear();

    console.log(``);
    console.log(`#############################################`);
    console.log(
      `Departing: Click for ${departPickDay} ${monthNames[departPickMonth]}`
    );
    console.log(`---------------------------------------------`);

    // Check the month
    await page.waitForTimeout(200);
    await page.click(departGraph.monthSelector);
    await page.waitForTimeout(300);
    console.log("Selecting");
    await page.keyboard.type(`${monthNames[departPickMonth]}`);
    await page.keyboard.press("Enter");
    console.log("selected");
    // Check Day
    await page.waitForTimeout(1000)
    await page.click(`#app-root > div > div > div:nth-child(1) > div > div:nth-child(3) > div.month-view__card > div.month-view__tabbed-panels > div:nth-child(2) > div > div:nth-child(2) > div > div.month-view-charts.clearfix > div > div:nth-child(1) > div.month-view-chart-area > div > div > div.chart-area > div > button:nth-child(${departPickDay}) > div.radio-wrapper > label > input`)

    for (
      let addReturnDay = 0;
      userFlight.dates.minimalHoliday + addDepartDay + addReturnDay <=
      departArriveDifference;
      addReturnDay++
    ) {
      // Test Calculation
      const daysToAdd =
        userFlight.dates.minimalHoliday + addDepartDay + addReturnDay;
      const daysToAddInMili = daysToAdd * 86400000;
      // add start + days needed
      const returnDateInMili = departureDate.fullDate + daysToAddInMili;
      const returnDateWithDate = new Date(returnDateInMili).getDate();
      const returnDateWithMonth = new Date(returnDateInMili).getMonth();
      const returnDateWithYear = new Date(returnDateInMili).getFullYear();
      console.log(
        `Returning: Click for ${returnDateWithDate} ${monthNames[returnDateWithMonth]}`
      );

      await page.waitForTimeout(1000);
      await page.click(returnGraph.monthSelector);
      await page.waitForTimeout(200);
      console.log("Selecting");
      await page.keyboard.type(`${monthNames[returnDateWithMonth]}`);
      await page.keyboard.press("Enter");
      console.log("let's have a look");
      await page.waitForTimeout(300)
      await page.click(`#app-root > div > div > div:nth-child(1) > div > div:nth-child(3) > div.month-view__card > div.month-view__tabbed-panels > div:nth-child(2) > div > div:nth-child(2) > div > div.month-view-charts.clearfix > div > div:nth-child(3) > div.month-view-chart-area > div > div > div.chart-area > div > button:nth-child(${returnDateWithDate}) > div.radio-wrapper > label > input`)
      await page.waitForTimeout(500)
      await page.click("#app-root > div > div > div:nth-child(1) > div > div:nth-child(3) > div.month-view__card > div.month-view__ctas.month-view__ctas--variant > div.month-view__trip-summary.month-view-variant__trip-summary > div.month-view-variant__trip-summary-container > div:nth-child(2) > div > button > span")
      await page.waitForTimeout(1000)
      const pages = await browser.pages()
      const flightDateCheckupPage = pages[1]
      await processPage(flightDateCheckupPage)
    }
  }
};

module.exports = datePage;
