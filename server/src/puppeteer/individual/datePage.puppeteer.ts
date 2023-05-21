import { Page, Browser, Puppeteer } from "puppeteer";

import FlightsDatabase from "../../models/userFlight.mongo";
import cheerio from "cheerio";

// Puppeteer Package
import processPage from "./processPage.puppeteer";
import { DepartureDate, ScanDateORM, UserFlightTypeORM } from "../../entity/user-flight.entity";
import { AppDataSource } from "../../data-source";
const UserFlightTypeORMDatabase = AppDataSource.getRepository(UserFlightTypeORM)
const UserFlightScanDateDatabase = AppDataSource.getRepository(ScanDateORM)
const UserFlightDepartureDateDatabase = AppDataSource.getRepository(DepartureDate)

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

const datePage = async (
  page: Page,
  browser: any,
  newUser: UserFlightTypeORM,
  puppeteer: any,
  pageURL: string,
  verifyNames: any
) => {
  console.log("Entered Date page");

  await page.waitForTimeout(1000);
  const userFlight = await UserFlightTypeORMDatabase.findOneBy({ ref: newUser.ref });
  if (!userFlight) return false
  if (verifyNames === false) {
    console.log(`We are returning false from datePage`);
    userFlight.isBeingScanned = false;
    userFlight.workerPID = 0;
    await UserFlightTypeORMDatabase.update({ id: userFlight.id }, { isBeingScanned: false, workerPID: 0 });
    await browser.close();
    return false;
  }
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
  const todaysDateParsed = todaysDate.getTime()
  const nextScan = new Date(todaysDateParsed + 43200000);

  // Setup Scan Date
  const flightScannerObject = {
    dateOfScanLoop: todaysDate,
    departureDate: [],
  };

  console.log(flightScannerObject);

  //  Add day reps the amount of days added to the depart day.
  // Resumability: Check if failed.
  let scanDateIndexBegin = null;
  let departDateIndexBegin = null;
  // let returnDateIndexBegin = null;
  // let resumeScanOrNot = null
  // let resumeScanOrNot =
  //   userFlight.lastUpdated >= new Date().getTime() - 3600000;

  // Push an empty array at the bottom of scanDate which will be empty
  // const newScan = {
  //   dateOfScanLoop: new Date(),
  //   departureDate: [],
  // };
  // console.log(newScan);


  // if (resumeScanOrNot) {

    // 1) Check departDay and index number
    // const resumeScan = await FlightsDatabase.findOne({
    //   ref: newUser.ref,
    // });
    // const scanDateIndexResume = resumeScan.scanDate.length - 1;
    // const departureDateIndexResume =
    //   resumeScan.scanDate[0 >= scanDateIndexResume ? 0 : scanDateIndexResume].departureDate
    //     .length - 1;

    // const departureDatePush = await UserFlightTypeORMDatabase.findOneBy({
    //   ref: userFlight.ref,
    // });
    // if (!departureDatePush) return false
    // if (!departureDatePush.scanDate) return false
    // const scanDateIndexResume =
    //   departureDatePush.scanDate.length - 1 <= 0
    //     ? 0
    //     : departureDatePush.scanDate.length - 1;

    // if (!departureDatePush.scanDate[scanDateIndexResume].departureDate) return false
    // if (!scanDate.departureDate) return false
    // console.log(scanDate.departureDate.length)
    // const departureDateIndexResume =
    //   departureDatePush.scanDate[scanDateIndexResume].departureDate.length <=
    //     0
    //     ? 0
    //     : departureDatePush.scanDate[scanDateIndexResume].departureDate.length;

    // // const returnDateIndexResume =
    // //   departureDatePush.scanDate[scanDateIndexResume].departureDate[
    // //     departureDateIndexResume
    // //   ].returnDates.length -
    // //     1 <=
    // //   0
    // //     ? 0
    // //     : departureDatePush.scanDate[scanDateIndexResume].departureDate[
    // //         departureDateIndexResume
    // //       ].returnDates.length - 1;

    // // Actual Index
    // var scanDateActualIndexResume = departureDatePush.scanDate.length;
    // var departureDateActualIndexResume =
    //   departureDatePush.scanDate[scanDateIndexResume].departureDate.length;

    // console.log(
    //   `What is departureDateActualIndexResume: ${departureDateActualIndexResume}`
    // );
    // console.log(
    //   `What is what is this: ${departureDatePush.scanDate[scanDateIndexResume].departureDate[departureDateIndexResume]}`
    // );

    // scanDateIndexBegin = scanDateIndexResume;
    // departDateIndexBegin = departureDateIndexResume;
    // // returnDateIndexBegin = returnDateIndexResume;

    // console.log(`What is departDateIndexBegin: ${departDateIndexBegin}`);
    // // console.log(`What is returnDateIndexBegin: ${returnDateIndexBegin}`);
    // console.log(
    //   `What is departureDateActualIndexResume: ${departureDateActualIndexResume}`
    // );

  // }
  const scanDate = await UserFlightScanDateDatabase.save({
    dateOfScanLoop: new Date(),
    userFlight
  })
  // 1) Check departDay and index number
  // 2) Check returnDates and it's index number
  // Resumabulity done
  let switchresumeScanOrNot = true;



  for (
    let addDepartDay = 0;
    addDepartDay + userFlight.dates.minimalHoliday <= departArriveDifference;
    addDepartDay++
  ) {
    console.log(`What is addDepartDay: ${addDepartDay}`);
    const departureDateORM = await UserFlightDepartureDateDatabase.save({
      dateString: new Date().toString(),
      scanDate,
    })
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
    const departureDateIteration = {
      date: new Date(
        departureDate.fullDate + addDepartDay * 86400000
      ),
      month: new Date(
        departureDate.fullDate + addDepartDay * 86400000
      ).getMonth(),
      dateString: new Date(
        departureDate.fullDate + addDepartDay * 86400000
      ).toDateString(),
      day: new Date(
        departureDate.fullDate + addDepartDay * 86400000
      ).getDay(),
      year: new Date(
        departureDate.fullDate + addDepartDay * 86400000
      ).getFullYear(),
      time: new Date(
        departureDate.fullDate + addDepartDay * 86400000
      ).getTime()
    }

    console.log(`How many times has this been fired ${addDepartDay}`);

    // Check the month
    await page.waitForTimeout(200);
    console.log("Select Month");
    await page.waitForTimeout(200);
    // Check Day
    await page.waitForTimeout(200);


    console.log(addDepartDay);

    //  Before the first for loop is started
    console.log("As we now have a new day, creating new");

    // const departureDatePush = await FlightsDatabase.findOne({
    //   ref: newUser.ref,
    // });
    // const scanDateIndex = departureDatePush.scanDate.length - 1;
    // const departureDateIndex =
    //   departureDatePush.scanDate[0 >= scanDateIndex ? 0 : scanDateIndex]
    //     .departureDate.length - 1;

    const departDateArray = {
      date: new Date(),
      dateString: departureDateIteration.dateString,
      returnDates: [],
    };

    // console.log("Creating new date");
    // departureDatePush.scanDate[
    //   0 >= scanDateIndex ? 0 : scanDateIndex
    // ].departureDate.push(departDateArray);

    // await departureDatePush.save();
    // console.log("departureDatePush.save() done");
    await page.waitForTimeout(1000);
    // returnDateActualIndexResume = 0;

    console.log(
      "Checking to see if departureDay is less than current day of scan commencing"
    );
    if (departureDateIteration.time < new Date().getTime()) {
      console.log(
        "DepartureDate is less than current day. The day has literally passed the day of scanning"
      );
      continue;
    }
    for (
      let addReturnDay = 0;
      userFlight.dates.minimalHoliday + addDepartDay + addReturnDay <=
      departArriveDifference &&
      userFlight.dates.minimalHoliday + addReturnDay <=
      userFlight.dates.maximumHoliday;
      addReturnDay++
    ) {

      console.log(`What is addReturnDay: ${addReturnDay}`);

      await page.waitForTimeout(200);
      // Test
      console.log("Firing second loop");
      await UserFlightTypeORMDatabase.update({ id: userFlight.id }, { lastUpdated: new Date() })
      // Test Calculation
      const daysToAdd =
        userFlight.dates.minimalHoliday + addDepartDay + addReturnDay;
      const daysToAddInMili = daysToAdd * 86400000;
      // add start + days needed
      const returnDateInMili = departureDate.fullDate + daysToAddInMili;
      const returnDateWithDate = new Date(returnDateInMili).getDate();
      const returnDateWithMonth = new Date(returnDateInMili).getMonth();
      const returnDateWithYear = new Date(returnDateInMili).getFullYear();
      const returnDateWithDay = new Date(returnDateInMili).getDay();

      let requiredDayStart
      let requiredDayEnd

      // Setting up requiredDates here
      if (userFlight.dates.requiredDayStart && userFlight.dates.requiredDayEnd) {
        requiredDayStart = new Date(
          userFlight.dates.requiredDayStart
        ).getTime();
        requiredDayEnd = new Date(
          userFlight.dates.requiredDayEnd
        ).getTime();
      }

      // departureDateIteration.time = lower than requiredDayStart
      // returnDateInMili = higher than requiredDayEnd

      // FUNCTION SETS
      // If a function has to end, check to see if we beed to push or not
      const checkIfLastDay = () => {
        if (
          userFlight.dates.minimalHoliday + addReturnDay ===
          userFlight.dates.maximumHoliday ||
          userFlight.dates.minimalHoliday + addDepartDay + addReturnDay ===
          departArriveDifference
        ) {
          console.log("pushed departureDateIteration");
          // flightScannerObject.departureDate.push(departureDateIteration);
          console.log(flightScannerObject);
        }
      };

      console.log(
        `Returning: Click for ${returnDateWithDate} ${monthNames[returnDateWithMonth]}`
      );
      if (requiredDayStart && requiredDayEnd) {
        console.log("############");
        console.log("############");
        console.log("############");
        console.log("testing");
        console.log(
          departureDateIteration.time > requiredDayStart &&
          requiredDayEnd < returnDateInMili
        );
        console.log(new Date(departureDateIteration.time));
        console.log(new Date(requiredDayStart));
        console.log(new Date(requiredDayEnd));
        console.log(new Date(returnDateInMili));
        console.log("############");
        console.log(departureDateIteration.time);
        console.log(requiredDayStart);
        console.log(requiredDayEnd);
        console.log(returnDateInMili);
        console.log("############");
        console.log("############");
        // Check to see if user has required days
        console.log(
          `departureDateIteration.time < requiredDayStart: ${departureDateIteration.time < requiredDayStart
          }`
        );
        console.log(
          `requiredDayEnd < returnDateInMili: ${requiredDayEnd < returnDateInMili
          }`
        );
        if (
          (departureDateIteration.time < requiredDayStart &&
            requiredDayEnd < returnDateInMili) ||
          (isNaN(requiredDayStart) && isNaN(requiredDayEnd))
        ) {
          console.log("Good date");
        } else {
          console.log("we got a wee false here");
          checkIfLastDay();
          continue;
        }
      }

      console.log(userFlight.dates.weekendOnly);
      console.log(departureDateIteration.day);
      console.log(returnDateWithDay);
      // Check if weekend has been added or not
      if (userFlight.dates.weekendOnly) {
        // if (departingDay = Friday and returnDay = Sunday) {
        if (departureDateIteration.day === 5 && returnDateWithDay === 0) {
          console.log("Weekend special, all good to go!");
        } else {
          console.log(
            "This is a weekend special but either departing day or return day incorrect"
          );
          checkIfLastDay();
          continue;
        }
      }

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
      let fullURL = pageURL;
      let removeFront = fullURL.replace(
        "https://www.skyscanner.net/transport/flights/",
        ""
      );
      let firstSlash = removeFront.indexOf("/");
      let firstCode = removeFront.slice(0, firstSlash);
      let removeFirstSlash = removeFront.replace("/", "");
      let removeFirstCode = removeFirstSlash.replace(firstCode, "");
      let secondSlash = removeFirstCode.indexOf("/");
      let secondCode = removeFirstCode.slice(0, secondSlash);

      const addZeroMonth = (month: number) => {
        if (month + 1 < 10) {
          return `0${month + 1}`;
        } else {
          return `${month + 1}`;
        }
      };

      const addZeroDate = (date: number) => {
        if (date < 10) {
          console.log(date);
          console.log(`0${date}`);
          return `0${date}`;
        } else {
          return date;
        }
      };
      // Check if there's passengers or not

      // Setup Info

      // let url = `https://www.skyscanner.net/transport/flights/${firstCode}/${secondCode}/${
      //   departureDateIteration.year - 2000
      // }${addZeroMonth(departureDateIteration.month)}${addZeroDate(
      //   departureDateIteration.date.getDate()
      // )}/${returnDateWithYear - 2000}${addZeroMonth(
      //   returnDateWithMonth
      // )}${addZeroDate(returnDateWithDate)}/?rtn=1&stops=direct,!twoPlusStops`;
      // Test URL

      // Create a condition for the second date, that if one way is true, the second date will become blank rather than be populated.
      console.log(
        `Is returnFlight true or false:${userFlight.flights.returnFlight === true
        }`
      );
      let url = `https://www.skyscanner.net/transport/flights/${firstCode}/${secondCode}/${departureDateIteration.year - 2000
        }${addZeroMonth(departureDateIteration.month)}${addZeroDate(
          departureDateIteration.date.getDate()
        )}${userFlight.flights.returnFlight === true
          ? `/${returnDateWithYear - 2000}${addZeroMonth(
            returnDateWithMonth
          )}${addZeroDate(returnDateWithDate)}/?rtn=1&stops=direct&adultsv2=${userFlight.flights.passengers || 1
          }&currency=${userFlight.currency.currencyCode}`
          : `?rtn=0&stops=direct&adultsv2&currency=${userFlight.currency.currencyCode}`
        }

      `;
      console.log("###### ✅✅✅✅✅✅✅✅ ######")
      // await page.waitForTimeout(2000000);
      // await new Promise((r) => setTimeout(r, 20000000));
      await page.goto(url, { waitUntil: "domcontentloaded", timeout: 100000 });
      const returnInformationObject = await processPage(
        page,
        returnDateInMili,
        departureDateIteration,
        userFlight,
        newUser,
        departureDateORM
      );

      await browser.close();
      browser = await puppeteer.launch({
        headless: false,
        args: [
          "--no-sandbox",
          "--disable-setuid-sandbox",
          "--disable-background-timer-throttling",
          "--disable-backgrounding-occluded-windows",
          "--disable-renderer-backgrounding",
        ],
      });
      page = await browser.newPage();
      await page.setRequestInterception(true);

      const rejectRequestPattern = [
        "googlesyndication.com",
        "/*.doubleclick.net",
        "/*.amazon-adsystem.com",
        "/*.adnxs.com",
        "/*.nr-data.net",
      ];
      const blockList = [];

      page.on("request", (request) => {
        if (
          rejectRequestPattern.find((pattern) => request.url().match(pattern))
        ) {
          blockList.push(request.url());
          request.abort();
        } else if (request.resourceType() === "image") {
          request.abort();
        } else {
          request.continue();
        }
      });
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
        continue;
      }

      // departureDateIteration.returnDates.push(returnInformationObject);

      console.log(
        `userFlight.dates.minimalHoliday = ${userFlight.dates.minimalHoliday}`
      );
      console.log(`addReturnDay = ${addReturnDay}`);
      console.log(
        `userFlight.dates.maximumHoliday = ${userFlight.dates.maximumHoliday}`
      );

      if (
        userFlight.dates.minimalHoliday + addReturnDay ===
        userFlight.dates.maximumHoliday ||
        userFlight.dates.minimalHoliday + addDepartDay + addReturnDay ===
        departArriveDifference
      ) {
        console.log("pushed departureDateIteration");
        // flightScannerObject.departureDate.push(departureDateIteration);
        console.log(flightScannerObject);
      }
    }
  }
  console.log("Saving information");
  console.log(flightScannerObject);
  // userFlight.scanDate.push(flightScannerObject);
  console.log("Applying Database Changed to isBeingScanned and workerPID");
  userFlight.isBeingScanned = false;
  userFlight.workerPID = 0;
  userFlight.scannedLast = new Date()
  userFlight.nextScan = nextScan;
  userFlight.lastUpdated = new Date();
  userFlight.status = "completed";
  await UserFlightTypeORMDatabase.update({ id: userFlight.id }, {
    isBeingScanned: false,
    workerPID: 0,
    scannedLast: new Date(),
    nextScan: nextScan,
    lastUpdated: new Date(),
    status: "completed"
  });

  console.log("Saved");
  await browser.close();
  return true;
};

module.exports = datePage;
export default datePage
