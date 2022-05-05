const cheerio = require("cheerio");

const processPage = async (page, returnDateInMili, departureDateIteration) => {
  console.log("refreshing page");
  await page.waitForTimeout(1000);
  await page.reload({ waitUntil: "domcontentloaded", timeout: 300000 });
  await page.waitForSelector(
    "#app-root > div.FlightsDayView_row__NjQyZ > div > div.FlightsDayView_container__ZjgwY > div.FlightsDayView_results__YjlmM > div:nth-child(1) > div.ResultsSummary_container__ZWE4O > div.ResultsSummary_innerContainer__ZjFhZ > div.ResultsSummary_summaryContainer__NmI1Y > span",
    { timeout: 300000 }
  );
  await page.waitForTimeout(200);
  await page.keyboard.press("Enter");
  await page.keyboard.press("Enter");
  await page.waitForTimeout(1000);
  // await page.click(
  //   "#stops_content > div > div > div:nth-child(3) > label > input"
  // );
  console.log("Page loaded apprently");
  console.log("Reading Page");

  // DOM POINTS

  // Cheapest Flights
  await page.click(
    "#app-root > div.FlightsDayView_row__NjQyZ > div > div.FlightsDayView_container__ZjgwY > div.FlightsDayView_results__YjlmM > div:nth-child(1) > div.FqsTabs_fqsTabsWithSparkle__ZDAyO > button:nth-child(2)",
    { clickCount: 2 }
  );

  await page.waitForTimeout(1500);
  const cheapestHTML = await page.content();
  let $ = cheerio.load(cheapestHTML);

  $(`[data-testid]`).remove();
  if (
    $(
      "#app-root > div.FlightsDayView_row__NjQyZ > div > div.FlightsDayView_container__ZjgwY > div.FlightsDayView_results__YjlmM > div:nth-child(1) > div.FlightsResults_dayViewItems__ZDFlO > div:nth-child(1) > div"
    )
      .html()
      .includes("deal") !== true
  ) {
    if (
      $(
        "#app-root > div.FlightsDayView_row__NjQyZ > div > div.FlightsDayView_container__ZjgwY > div.FlightsDayView_results__YjlmM > div:nth-child(1) > div.FlightsResults_dayViewItems__ZDFlO > div:nth-child(1) > div"
      )
        .parent()
        .html()
        .includes("ponsored") === true
    ) {
      $(
        "#app-root > div.FlightsDayView_row__NjQyZ > div > div.FlightsDayView_container__ZjgwY > div.FlightsDayView_results__YjlmM > div:nth-child(1) > div.FlightsResults_dayViewItems__ZDFlO > div:nth-child(1) > div"
      )
        .parent()
        .remove();
    } else {
      $(
        "#app-root > div.FlightsDayView_row__NjQyZ > div > div.FlightsDayView_container__ZjgwY > div.FlightsDayView_results__YjlmM > div:nth-child(1) > div.FlightsResults_dayViewItems__ZDFlO > div:nth-child(1) > div"
      ).remove();
    }
  }
  const cheapestCost = $(
    "#dayview-first-result > div > div.BpkTicket_bpk-ticket__paper__N2IwN.BpkTicket_bpk-ticket__stub__MGVjZ.Ticket_stub__NGYxN.BpkTicket_bpk-ticket__stub--padded__MzZmN.BpkTicket_bpk-ticket__stub--horizontal__Y2IzN.BpkTicket_bpk-ticket__paper--with-notches__NDVkM > div > div > div > span"
  )
    .text()
    .substring(1)
    .replace(",", "");

  const cheapestDepartureDepartTime = $(
    "#dayview-first-result > div > div.BpkTicket_bpk-ticket__paper__N2IwN.BpkTicket_bpk-ticket__main__NmI5Z.BpkTicket_bpk-ticket__main--padded__YTMwZ.BpkTicket_bpk-ticket__main--horizontal__ZTY5N.BpkTicket_bpk-ticket__paper--with-notches__NDVkM > div > div.UpperTicketBody_container__NDcwM > div.UpperTicketBody_legsContainer__ZjcyZ > div:nth-child(1) > div.LegInfo_legInfo__ZGMzY > div.LegInfo_routePartialDepart__NzEwY > span.BpkText_bpk-text__YWQwM.BpkText_bpk-text--lg__ODFjM.LegInfo_routePartialTime__OTFkN > div > span"
  ).text();
  const cheapestDepartureArrivalTime = $(
    "#dayview-first-result > div > div.BpkTicket_bpk-ticket__paper__N2IwN.BpkTicket_bpk-ticket__main__NmI5Z.BpkTicket_bpk-ticket__main--padded__YTMwZ.BpkTicket_bpk-ticket__main--horizontal__ZTY5N.BpkTicket_bpk-ticket__paper--with-notches__NDVkM > div > div.UpperTicketBody_container__NDcwM > div.UpperTicketBody_legsContainer__ZjcyZ > div:nth-child(1) > div.LegInfo_legInfo__ZGMzY > div.LegInfo_routePartialArrive__Y2U1N > span.BpkText_bpk-text__YWQwM.BpkText_bpk-text--lg__ODFjM.LegInfo_routePartialTime__OTFkN > div > span.BpkText_bpk-text__YWQwM.BpkText_bpk-text--subheading__ODU3O"
  ).text();

  // Best
  await page.waitForTimeout(1500);
  await page.click(
    "#app-root > div.FlightsDayView_row__NjQyZ > div > div.FlightsDayView_container__ZjgwY > div.FlightsDayView_results__YjlmM > div:nth-child(1) > div.FqsTabs_fqsTabsWithSparkle__ZDAyO > button:nth-child(1)",
    { clickCount: 2 }
  );

  await page.waitForTimeout(1500);
  const bestHTML = await page.content();
  $ = cheerio.load(bestHTML);

  $(`[data-testid]`).remove();
  // $(
  //   `#app-root > div.FlightsDayView_row__NjQyZ > div > div.FlightsDayView_container__ZjgwY > div.FlightsDayView_results__YjlmM > div:nth-child(1) > div.FlightsResults_dayViewItems__ZDFlO > div:nth-child(1)`
  // ).remove();

  if (
    $(
      "#app-root > div.FlightsDayView_row__NjQyZ > div > div.FlightsDayView_container__ZjgwY > div.FlightsDayView_results__YjlmM > div:nth-child(1) > div.FlightsResults_dayViewItems__ZDFlO > div:nth-child(1) > div"
    )
      .html()
      .includes("deal") !== true
  ) {
    if (
      $(
        "#app-root > div.FlightsDayView_row__NjQyZ > div > div.FlightsDayView_container__ZjgwY > div.FlightsDayView_results__YjlmM > div:nth-child(1) > div.FlightsResults_dayViewItems__ZDFlO > div:nth-child(1) > div"
      )
        .parent()
        .html()
        .includes("ponsored") === true
    ) {
      $(
        "#app-root > div.FlightsDayView_row__NjQyZ > div > div.FlightsDayView_container__ZjgwY > div.FlightsDayView_results__YjlmM > div:nth-child(1) > div.FlightsResults_dayViewItems__ZDFlO > div:nth-child(1) > div"
      )
        .parent()
        .remove();
    } else {
      $(
        "#app-root > div.FlightsDayView_row__NjQyZ > div > div.FlightsDayView_container__ZjgwY > div.FlightsDayView_results__YjlmM > div:nth-child(1) > div.FlightsResults_dayViewItems__ZDFlO > div:nth-child(1) > div"
      ).remove();
    }
  }
  $(
    "#app-root > div.FlightsDayView_row__NjQyZ > div > div.FlightsDayView_container__ZjgwY > div.FlightsDayView_results__YjlmM > div:nth-child(1) > div.FlightsResults_dayViewItems__ZDFlO > div.ItineraryInlinePlusWrapper_container__YjM3Y"
  ).remove();

  const bestCost = $(
    "#dayview-first-result > div > div.BpkTicket_bpk-ticket__paper__N2IwN.BpkTicket_bpk-ticket__stub__MGVjZ.Ticket_stub__NGYxN.BpkTicket_bpk-ticket__stub--padded__MzZmN.BpkTicket_bpk-ticket__stub--horizontal__Y2IzN.BpkTicket_bpk-ticket__paper--with-notches__NDVkM > div > div > div > span"
  )
    .text()
    .substring(1)
    .replace(",", "");

  const bestDepartureDepartTime = $(
    "#dayview-first-result > div > div.BpkTicket_bpk-ticket__paper__N2IwN.BpkTicket_bpk-ticket__main__NmI5Z.BpkTicket_bpk-ticket__main--padded__YTMwZ.BpkTicket_bpk-ticket__main--horizontal__ZTY5N.BpkTicket_bpk-ticket__paper--with-notches__NDVkM > div > div.UpperTicketBody_container__NDcwM > div.UpperTicketBody_legsContainer__ZjcyZ > div:nth-child(1) > div.LegInfo_legInfo__ZGMzY > div.LegInfo_routePartialDepart__NzEwY > span.BpkText_bpk-text__YWQwM.BpkText_bpk-text--lg__ODFjM.LegInfo_routePartialTime__OTFkN > div > span"
  ).text();
  const bestDepartureArrivalTime = $(
    "#dayview-first-result > div > div.BpkTicket_bpk-ticket__paper__N2IwN.BpkTicket_bpk-ticket__main__NmI5Z.BpkTicket_bpk-ticket__main--padded__YTMwZ.BpkTicket_bpk-ticket__main--horizontal__ZTY5N.BpkTicket_bpk-ticket__paper--with-notches__NDVkM > div > div.UpperTicketBody_container__NDcwM > div.UpperTicketBody_legsContainer__ZjcyZ > div:nth-child(1) > div.LegInfo_legInfo__ZGMzY > div.LegInfo_routePartialArrive__Y2U1N > span.BpkText_bpk-text__YWQwM.BpkText_bpk-text--lg__ODFjM.LegInfo_routePartialTime__OTFkN > div > span.BpkText_bpk-text__YWQwM.BpkText_bpk-text--subheading__ODU3O"
  ).text();

  await page.waitForTimeout(200);
  console.log("Done");
  await page.close();

  return {
    daysBetweenDepartureDateAndArrivalDate: Number(
      (returnDateInMili - departureDateIteration.date) / 86400000
    ),
    departDate: new Date(departureDateIteration.date),
    returnDate: new Date(returnDateInMili),
    dateString: new Date(returnDateInMili).toString(),
    url: await page.url(),
    cheapest: {
      cost: +cheapestCost,
      time: cheapestDepartureDepartTime,
      arrival: cheapestDepartureArrivalTime,
    },
    best: {
      cost: +bestCost,
      time: bestDepartureDepartTime,
      arrival: bestDepartureArrivalTime,
    },
  };
};

module.exports = processPage;
