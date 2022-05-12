const path = require("path");
require("dotenv").config(path.join(__dirname, "..", "..", ".env"));
console.log(path.join(__dirname, "..", "..", ".env"));
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
  changeFlightScanStatusByReference,
  changePIDByReference,
  changeFlightScanStatusByPID,
  changePIDToZero,
  checkAmountOfProcessesInUse,
  getUserFlightByReference,
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
  // for (let users of allUsers) {
  //   const lastSearch = Date.parse(users.scanDate.at(-1).dateOfScanLoop)
  //   console.log(lastSearch + 43200000)
  //   const todaysDate = new Date()
  //   console.log(Date.parse(todaysDate))
  // }
  const allUsersScansNeeded = allUsers.filter((user, index) => {
      if (user.isBeingScanned === true) {
        console.log(`user ref: ${user.ref} is being scanned`);
        return false;
      }
      if (!user.scanDate[0] || user?.scannedLast === undefined) {
        console.log(user.ref);
        console.log(`New scan needed for ${user.ref} now`);
        return true;
      }
      console.log(`There's scanData for ${user.ref}`);
      const lastSearch = user.scannedLast;
      console.log(`What is this: ${lastSearch}`);
      console.log(`and this ${user.scannedLast}`);
      const timeWhenNewScanNeeded = lastSearch + 43200000;
      const todaysDate = new Date();
      const todaysDateToMili = Date.parse(todaysDate);
      console.log(`Todays Date to mili ${todaysDateToMili}`)
      console.log(`timeWhenNewScanNeeded is: ${timeWhenNewScanNeeded}`)
      console.log(`Is todaysDateToMili bigger than timeWhenNewScanNeeded:${todaysDateToMili > timeWhenNewScanNeeded}`);
      return todaysDateToMili > timeWhenNewScanNeeded ? true : false;
  });

  const cpusCurrentlyBeingUsed = await checkAmountOfProcessesInUse();
  console.log(`How many CPUs in use? ${cpusCurrentlyBeingUsed}`);

  if (cluster.isPrimary) {
    console.log(`Primary ${process.pid} is running`);
    // Fork workers.
    for (let i = cpusCurrentlyBeingUsed; i <= 6; i++) {
      cluster.fork();
    }
    cluster.on("exit", async (worker, code, signal) => {
      console.log(`worker ${worker.process.pid} died`);
      await changeFlightScanStatusByPID(worker.process.pid, false);
      await changePIDToZero(worker.process.pid);
    });
  } else {
    console.log(`Worker ${process.pid} started`);
    console.log(`What is this worked ID ${cluster.worker.id}`);
    await new Promise((resolve) =>
      setTimeout(resolve, cluster.worker.id * 1000)
    );
    // database call

    if (allUsersScansNeeded[cluster.worker.id]) {
      reference = allUsersScansNeeded[cluster.worker.id].ref;
    } else {
      console.log("worker should die here");
      return;
    }
    console.log(reference);
    await new Promise((resolve) =>
      setTimeout(resolve, cluster.worker.id * 1000)
    );
    console.log("setting flight status by reference");
    await changeFlightScanStatusByReference(reference, true);
    console.log("change pid by reference");
    await changePIDByReference(reference, process.pid);
    console.log(`${reference} - scan started`);
    await fireEvents(reference);
    console.log(`Worker ${process.pid} ended`);
  }
};

const main = async () => {
  // cron.schedule("0 */12 * * *", async () => {
  cron.schedule("59 23 * * *", async () => {
    await fireAllJobs();
  });
};

// main();
fireAllJobs();
