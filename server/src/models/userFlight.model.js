const userFlightDatabase = require("./userFlight.mongo");

// All functions will fire cheapestFlightScannedToday. We can add other parameters in the future
const cheapestFlightScannedToday = async (newUser) => {
  console.log("Started cheapestFlightScannedToday")
  // console.log(newUser)
  const Flight = await userFlightDatabase.findOne({ ref: newUser.ref });
  // console.log(Flight)
  const FlightArrays = Flight.scanDate.at(-1).departureDate;
  let cheapestObject = [];
  let bestObject = [];
  for (let departureDateArray of FlightArrays) {
    console.log("new loop");
    for (let returnDatesArray of departureDateArray.returnDates) {
      if (returnDatesArray.cheapest.cost > 0) {
        cheapestObject.push(returnDatesArray);
      }
      if (returnDatesArray.best.cost > 0) {
        bestObject.push(returnDatesArray);
      }
    }
  }
  const cheapestFlightsOrder = cheapestObject.sort((a, b) => {
    return a.cheapest.cost - b.cheapest.cost;
  });

  const bestFlightsOrder = bestObject.sort((a, b) => {
    return a.best.cost - b.best.cost;
  });

  for (let i = 0; i < 10; i++) {
    // console.log(cheapestFlightsOrder[i]);
  }
  console.log("####################");
  console.log("####################");
  console.log("####################");

  for (let i = 0; i < 10; i++) {
    // console.log(bestFlightsOrder[i]);
  }
  return { cheapestFlightsOrder, bestFlightsOrder };
};

// We know users will have a reference. We can use this to find flights
const findUserFlight = async (reference) => {
  console.log("Started findUserFlight")
  return await userFlightDatabase.findOne({ref:reference}); 
}

const checkUserFlightStuff = async (reference) => {
  console.log(`checkedUserFlightStuff passed reference = ${reference}`)
  const userFlight = await findUserFlight(reference)
  const {cheapestFlightsOrder, bestFlightsOrder} = await cheapestFlightScannedToday(userFlight)
  return {cheapestFlightsOrder, bestFlightsOrder, userFlight}
};


// I'm expecting the flights to have been processed in cheapestFlightScannedToday.
const maximumHoliday = async (flightArray, daysOfMaxHoliday) => {
  console.log(`Starting maximumHoliday`)
  const sortedFlights = flightArray.filter((flight, index) => flight.daysBetweenDepartureDateAndArrivalDate <= daysOfMaxHoliday)
  return sortedFlights.filter((flights,index) => index <= daysOfMaxHoliday)
}

const checkMaximumHoliday = async (reference) => {
  let {cheapestFlightsOrder, bestFlightsOrder, userFlight} = await checkUserFlightStuff(reference)
  const cheapestFlightsOrderMax = await maximumHoliday(cheapestFlightsOrder, userFlight.dates.maximumHoliday)
  const bestFlightsOrderMax = await maximumHoliday(bestFlightsOrder, userFlight.dates.maximumHoliday)
  consoleOutput(cheapestFlightsOrderMax,bestFlightsOrderMax)
}

const consoleOutput = async (cheapestFlightsOrder, bestFlightsOrder) => {
  console.log("#################")
  console.log(">> Max Holiday Output: Cheapest <<")
  console.log(cheapestFlightsOrder)
  console.log("#################")
  console.log(">> Max Holiday Output: Best <<")
  console.log(bestFlightsOrder)
  console.log("#################")
}

module.exports = {
  cheapestFlightScannedToday,
  findUserFlight,
  maximumHoliday,
  checkUserFlightStuff,
  checkMaximumHoliday
};
