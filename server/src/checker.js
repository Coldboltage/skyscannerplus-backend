const cluster = require("node:cluster");
const http = require("node:http");
const numCPUs = require("node:os").cpus().length;
const process = require("node:process");
// const { snapshot } = require("@senfo/process-list");

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

  if (cluster.isPrimary) {
    console.log(`Primary ${process.pid} is running`);
    // const tasks = await snapshot("cpu");
    // console.log(tasks);
    // Fork workers.
    for (let i = 0; i < 3; i++) {
      cluster.fork();
    }
    cluster.on("exit", (worker, code, signal) => {
      console.log(`worker ${worker.process.pid} died`);
    });
  } else {
    console.log(`Worker ${process.pid} started`);
    console.log(cluster.worker.id);
    await new Promise((resolve) =>
      setTimeout(resolve, cluster.worker.id * 10000)
    );
    const reference = allUsers[cluster.worker.id - 1].ref;
    console.log(reference);
    await fireEvents(reference);
    console.log(`Worker ${process.pid} ended`);

  }
};

const fireEvents = async (reference) => {
  const userFlight = await searchFlights(reference);
  await cheapestFlightScannedToday(userFlight);
  await checkMaximumHoliday(userFlight.ref);
  return true;
};

// main();
fireAllJobs();
