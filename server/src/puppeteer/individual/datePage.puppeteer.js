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

const datePage = async (page, browser, newUser) => {

  console.log("Entered Date page");
  const userFlight = await FlightsDatabase.findOne({ ref: newUser.ref });
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
  // await page.waitForTimeout(2000);
  // console.log(await page.url());
  // // await page.screenshot({ path: 'test.png' });
  // await page.waitForSelector(
  //   "#app-root > div > div > div:nth-child(1) > div > div:nth-child(3) > div.month-view__card > div.month-view__tabbed-panels > div:nth-child(2) > div > div.CalendarChartSwitch > button:nth-child(2) > p"
  // );
  // await page.click(
  //   "#app-root > div > div > div:nth-child(1) > div > div:nth-child(3) > div.month-view__card > div.month-view__tabbed-panels > div:nth-child(2) > div > div.CalendarChartSwitch > button:nth-child(2) > p"
  // );

  // Get Todays Date
  const todaysDate = new Date();

  // Setup Scan Date
  const flightScannerObject = {
    dateOfScanLoop: todaysDate,
    departureDate: [],
  };

  console.log(flightScannerObject);

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

    // Add departureDate to flightScannerObject
    const departureDateIteration = {};

    departureDateIteration.date = new Date(
      departureDate.fullDate + addDepartDay * 86400000
    );
    departureDateIteration.month = new Date(
      departureDate.fullDate + addDepartDay * 86400000
    ).getMonth();
    departureDateIteration.dateString = new Date(
      departureDate.fullDate + addDepartDay * 86400000
    ).toDateString();

    departureDateIteration.year = new Date(
      departureDate.fullDate + addDepartDay * 86400000
    ).getFullYear();
    departureDateIteration.returnDates = [];
    console.log(`How many times has this been fired ${addDepartDay}`);

    // Check the month
    await page.waitForTimeout(200);
    // await page.waitForSelector(departGraph.monthSelector);
    // await page.click(departGraph.monthSelector);
    console.log("Select Month");
    await page.waitForTimeout(200);
    // console.log("Selecting");
    // await page.keyboard.type(
    //   `${monthNames[departPickMonth]} ${departPickYear}`
    // );
    // await page.keyboard.press("Enter");
    // console.log("selected");
    // Check Day
    await page.waitForTimeout(200);
    // await page.waitForSelector(
    //   `#app-root > div > div > div:nth-child(1) > div > div:nth-child(3) > div.month-view__card > div.month-view__tabbed-panels > div:nth-child(2) > div > div:nth-child(2) > div > div.month-view-charts.clearfix > div > div:nth-child(1) > div.month-view-chart-area > div > div > div.chart-area > div > button:nth-child(${departPickDay}) > div.radio-wrapper > label > input`
    // );
    // await page.click(
    //   `#app-root > div > div > div:nth-child(1) > div > div:nth-child(3) > div.month-view__card > div.month-view__tabbed-panels > div:nth-child(2) > div > div:nth-child(2) > div > div.month-view-charts.clearfix > div > div:nth-child(1) > div.month-view-chart-area > div > div > div.chart-area > div > button:nth-child(${departPickDay}) > div.radio-wrapper > label > input`
    // );

    console.log(addDepartDay);
    for (
      let addReturnDay = 0;
      userFlight.dates.minimalHoliday + addDepartDay + addReturnDay <=
      departArriveDifference;
      addReturnDay++
    ) {
      console.log("Firing second loop");
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

      // await page.waitForTimeout(200);
      // await page.click(returnGraph.monthSelector);
      // await page.waitForTimeout(200);
      // console.log("Selecting");
      // await page.keyboard.type(
      //   `${monthNames[returnDateWithMonth]} ${returnDateWithYear}`
      // );
      // await page.keyboard.press("Enter");
      // console.log("let's have a look");
      // await page.waitForTimeout(200);
      // await page.waitForSelector(
      //   `#app-root > div > div > div:nth-child(1) > div > div:nth-child(3) > div.month-view__card > div.month-view__tabbed-panels > div:nth-child(2) > div > div:nth-child(2) > div > div.month-view-charts.clearfix > div > div:nth-child(3) > div.month-view-chart-area > div > div > div.chart-area > div > button:nth-child(${returnDateWithDate}) > div.radio-wrapper > label > input`
      // );
      // console.log("fired");
      // await page.click(
      //   `#app-root > div > div > div:nth-child(1) > div > div:nth-child(3) > div.month-view__card > div.month-view__tabbed-panels > div:nth-child(2) > div > div:nth-child(2) > div > div.month-view-charts.clearfix > div > div:nth-child(3) > div.month-view-chart-area > div > div > div.chart-area > div > button:nth-child(${returnDateWithDate}) > div.radio-wrapper > label > input`
      // );
      // await page.click(
      //   "#app-root > div > div > div:nth-child(1) > div > div:nth-child(3) > div.month-view__card > div.month-view__ctas.month-view__ctas--variant > div.month-view__trip-summary.month-view-variant__trip-summary > div.month-view-variant__trip-summary-container > div:nth-child(2) > div > button > span"
      // );
      // await page.waitForTimeout(1500);

      // Dunnno regex so using forEach for this.
      const fullURL = await page.url();
      const removeFront = fullURL.replace(
        "https://www.skyscanner.net/transport/flights/",
        ""
      );
      const firstSlash = removeFront.indexOf("/");
      const firstCode = removeFront.slice(0, firstSlash);
      const removeFirstSlash = removeFront.replace("/", "");
      const removeFirstCode = removeFirstSlash.replace(firstCode, "");
      const secondSlash = removeFirstCode.indexOf("/");
      const secondCode = removeFirstCode.slice(0, secondSlash);

      const addZeroMonth = (month) => {
        if (month + 1 < 10) {
          return `0${month + 1}`;
        } else {
          return `${month + 1}`;
        }
      };

      const addZeroDate = (date) => {
        if (date < 10) {
          console.log(date);
          console.log(`0${date}`);
          return `0${date}`;
        } else {
          return date;
        }
      };

      // Setup Info

      let url = `https://www.skyscanner.net/transport/flights/${firstCode}/${secondCode}/${
        departureDateIteration.year - 2000
      }${addZeroMonth(departureDateIteration.month)}${addZeroDate(
        departureDateIteration.date.getDate()
      )}/${returnDateWithYear - 2000}${addZeroMonth(
        returnDateWithMonth
      )}${addZeroDate(returnDateWithDate)}/?rtn=1&stops=direct,!twoPlusStops`;
      // Test URL
      // let url = `https://www.skyscanner.net/transport/flights/${firstCode}/${secondCode}/${departureDateIteration.year - 2000}${addZeroMonth(departureDateIteration.month)}${addZeroDate(departureDateIteration.date.getDate())}/${returnDateWithYear - 2000}${addZeroMonth(returnDateWithMonth)}${addZeroDate(returnDateWithDate)}/?rtn=1&stops=direct`;

      console.log(url);

      const flightDateCheckupPage = await browser.newPage();
      await flightDateCheckupPage.goto(url);
      const returnInformationObject = await processPage(
        flightDateCheckupPage,
        returnDateInMili,
        departureDateIteration
      );
      console.log("Info here");
      console.log(returnInformationObject);
      // Create return date Object
      // const returnInformation = {
      //   date: new Date(returnDateInMili),
      //   dateString: new Date(returnDateInMili).toString(),
      //   url: await page.url(),
      //   cheapest: { cost: 13.37, time: "14:00", arrival: "19:00" },
      // };

      if (returnInformationObject === false) {
        continue
      }

      departureDateIteration.returnDates.push(returnInformationObject);

      if (
        userFlight.dates.minimalHoliday + addDepartDay + addReturnDay ===
        departArriveDifference
      ) {
        flightScannerObject.departureDate.push(departureDateIteration);
      }
    }
  }
  console.log("Saving information");
  console.log(flightScannerObject);
  userFlight.scanDate.push(flightScannerObject);
  userFlight.isBeingScanned = false
  userFlight.workerPID = 0
  await userFlight.save();
  console.log("Saved");

  await browser.close();
};

module.exports = datePage;
