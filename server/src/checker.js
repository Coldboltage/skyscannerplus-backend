require("dotenv").config();
const cron = require("node-cron");
// UserFlights

// Puppeteer Bundles / Individuals
const searchFlights = require("./puppeteer/bundle/firstTimeSearch");
const {
  cheapestFlightScannedToday,
  checkMaximumHoliday,
  getAllDocuments,
} = require("./models/userFlight.model");

// Database things
const { mongoConnect } = require("../services/mongo");

(async () => {
  await mongoConnect();
})();

// const server = http.createServer(app)

const main = async () => {
  // cron.schedule('1 * * * *', async () => {
  cron.schedule("0 */12 * * *", async () => {
    await fireAllJobs();
  });
};

const fireAllJobs = async () => {
  const allUsers = await getAllDocuments();
  allUsers.forEach(async (user, index) => {
    await new Promise((resolve) => setTimeout(resolve, index * 10000));
    const reference = user.ref;
    await fireEvents(reference);
  });
};

const fireEvents = async (reference) => {
  const userFlight = await searchFlights(reference);
  await cheapestFlightScannedToday(userFlight);
  await checkMaximumHoliday(userFlight.ref);
  return true
};

// main();
fireAllJobs();