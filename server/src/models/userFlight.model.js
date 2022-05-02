const userFlightDatabase = require("./userFlight.mongo");

const cheapestFlightScannedToday = async () => {
  const Flight = await userFlightDatabase.findOne({
    "user.name": "Alan Reid",
  });
  console.log(Flight);
  const FlightArrays = Flight.scanDate.at(-1).departureDate;

  let cheapestObject = [];
  console.log(cheapestObject);

  for (let departureDateArray of FlightArrays) {
    console.log("new loop");
    for (let returnDatesArray of departureDateArray.returnDates) {
      if (returnDatesArray.cheapest.cost > 0) {
        cheapestObject.push(returnDatesArray);
      }
    }
  }
  const cheapestFlightsOrder = cheapestObject.sort((a, b) => {
    return a.cheapest.cost - b.cheapest.cost;
  });
  console.log(cheapestFlightsOrder);
  return cheapestFlightsOrder;
};

module.exports = {
  cheapestFlightScannedToday,
};
