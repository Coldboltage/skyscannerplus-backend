import priceAlert from "../../courier/priceAlert";
import { DepartureDate, ReturnDatesORM, UserFlightTypeORM } from "../../entity/user-flight.entity";

const cheerio = require("cheerio");
const dayjs = require("dayjs");
const axios = require("axios");
const FlightsDatabase = require("../../models/userFlight.mongo");
const { AppDataSource } = require("../../data-source");
const userFlightTypeORMDatabase = AppDataSource.getRepository(UserFlightTypeORM)
const returnDateORMDatabase = AppDataSource.getRepository(ReturnDatesORM)

const processPage = async (
  page: any,
  returnDateInMili: any,
  departureDateIteration: any,
  userFlight: any,
  newUser: any,
  departureDateORM: DepartureDate
): Promise<ReturnDatesORM> => {
  // try {
  //   console.log("We have fired the cleanup script")
  //   console.log("Tet to see if this will come up after cleanup to confirm changes")
  //   await axios.post("http://host.docker.internal:2375/v1.41/containers/prune", {})
  //   console.log("Fired the call")
  // } catch (error) {
  //   console.log(error)
  // }

  await page.waitForTimeout(1000);
  // await page.reload({ waitUntil: "domcontentloaded", timeout: 300000 });
  await page.waitForTimeout(3000);
  // Check if the page broke
  const isPageBroken = await page.content();
  let $ = cheerio.load(isPageBroken);

  if ($("body").html().includes("wrong") === true) {
    throw new Error('Page did not load');
  } else {
    console.log("Page loaded without error");
  }

  const acceptButton = "#cookieBannerContent > div > div.CookieBanner_cookie-banner__buttons__ZjAzY > button";

  // await page.screenshot({path: "./screenshot.jpg"})
  try {
    await page.waitForSelector('.SummaryInfo_itineraryCountContainer__NWFkN', { timeout: 300000 });
  } catch (error) {
    userFlight.screenshot = await page.screenshot({fullPage: true, encoding: "base64" })
    await userFlight.save();
  }

  if (($(acceptButton).html() === "OK") === true) {
    console.log("Locating cookie button");
    await page.click(acceptButton);
  }

  await page.waitForTimeout(1000);
  await page.keyboard.press("Enter");
  await page.keyboard.press("Enter");
  await page.waitForTimeout(1000);

  // await page.click(
  //   "#stops_content > div > div > div:nth-child(3) > label > input"
  // );
  console.log("Page loaded apprently");
  console.log("Reading Page");

  let divChecker = 1;

  // DOM POINTS. Add them all here with great detail
  // Cheapest
  const cheapestButton = (divChecker: number) =>
    `#app-root > div.FlightsDayView_row__NjQyZ > div > div.FlightsDayView_container__ZjgwY > div.FlightsDayView_results__YjlmM > div:nth-child(1) > div.FqsTabs_fqsTabsWithSparkle__ZDAyO > div:nth-child(2) > button`;
  const flightsDayView = (divChecker: number) =>
    "#app-root > div.FlightsDayView_row__NjQyZ > div > div.FlightsDayView_container__ZjgwY > div.FlightsDayView_results__YjlmM > div:nth-child(1) > div.FlightsResults_dayViewItems__ZDFlO";
  const dataTestId = "[data-testid]";
  const advert = (divChecker: any) =>
    `#app-root > div.FlightsDayView_row__NjQyZ > div > div.FlightsDayView_container__ZjgwY > div.FlightsDayView_results__YjlmM > div:nth-child(1) > div.FlightsResults_dayViewItems__ZDFlO > div:nth-child(${divChecker}) > a`;
  const firstRowCheapest = (divChecker: number) =>
    `#app-root > div.FlightsDayView_row__NjQyZ > div > div.FlightsDayView_container__ZjgwY > div.FlightsDayView_results__YjlmM > div:nth-child(1) > div.FlightsResults_dayViewItems__ZDFlO > div:nth-child(${divChecker}) > div`;
  const firstRowCheapestParent = (divChecker: any) =>
    `#app-root > div.FlightsDayView_row__NjQyZ > div > div.FlightsDayView_container__ZjgwY > div.FlightsDayView_results__YjlmM > div:nth-child(1) > div.FlightsResults_dayViewItems__ZDFlO > div:nth-child(${divChecker}) > div`;
  const cheapestCostText = (divChecker: number) =>
    `#app-root > div.FlightsDayView_row__NjQyZ > div > div > div > div:nth-child(1) > div.FlightsResults_dayViewItems__ZDFlO > div:nth-child(${divChecker}) > div > div > a > div > div.BpkTicket_bpk-ticket__paper__OTA1O.BpkTicket_bpk-ticket__stub__OTgwN.Ticket_stub__NGYxN.BpkTicket_bpk-ticket__stub--padded__YzM0N.BpkTicket_bpk-ticket__stub--horizontal__ZmQzY > div > div > div > span`;
  const cheapestDepartureDepartTimeText = (divChecker: number) =>
    `#app-root > div.FlightsDayView_row__NjQyZ > div > div.FlightsDayView_container__ZjgwY > div.FlightsDayView_results__YjlmM > div:nth-child(1) > div.FlightsResults_dayViewItems__ZDFlO > div:nth-child(${divChecker}) > div > div > a > div > div.BpkTicket_bpk-ticket__paper__OTA1O.BpkTicket_bpk-ticket__main__NmMyM.BpkTicket_bpk-ticket__main--padded__ZjRkZ.BpkTicket_bpk-ticket__main--horizontal__YjNmY > div > div.UpperTicketBody_container__NDcwM > div.UpperTicketBody_legsContainer__ZjcyZ > div:nth-child(1) > div.LegInfo_legInfo__ZGMzY > div.LegInfo_routePartialDepart__NzEwY > span.BpkText_bpk-text__MWZkY.BpkText_bpk-text--lg__NjNhN.LegInfo_routePartialTime__OTFkN > div > span`;
  const cheapestDepartureArrivalTimeText = (divChecker: number) =>
    `#app-root > div.FlightsDayView_row__NjQyZ > div > div.FlightsDayView_container__ZjgwY > div.FlightsDayView_results__YjlmM > div:nth-child(1) > div.FlightsResults_dayViewItems__ZDFlO > div:nth-child(${divChecker}) > div > div > a > div > div.BpkTicket_bpk-ticket__paper__OTA1O.BpkTicket_bpk-ticket__main__NmMyM.BpkTicket_bpk-ticket__main--padded__ZjRkZ.BpkTicket_bpk-ticket__main--horizontal__YjNmY > div > div.UpperTicketBody_container__NDcwM > div.UpperTicketBody_legsContainer__ZjcyZ > div:nth-child(1) > div.LegInfo_legInfo__ZGMzY > div.LegInfo_routePartialArrive__Y2U1N > span.BpkText_bpk-text__MWZkY.BpkText_bpk-text--lg__NjNhN.LegInfo_routePartialTime__OTFkN > div > span`;
  const durationFlight = (divChecker: number) =>
    `#app-root > div.FlightsDayView_row__NjQyZ > div > div.FlightsDayView_container__ZjgwY > div.FlightsDayView_results__YjlmM > div:nth-child(1) > div.FlightsResults_dayViewItems__ZDFlO > div:nth-child(${divChecker}) > div > div > a > div > div.BpkTicket_bpk-ticket__paper__OTA1O.BpkTicket_bpk-ticket__main__NmMyM.BpkTicket_bpk-ticket__main--padded__ZjRkZ.BpkTicket_bpk-ticket__main--horizontal__YjNmY > div > div.UpperTicketBody_container__NDcwM > div.UpperTicketBody_legsContainer__ZjcyZ > div:nth-child(1) > div.LegInfo_legInfo__ZGMzY > div.LegInfo_stopsContainer__NWIyN > span`;
  // Best
  const bestButton = `#app-root > div.FlightsDayView_row__NjQyZ > div > div.FlightsDayView_container__ZjgwY > div.FlightsDayView_results__YjlmM > div:nth-child(1) > div.FqsTabs_fqsTabsWithSparkle__ZDAyO > div:nth-child(1) > button`;
  // const deleteAdvert =
  //   "#app-root > div.FlightsDayView_row__NjQyZ > div > div.FlightsDayView_container__ZjgwY > div.FlightsDayView_results__YjlmM > div:nth-child(1) > div.FlightsResults_dayViewItems__ZDFlO > div.ItineraryInlinePlusWrapper_container__YjM3Y";

  // Cheapest Flights
  await page.click(cheapestButton(divChecker), { clickCount: 2 });

  await page.waitForTimeout(1500);
  await page.waitForTimeout(1500);

  // try {
  //   console.log("Checking for [data-testid]")
  //   await page.waitForSelector("[data-testid]", {timeout: 1000})
  //   await page.$$eval("[data-testid]", el => el.remove())
  // } catch (error) {
  //   console.log("The element didn't appear.")
  //   await page.waitForTimeout(5000);
  // }

  const cheapestHTML = await page.content();
  $ = cheerio.load(cheapestHTML);

  if (
    $(flightsDayView(divChecker)).first().html().includes("ponsored") === true
  ) {
    console.log("################");
    console.log("################");
    console.log("################");
    console.log("Found first child advert");
    console.log("################");
    console.log("################");
    console.log("################");
    divChecker = 2;
    // await page.$eval(flightsDayView, (el) => el.firstChild.remove());
    // await page.waitForTimeout(60000)
  }

  $ = cheerio.load(await page.content());

  $(dataTestId).remove();
  console.log(await page.url());
  if ($(firstRowCheapest(divChecker)).html()) {
    console.log("HTML has been confirmed");
    // await page.waitForTimeout(60000)
  } else {
    console.log("Something is wrong here please check");
    console.log($(dataTestId));
    userFlight.screenshot = await page.screenshot({ encoding: "base64" });
    await userFlight.save();
    await page.waitForTimeout(10000000);
  }

  // if ($(firstRowCheapest).html().includes("deal") !== true) {
  //   if (
  //     $(firstRowCheapestParent).parent().html().includes("ponsored") === true
  //   ) {
  //     $(firstRowCheapestParent).parent().remove();
  //   } else {
  //     $(firstRowCheapestParent).remove();
  //   }
  // }

  // if ($(firstRowCheapest).html().includes("deal") !== true) {
  //   if ($(firstRowCheapest).parent().html().includes("ponsored") === true) {
  //     $(cheapestCostText).parent().remove();
  //   } else {
  //     $(firstRowCheapest).remove();
  //   }
  // }

  const cheapestCost = $(cheapestCostText(divChecker))
    .text()
    .split("")
    .filter((element: string | number) => !isNaN(+element))
    .join("")
    .replace(" ", "");

  const cheapestCostWithCurrency = $(cheapestCostText(divChecker)).text();

  const cheapestDepartureDepartTime = $(
    cheapestDepartureDepartTimeText(divChecker)
  ).text();
  const cheapestDepartureArrivalTime = $(
    cheapestDepartureArrivalTimeText(divChecker)
  ).text();
  const cheapestDepartureDurationFlight = $(durationFlight(divChecker)).text();
  // Best
  await page.waitForTimeout(1500);
  await page.click(bestButton, { clickCount: 2 });

  await page.waitForTimeout(1500);
  const bestHTML = await page.content();
  $ = cheerio.load(bestHTML);

  // $(dataTestId).remove();
  // if ($(firstRowCheapest).html().includes("deal") !== true) {
  //   if ($(firstRowCheapest).parent().html().includes("ponsored") === true) {
  //     $(cheapestCostText).parent().remove();
  //   } else {
  //     $(firstRowCheapest).remove();
  //   }
  // }
  // $(deleteAdvert).remove();

  const bestCost = $(cheapestCostText(divChecker))
    .text()
    .split("")
    .filter((element: string | number) => !isNaN(+element))
    .join("")
    .replace(" ", "");

  const bestCostWithCurrency = $(cheapestCostText(divChecker)).text();

  const bestDepartureDepartTime = $(
    cheapestDepartureDepartTimeText(divChecker)
  ).text();
  const bestDepartureArrivalTime = $(
    cheapestDepartureArrivalTimeText(divChecker)
  ).text();
  const bestDepartureDurationFlight = $(durationFlight(divChecker)).text();

  await page.waitForTimeout(1000);
  console.log("Done");
  // await page.close();

  const departDate = dayjs(new Date(departureDateIteration.date)).format(
    "dddd DD MMMM YYYY"
  );
  const returnDate = dayjs(new Date(returnDateInMili)).format(
    "dddd DD MMMM YYYY"
  );
  const flightDatesString = {
    departDate,
    returnDate,
  };

  const result: ReturnDatesORM = {
    daysBetweenDepartureDateAndArrivalDate: Number(
      (returnDateInMili - departureDateIteration.date) / 86400000
    ),
    departDate: new Date(departureDateIteration.date),
    returnDate: new Date(returnDateInMili),
    flightDatesString,
    dateString: new Date(returnDateInMili).toString(),
    url: await page.url(),
    cheapest: {
      cost: +cheapestCost,
      costWithCurrency: cheapestCostWithCurrency,
      time: cheapestDepartureDepartTime,
      arrival: cheapestDepartureArrivalTime,
      durationOfFlight: cheapestDepartureDurationFlight,
    },
    best: {
      cost: +bestCost,
      costWithCurrency: bestCostWithCurrency,
      time: bestDepartureDepartTime,
      arrival: bestDepartureArrivalTime,
      durationOfFlight: bestDepartureDurationFlight,
    },
    departureDates: departureDateORM,

  };

  const fullResult = await returnDateORMDatabase.save({
    ...result,
  })
  console.log("👌 Price alert TEST 👌")
  console.log(userFlight.alertPrice >= result.cheapest.cost)
  console.log(userFlight.alertPrice, result.cheapest.cost)

  if (userFlight.alertPrice >= result.cheapest.cost && !userFlight.alertPriceFired) {
    await priceAlert(userFlight)
    userFlight.alertPriceFired = true
    await userFlightTypeORMDatabase.update({ id: userFlight.id }, {
      alertPriceFired: true,
    });
    console.log("👌 Price alert fired 👌")
  }

  // console.log(fullResult)
  // await page.waitForTimeout(200000000);


  console.log("As we now have a new day, creating new");
  await page.waitForTimeout(2000);

  // const ReturnDatePush = await FlightsDatabase.findOne({
  //   ref: newUser.ref,
  // });
  // const scanDateIndex = ReturnDatePush.scanDate.length - 1;
  // const departureDateIndex =
  //   ReturnDatePush.scanDate[0 >= scanDateIndex ? 0 : scanDateIndex]
  //     .departureDate.length - 1;
  // console.log(`DepartureDate is ${departureDateIndex}`);

  // console.log(
  //   ReturnDatePush.scanDate[0 >= scanDateIndex ? 0 : scanDateIndex]
  //     .departureDate[0 >= departureDateIndex ? 0 : departureDateIndex]
  // );

  // const returnDateIndex =
  //   ReturnDatePush.scanDate[0 >= scanDateIndex ? 0 : scanDateIndex]
  //     .departureDate[0 >= departureDateIndex ? 0 : departureDateIndex]
  //     .returnDates.length - 1;

  // console.log(`ReturnDate is ${returnDateIndex}`);

  // if (
  //   ReturnDatePush.scanDate[0 >= scanDateIndex ? 0 : scanDateIndex]
  //     .departureDate[0 >= departureDateIndex ? 0 : departureDateIndex]
  //     .returnDates.length === 0
  // ) {
  console.log("ReturnDatePush set was true");
  // ReturnDatePush.scanDate[
  //   0 >= scanDateIndex ? 0 : scanDateIndex
  // ].departureDate[
  //   0 >= departureDateIndex ? 0 : departureDateIndex
  // ].returnDates.push(result);
  // } else {}
  // console.log("ReturnDatePush was false");

  // console.log( ReturnDatePush.scanDate[
  //   0 >= scanDateIndex ? 0 : scanDateIndex
  // ].departureDate[
  //   0 >= departureDateIndex ? 0 : departureDateIndex
  // ].returnDates[0 >= returnDateIndex ? 0 : returnDateIndex])

  // ReturnDatePush.scanDate[
  //   0 >= scanDateIndex ? 0 : scanDateIndex
  // ].departureDate[
  //   0 >= departureDateIndex ? 0 : departureDateIndex
  // ].returnDates[0 >= returnDateIndex ? 0 : returnDateIndex].push(result);
  // }

  // await ReturnDatePush.save();
  return result;
};

module.exports = processPage;
export default processPage
