require("dotenv").config();

// Puppeteer Bundles / Individuals
const firstTimeSearch = require("./puppeteer/bundle/firstTimeSearch");
const { cheapestFlightScannedToday, findUserFlight, maximumHoliday } = require("./models/userFlight.model");

// Database things
const { mongoConnect } = require("../services/mongo");
const FlightsDatabase = require("./models/userFlight.mongo");

const reference = "Zagreb";
const daysOfMaxHoliday = 10

const main = async () => {
  await mongoConnect();
  const newUser = await firstTimeSearch();
  // Creating Object see if it works
  await cheapestFlightScannedToday(newUser);
};

const checkUserFlightStuff = async (reference) => {
  await mongoConnect();
  const userFlight = await findUserFlight(reference)
  const {cheapestFlightsOrder, bestFlightsOrder} = await cheapestFlightScannedToday(userFlight)
  const cheapestHolidayFilteredByMaxDay = await maximumHoliday(cheapestFlightsOrder, daysOfMaxHoliday)
  const bestHolidayFilteredByMaxDay = await maximumHoliday(bestFlightsOrder, daysOfMaxHoliday)
  console.log("Max Holiday Output")
  console.log("#################")
  console.log("#################")
  console.log("#################")
  console.log(cheapestHolidayFilteredByMaxDay)
  console.log("#################")
  console.log("#################")
  console.log("#################")
  console.log(bestHolidayFilteredByMaxDay)
};

main();
// checkUserFlightStuff(reference)

