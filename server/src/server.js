const path = require("path")
require("dotenv").config(path.join(__dirname,"..","..", ".env"));
console.log(path.join(__dirname,"..","..", ".env"))
const cron = require("node-cron");
const cluster = require("node:cluster");
const numCPUs = require("node:os").cpus().length;
const process = require("node:process");

// UserFlights

// WEB SERVER
const http = require("http");
const app = require("./app");
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

const server = http.createServer(app);

// Start Server
if (cluster.isPrimary) {
  server.listen(process.env.PORT || 3000, () => {
    console.log(`Listening on port ${process.env.PORT}`);
  });
}

// const fireAllJobs = async () => {
//   const allUsers = await getAllDocuments();
//   allUsers.forEach(async (user, index) => {
//     await new Promise((resolve) => setTimeout(resolve, index * 10000));
//     const reference = user.ref;
//     await fireEvents(reference);
//   });
// };

const fireEvents = async (reference) => {
  const userFlight = await searchFlights(reference);
  await cheapestFlightScannedToday(userFlight);
  await checkMaximumHoliday(userFlight.ref);
};

const fireAllJobs = async () => {
  const allUsers = await getAllDocuments();

  if (cluster.isPrimary) {
    console.log(`Primary ${process.pid} is running`);
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

const main = async () => {
  cron.schedule("0 */12 * * *", async () => {
    await fireAllJobs();
  });
};

// main();
fireAllJobs();
