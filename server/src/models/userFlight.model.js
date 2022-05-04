const userFlightDatabase = require("./userFlight.mongo");

// All functions will fire cheapestFlightScannedToday. We can add other parameters in the future

const cheapestFlightScannedToday = async (newUser) => {
  console.log(newUser)
  const Flight = await userFlightDatabase.findOne({ ref: newUser.ref });
  console.log(Flight)
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
    console.log(cheapestFlightsOrder[i]);
  }
  console.log("####################");
  console.log("####################");
  console.log("####################");

  for (let i = 0; i < 10; i++) {
    console.log(bestFlightsOrder[i]);
  }
  return { cheapestFlightsOrder, bestFlightsOrder };
};

const findUserFlight = async (reference) => {
  return await userFlightDatabase.findOne({ ref: reference });
}

// I'm expecting the flights to have been processed in cheapestFlightScannedToday.
const maximumHoliday = async (flightArray, daysOfMaxHoliday) => {
  return flightArray.filter((flight, index) => flight.daysBetweenDepartureDateAndArrivalDate <= 10)
}

module.exports = {
  cheapestFlightScannedToday,
  findUserFlight,
  maximumHoliday
};
