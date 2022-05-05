require("dotenv").config();

// Puppeteer Bundles / Individuals
const searchFlights = require("./puppeteer/bundle/firstTimeSearch");
const { cheapestFlightScannedToday, checkMaximumHoliday } = require("./models/userFlight.model");

// Database things
const { mongoConnect } = require("../services/mongo");

(async () => {
	await mongoConnect();
})();

const main = async (reference = false) => {
  const userFlight = await searchFlights(reference);
  // Creating Object see if it works
  await cheapestFlightScannedToday(userFlight);
  await checkMaximumHoliday(userFlight.ref)
};

main("james-miami");
// checkMaximumHoliday("split-holiday")

