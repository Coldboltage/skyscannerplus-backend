const cheerio = require("cheerio");
const dayjs = require("dayjs");
const exitHook = require("async-exit-hook");
const axios = require("axios");

const processPage = async (
  page,
  returnDateInMili,
  departureDateIteration,
  userFlight
) => {
  exitHook(async () => {
    userFlight.isBeingScanned = false;
    userFlight.workerPID = 0;
    await userFlight.save();
    console.log("WE HAVE DIED VIA EXIT HOOK");
  });
  console.log("refreshing page");
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

  // DOM POINTS. Add them all here with great detail
  // Cheapest
  const cheapestButton =
    "#app-root > div.FlightsDayView_row__NjQyZ > div > div.FlightsDayView_container__ZjgwY > div.FlightsDayView_results__YjlmM > div:nth-child(1) > div.FqsTabs_fqsTabsWithSparkle__ZDAyO > div:nth-child(2) > button";
  const dataTestId = `[data-testid]`;
  const firstRowCheapest =
    "#app-root > div.FlightsDayView_row__NjQyZ > div > div.FlightsDayView_container__ZjgwY > div.FlightsDayView_results__YjlmM > div:nth-child(1) > div.FlightsResults_dayViewItems__ZDFlO > div:nth-child(1) > div";
  const firstRowCheapestParent =
    "#app-root > div.FlightsDayView_row__NjQyZ > div > div.FlightsDayView_container__ZjgwY > div.FlightsDayView_results__YjlmM > div:nth-child(1) > div.FlightsResults_dayViewItems__ZDFlO > div:nth-child(1) > div";
  const cheapestCostText =
    "#dayview-first-result > div > div.BpkTicket_bpk-ticket__paper__ZTQxN.BpkTicket_bpk-ticket__stub__Y2M3M.Ticket_stub__NGYxN.BpkTicket_bpk-ticket__stub--padded__ZTlkM.BpkTicket_bpk-ticket__stub--horizontal__YjRhZ > div > div > div > span";
  const cheapestDepartureDepartTimeText =
    "#dayview-first-result > div > div.BpkTicket_bpk-ticket__paper__ZTQxN.BpkTicket_bpk-ticket__main__ZGZlY.BpkTicket_bpk-ticket__main--padded__OGJhY.BpkTicket_bpk-ticket__main--horizontal__NmZkO > div > div.UpperTicketBody_container__NDcwM > div.UpperTicketBody_legsContainer__ZjcyZ > div:nth-child(1) > div.LegInfo_legInfo__ZGMzY > div.LegInfo_routePartialDepart__NzEwY > span.BpkText_bpk-text__ZWIzZ.BpkText_bpk-text--lg__Nzk0N.LegInfo_routePartialTime__OTFkN > div > span";
  const cheapestDepartureArrivalTimeText =
    "#app-root > div.FlightsDayView_row__NjQyZ > div > div.FlightsDayView_container__ZjgwY > div.FlightsDayView_results__YjlmM > div:nth-child(1) > div.FlightsResults_dayViewItems__ZDFlO > div:nth-child(1) > div > div > a > div > div.BpkTicket_bpk-ticket__paper__ZTQxN.BpkTicket_bpk-ticket__main__ZGZlY.BpkTicket_bpk-ticket__main--padded__OGJhY.BpkTicket_bpk-ticket__main--horizontal__NmZkO > div > div.UpperTicketBody_container__NDcwM > div.UpperTicketBody_legsContainer__ZjcyZ > div:nth-child(1) > div.LegInfo_legInfo__ZGMzY > div.LegInfo_routePartialArrive__Y2U1N > span.BpkText_bpk-text__ZWIzZ.BpkText_bpk-text--lg__Nzk0N.LegInfo_routePartialTime__OTFkN > div > span";
  const durationFlight =
    "#app-root > div.FlightsDayView_row__NjQyZ > div > div.FlightsDayView_container__ZjgwY > div.FlightsDayView_results__YjlmM > div:nth-child(1) > div.FlightsResults_dayViewItems__ZDFlO > div:nth-child(1) > div > div > a > div > div.BpkTicket_bpk-ticket__paper__ZTQxN.BpkTicket_bpk-ticket__main__ZGZlY.BpkTicket_bpk-ticket__main--padded__OGJhY.BpkTicket_bpk-ticket__main--horizontal__NmZkO > div > div.UpperTicketBody_container__NDcwM > div.UpperTicketBody_legsContainer__ZjcyZ > div:nth-child(1) > div.LegInfo_legInfo__ZGMzY > div.LegInfo_stopsContainer__NWIyN > span";
  // Best
  const bestButton =
    "#app-root > div.FlightsDayView_row__NjQyZ > div > div.FlightsDayView_container__ZjgwY > div.FlightsDayView_results__YjlmM > div:nth-child(1) > div.FqsTabs_fqsTabsWithSparkle__ZDAyO > div:nth-child(1) > button";
  const deleteAdvert =
    "#app-root > div.FlightsDayView_row__NjQyZ > div > div.FlightsDayView_container__ZjgwY > div.FlightsDayView_results__YjlmM > div:nth-child(1) > div.FlightsResults_dayViewItems__ZDFlO > div.ItineraryInlinePlusWrapper_container__YjM3Y";

  // Cheapest Flights
  await page.click(cheapestButton, { clickCount: 2 });

  await page.waitForTimeout(1500);
  const cheapestHTML = await page.content();
  $ = cheerio.load(cheapestHTML);

  $(dataTestId).remove();
  if ($(firstRowCheapest).html().includes("deal") !== true) {
    if (
      $(firstRowCheapestParent).parent().html().includes("ponsored") === true
    ) {
      $(firstRowCheapestParent).parent().remove();
    } else {
      $(firstRowCheapestParent).remove();
    }
  }
  const cheapestCost = $(cheapestCostText).text().substring(1).replace(",", "");

  const cheapestDepartureDepartTime = $(cheapestDepartureDepartTimeText).text();
  const cheapestDepartureArrivalTime = $(
    cheapestDepartureArrivalTimeText
  ).text();
  const cheapestDepartureDurationFlight = $(durationFlight).text();
  // Best
  await page.waitForTimeout(1500);
  await page.click(bestButton, { clickCount: 2 });

  await page.waitForTimeout(1500);
  const bestHTML = await page.content();
  $ = cheerio.load(bestHTML);

  $(dataTestId).remove();
  if ($(firstRowCheapest).html().includes("deal") !== true) {
    if ($(firstRowCheapest).parent().html().includes("ponsored") === true) {
      $(cheapestCostText).parent().remove();
    } else {
      $(firstRowCheapest).remove();
    }
  }
  $(deleteAdvert).remove();

  const bestCost = $(cheapestCostText).text().substring(1).replace(",", "");

  const bestDepartureDepartTime = $(cheapestDepartureDepartTimeText).text();
  const bestDepartureArrivalTime = $(cheapestDepartureArrivalTimeText).text();
  const bestDepartureDurationFlight = $(durationFlight).text();

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
      time: cheapestDepartureDepartTime,
      arrival: cheapestDepartureArrivalTime,
      durationOfFlight: cheapestDepartureDurationFlight,
    },
    best: {
      cost: +bestCost,
      time: bestDepartureDepartTime,
      arrival: bestDepartureArrivalTime,
      durationOfFlight: bestDepartureDurationFlight,
    },
  };
};

module.exports = processPage;
