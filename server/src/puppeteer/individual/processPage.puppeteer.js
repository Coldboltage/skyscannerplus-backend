const cheerio = require("cheerio");
const dayjs = require("dayjs");
const axios = require("axios");

const processPage = async (
  page,
  returnDateInMili,
  departureDateIteration,
  userFlight
) => {
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
    return false;
  } else {
    console.log("Page loaded without error");
  }

  // await page.screenshot({path: "./screenshot.jpg"})
  await page.waitForSelector(
    "#app-root > div.FlightsDayView_row__NjQyZ > div > div.FlightsDayView_container__ZjgwY > div.FlightsDayView_results__YjlmM > div:nth-child(1) > div.ResultsSummary_container__ZWE4O > div.ResultsSummary_innerContainer__ZjFhZ > div.ResultsSummary_summaryContainer__NmI1Y > span",
    { timeout: 300000 }
  );

  if (($("#acceptCookieButton").html() === "OK") === true) {
    console.log("Locating cookie button");
    await page.click("#acceptCookieButton");
  }

  await page.waitForTimeout(200);
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
  const cheapestButton = (divChecker) =>
    `#app-root > div.FlightsDayView_row__NjQyZ > div > div.FlightsDayView_container__ZjgwY > div.FlightsDayView_results__YjlmM > div:nth-child(1) > div.FqsTabs_fqsTabsWithSparkle__ZDAyO > div:nth-child(2) > button`;
  const flightsDayView = (divChecker) =>
    "#app-root > div.FlightsDayView_row__NjQyZ > div > div.FlightsDayView_container__ZjgwY > div.FlightsDayView_results__YjlmM > div:nth-child(1) > div.FlightsResults_dayViewItems__ZDFlO";
  const dataTestId = "[data-testid]";
  const advert = (divChecker) =>
    `#app-root > div.FlightsDayView_row__NjQyZ > div > div.FlightsDayView_container__ZjgwY > div.FlightsDayView_results__YjlmM > div:nth-child(1) > div.FlightsResults_dayViewItems__ZDFlO > div:nth-child(${divChecker}) > a`;
  const firstRowCheapest = (divChecker) =>
    `#app-root > div.FlightsDayView_row__NjQyZ > div > div.FlightsDayView_container__ZjgwY > div.FlightsDayView_results__YjlmM > div:nth-child(1) > div.FlightsResults_dayViewItems__ZDFlO > div:nth-child(${divChecker}) > div`;
  const firstRowCheapestParent = (divChecker) =>
    `#app-root > div.FlightsDayView_row__NjQyZ > div > div.FlightsDayView_container__ZjgwY > div.FlightsDayView_results__YjlmM > div:nth-child(1) > div.FlightsResults_dayViewItems__ZDFlO > div:nth-child(${divChecker}) > div`;
  const cheapestCostText = (divChecker) =>
    `#app-root > div.FlightsDayView_row__NjQyZ > div > div.FlightsDayView_container__ZjgwY > div.FlightsDayView_results__YjlmM > div:nth-child(1) > div.FlightsResults_dayViewItems__ZDFlO > div:nth-child(${divChecker}) > div > div.FlightsTicket_container__NWJkY > a > div > div.BpkTicket_bpk-ticket__paper__ZTQxN.BpkTicket_bpk-ticket__stub__Y2M3M.Ticket_stub__NGYxN.BpkTicket_bpk-ticket__stub--padded__ZTlkM.BpkTicket_bpk-ticket__stub--horizontal__YjRhZ > div > div > div > span`;
  const cheapestDepartureDepartTimeText = (divChecker) =>
    `#app-root > div.FlightsDayView_row__NjQyZ > div > div.FlightsDayView_container__ZjgwY > div.FlightsDayView_results__YjlmM > div:nth-child(1) > div.FlightsResults_dayViewItems__ZDFlO > div:nth-child(${divChecker}) > div > div.FlightsTicket_container__NWJkY > a > div > div.BpkTicket_bpk-ticket__paper__ZTQxN.BpkTicket_bpk-ticket__main__ZGZlY.BpkTicket_bpk-ticket__main--padded__OGJhY.BpkTicket_bpk-ticket__main--horizontal__NmZkO > div > div.UpperTicketBody_container__NDcwM > div.UpperTicketBody_legsContainer__ZjcyZ > div:nth-child(1) > div.LegInfo_legInfo__ZGMzY > div.LegInfo_routePartialDepart__NzEwY > span.BpkText_bpk-text__ZWIzZ.BpkText_bpk-text--lg__Nzk0N.LegInfo_routePartialTime__OTFkN > div > span`;
  const cheapestDepartureArrivalTimeText = (divChecker) =>
    `#app-root > div.FlightsDayView_row__NjQyZ > div > div.FlightsDayView_container__ZjgwY > div.FlightsDayView_results__YjlmM > div:nth-child(1) > div.FlightsResults_dayViewItems__ZDFlO > div:nth-child(${divChecker}) > div > div > a > div > div.BpkTicket_bpk-ticket__paper__ZTQxN.BpkTicket_bpk-ticket__main__ZGZlY.BpkTicket_bpk-ticket__main--padded__OGJhY.BpkTicket_bpk-ticket__main--horizontal__NmZkO > div > div.UpperTicketBody_container__NDcwM > div.UpperTicketBody_legsContainer__ZjcyZ > div:nth-child(1) > div.LegInfo_legInfo__ZGMzY > div.LegInfo_routePartialArrive__Y2U1N > span.BpkText_bpk-text__ZWIzZ.BpkText_bpk-text--lg__Nzk0N.LegInfo_routePartialTime__OTFkN > div > span`;
  const durationFlight = (divChecker) =>
    `#app-root > div.FlightsDayView_row__NjQyZ > div > div.FlightsDayView_container__ZjgwY > div.FlightsDayView_results__YjlmM > div:nth-child(1) > div.FlightsResults_dayViewItems__ZDFlO > div:nth-child(${divChecker}) > div > div > a > div > div.BpkTicket_bpk-ticket__paper__ZTQxN.BpkTicket_bpk-ticket__main__ZGZlY.BpkTicket_bpk-ticket__main--padded__OGJhY.BpkTicket_bpk-ticket__main--horizontal__NmZkO > div > div.UpperTicketBody_container__NDcwM > div.UpperTicketBody_legsContainer__ZjcyZ > div:nth-child(1) > div.LegInfo_legInfo__ZGMzY > div.LegInfo_stopsContainer__NWIyN > span`;
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
    .filter((element) => !isNaN(+element))
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
    .filter((element) => !isNaN(+element))
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

  return {
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
  };
};

module.exports = processPage;
