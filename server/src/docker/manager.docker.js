const path = require("path");
require("dotenv").config(path.join(__dirname, "..", "..","..", ".env"));
console.log(path.join(__dirname, "..", "..", ".env"));
const cron = require("node-cron");
const cluster = require("node:cluster");
const numCPUs = require("node:os").cpus().length;
const process = require("node:process");
const axios = require('axios').default;

// UserFlights

// Puppeteer Bundles / Individuals

const searchFlights = require("../puppeteer/bundle/firstTimeSearch");
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
  checkIfAllFlightTimeForScan,
  searchFlightByPID,
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

const cpuCount = async () => {
  console.log(numCPUs);
  const numberScans = await checkIfAllFlightTimeForScan();
  console.log(numberScans.length);
};

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
  const cpusNeeded = async () => {
    const response = await checkIfAllFlightTimeForScan();
    const numberOfJobs = response.length;
    if (numberOfJobs > 5) {
      console.log("Using 5 cores");
      return 5;
    } else {
      console.log(`Only ${numberOfJobs} cores needed`);
      return numberOfJobs;
    }
  };

  const checkIfUserFlightAvailable = async () => {
    // Check to see if any flights should be scanned now
    console.log("Fired checkIfUserFlightAvailable");
    return await checkIfFlightTimeForScan();
    // Verification if we're good to go with that user incase something is wrong
    // const checkForUserFlightOutcome = await shouldThisFlightBeScanned(checkForUserFlight);
  };
  const checkIfJobAvailable = async() => {
    console.log("I have fired checkIfJobAvailable")
    return await checkIfUserFlightAvailable()
  }
  const checkIfJobAvailableQuestion = async () => {
    const check = await checkIfJobAvailable;
    return check ? true : false;
  };

// 


  const cpusCurrentlyBeingUsed = await checkAmountOfProcessesInUse();
  console.log(`How many CPUs in use? ${cpusCurrentlyBeingUsed}`);

  if (cluster.isPrimary) {
    console.log(`Primary ${process.pid} is running`);
    // Fork workers.

    const cpuNeededAnswer = await cpusNeeded();
    for (let i = cpusCurrentlyBeingUsed; i < numCPUs && await checkIfJobAvailable(); i++) {
      console.log("The for loop for cluster.isPrimary has been fired");
      console.log("cpuInUse is currently: " + cpusCurrentlyBeingUsed);
      console.log(
        `What is checkIfJobAvailable: ${await checkIfJobAvailableQuestion()}`
      );
      const response = await axios("http://localhost:2375/v1.41/version")
      await new Promise((r) => setTimeout(r, 200000));

      console.log(response)
      if (await checkIfJobAvailableQuestion()) {
        // if (1>2) {
        cluster.fork();
        await new Promise((r) => setTimeout(r, 2000));
      } else {
        console.log("## DISCONNECT ##");
        console.log("## DISCONNECT ##");
        console.log("Killing process");
        cluster.disconnect();
      }
    }
    cluster.on("exit", async (worker, code, signal) => {
      console.log(`worker ${worker.process.pid} died`);
      if (await searchFlightByPID(worker.process.pid)) {
        await changeFlightScanStatusByPID(worker.process.pid, false);
        await changePIDToZero(worker.process.pid);
      } else {
        console.log("Worked has fully died and had no work job");
      }
    });
  }
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
