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
  checkIfFlightTimeForScan,
  getAllDocuments,
  changeFlightScanStatusByReference,
  changePIDByReference,
  changeFlightScanStatusByPID,
  changePIDToZero,
  checkAmountOfProcessesInUse,
  getUserFlightByReference,
  checkIfAllFlightTimeForScan
} = require("./models/userFlight.model");

// Database things
const { mongoConnect } = require("../services/mongo");

(async () => {
  await mongoConnect();
})();

// const server = http.createServer(app);

// // Start Server
// if (cluster.isPrimary) {
//   server.listen(process.env.PORT || 3000, () => {
//     console.log(`Listening on port ${process.env.PORT}`);
//   });
// }

// const fireAllJobs = async () => {
//   const allUsers = await getAllDocuments();
//   allUsers.forEach(async (user, index) => {
//     await new Promise((resolve) => setTimeout(resolve, index * 10000));
//     const reference = user.ref;
//     await fireEvents(reference);
//   });
// };

const cpuCount = async() => {
  console.log(numCPUs)
  const numberScans = await checkIfAllFlightTimeForScan()
  console.log(numberScans.length)
}

const fireEvents = async (reference) => {
  const { user: userFlight, verifyFlights } = await searchFlights(reference);
  console.log(`What is this ${verifyFlights}`);
  if (verifyFlights === false) {
    console.log(`It's false`);
    return false;
  }
  await cheapestFlightScannedToday(userFlight);
  await checkMaximumHoliday(userFlight.ref);
};

const fireAllJobs = async () => {
  // const allUsers = await getAllDocuments();
  // for (let users of allUsers) {
  //   const lastSearch = Date.parse(users.scanDate.at(-1).dateOfScanLoop)
  //   console.log(lastSearch + 43200000)
  //   const todaysDate = new Date()
  //   console.log(Date.parse(todaysDate))
  // }
  // const allUsersScansNeeded = allUsers.filter((user, index) => {
  // const shouldThisFlightBeScanned = async (user) => {
  //   if (user.isBeingScanned === true) {
  //     console.log(`user ref: ${user.ref} is being scanned`);
  //     return false;
  //   }
  //   if (!user.scanDate[0] || user?.scannedLast === 0) {
  //     console.log(user.ref);
  //     console.log(`New scan needed for ${user.ref} now`);
  //     return true;
  //   }
  //   console.log(`There's scanData for ${user.ref}`);
  //   const lastSearch = user.scannedLast;
  //   console.log(`What is this: ${lastSearch}`);
  //   console.log(`and this ${user.scannedLast}`);
  //   const timeWhenNewScanNeeded = lastSearch + 43200000;
  //   const todaysDate = new Date();
  //   const todaysDateToMili = Date.parse(todaysDate);
  //   console.log(`Todays Date to mili ${todaysDateToMili}`);
  //   console.log(`timeWhenNewScanNeeded is: ${timeWhenNewScanNeeded}`);
  //   console.log(
  //     `Is todaysDateToMili bigger than timeWhenNewScanNeeded for ${user.ref}:${
  //       todaysDateToMili > timeWhenNewScanNeeded
  //     }`
  //   );
  //   return todaysDateToMili > timeWhenNewScanNeeded ? true : false;
  // };

  // console.log(allUsersScansNeeded);

  const cpusNeeded = async () => {
    const response = await checkIfAllFlightTimeForScan()
    const numberOfJobs = response.length
    if (numberOfJobs > 5) {
      console.log("Using 5 cores")
      return 5
    } else {
      console.log(`Only ${numberOfJobs} cores needed`)
      return numberOfJobs
    }
  }
  
  const checkIfUserFlightAvailable = async () => {
    // Check to see if any flights should be scanned now
    console.log("Fired checkIfUserFlightAvailable");
    return await checkIfFlightTimeForScan();
    // Verification if we're good to go with that user incase something is wrong
    // const checkForUserFlightOutcome = await shouldThisFlightBeScanned(checkForUserFlight);
  };
  const checkIfJobAvailable = await checkIfUserFlightAvailable()
  const cpusCurrentlyBeingUsed = await checkAmountOfProcessesInUse();
  console.log(`How many CPUs in use? ${cpusCurrentlyBeingUsed}`);

  if (cluster.isPrimary) {
    console.log(`Primary ${process.pid} is running`);
    // Fork workers.

    const cpuNeededAnswer = await cpusNeeded()
    for (let i = cpusCurrentlyBeingUsed; i < 5 && checkIfJobAvailable; i++) {
      console.log("The for loop for cluster.isPrimary has been fired");
      console.log("cpuInUse is currently: " + cpusCurrentlyBeingUsed);
      cluster.fork();
      await new Promise(r => setTimeout(r, 10000));
    }
    cluster.on("exit", async (worker, code, signal) => {
      console.log(`worker ${worker.process.pid} died`);
      await changeFlightScanStatusByPID(worker.process.pid, false);
      await changePIDToZero(worker.process.pid);
    });
  } else if (cpusCurrentlyBeingUsed < 1) {
    // CLUSTER PROCESSES WORKING ON THIS

    console.log(`Worker ${process.pid} started`);
    console.log(`What is this worker ID ${cluster.worker.id}`);

    
    while (await checkIfUserFlightAvailable()) {
      if (await checkIfUserFlightAvailable()) {
        const flightToBeScanned = await checkIfUserFlightAvailable();
        console.log(flightToBeScanned);
        reference = flightToBeScanned.ref;
        console.log(`#############################`);
        console.log(`>>> ${flightToBeScanned.ref} will be looked at`);
        console.log(`#############################`);
        console.log(reference);
        console.log("setting flight status by reference");
        await changeFlightScanStatusByReference(reference, true);
        console.log("change pid by reference");
        await changePIDByReference(reference, process.pid);
        console.log(`${reference} - scan started`);
        await fireEvents(reference);
        console.log(`Worker ${process.pid} ended`);
      } else {
        console.log("worker should die here");
      }
    }
    console.log("worker should die here");
  }
  // cluster.worker.disconnect()
};

const main = async () => {
  await fireAllJobs();
  // cron.schedule("0 */12 * * *", async () => {
  cron.schedule("*/1 * * * *", async () => {
    await fireAllJobs();
  });
};

main();
// fireAllJobs();
// cpuCount()
