import path from "path";
require("dotenv").config(path.join(__dirname, "..", "..", "..", ".env"));
console.log(path.join(__dirname, "..", "..", ".env"));
import cluster from "node:cluster";
const numCPUs = require("node:os").cpus().length;
import process from "node:process";
const axios = require("axios").default;
import si from 'systeminformation';
import "reflect-metadata"


// UserFlights

// Puppeteer Bundles / Individuals

import searchFlights from "../puppeteer/bundle/firstTimeSearch";
import { cheapestFlightScannedToday, checkMaximumHoliday, checkIfFlightTimeForScan, getAllDocuments, changeFlightScanStatusByReferenceId, changePIDByReference, changeFlightScanStatusByPID, changePIDToZero, checkAmountOfProcessesInUse, getUserFlightByReference, checkIfAllFlightTimeForScan, searchFlightByPID, checkFlightsBeingScanned, checkIfFlightTimeForScanAndUpdate, statusChangeByReference } from "../models/userFlight.model";

// Database things
import { mongoConnect } from "../../services/mongo";
import { AppDataSource } from "../data-source";
import { User } from "../entity/user.entity";
import { UserFlightTypeORM } from "../entity/user-flight.entity";

(async () => {
  await mongoConnect();
})();


AppDataSource.initialize()
  .then(async () => {
    console.log("Database has been setup ✅")
    const userRepository = AppDataSource.getRepository(User)
    const test = await userRepository.find()
    console.log(test)
    const userFlightRepository = AppDataSource.getRepository(UserFlightTypeORM)
    const nextTest = await userFlightRepository.find({
      // relations: {
      //   dates: true
      // }
    })
    console.log(nextTest[0].dates)
  })
  .catch((error) => console.log(`❌❌ Database broke ❌❌ - ${error}`))

// ON_DEATH(function(SIGTERM, err) {
//   try {
//     var replicateCount = await axios(
//       "http://localhost:2375/v1.41/services/worker"
//     );
//     console.log(
//       `Number of Replicas: ${replicateCount.data.Spec.Mode.Replicated.Replicas}`
//     );
//     console.log(
//       `Version number for Update: ${replicateCount.data.Version.Index}`
//     );
//     // Find amount of scans currently happening
//     var checkFlightsBeingScannedNow = await checkFlightsBeingScanned();
//     console.log(
//       `Amount of flights being scanned ${checkFlightsBeingScannedNow}`
//     );
//     // Versus out the number of scans needed
//     var numberOfScansNeededNow = await numberOfScansNeeded();
//     console.log(`Number of scans needed: ${numberOfScansNeededNow}`);
//     await new Promise((r) => setTimeout(r, 2000));
//   } catch (error) {
//     console.log("ERROR OCCURED");
//     console.log(error);
//   }

//   try {
//     const test = await axios.post(
//       `http://0.0.0.0:2375/v1.41/services/worker/update?version=${replicateCount.data.Version.Index}`,
//       {
//         Name: "worker",
//         Mode: {
//           Replicated: {
//             Replicas:
//               checkFlightsBeingScannedNow + numberOfScansNeededNow - 1 > 8
//                 ? 8
//                 : checkFlightsBeingScannedNow + numberOfScansNeededNow - 1,
//           },
//         },
//         RollbackConfig: {
//           Delay: 1000000000,
//           FailureAction: "pause",
//           MaxFailureRatio: 0.15,
//           Monitor: 15000000000,
//           Parallelism: 1,
//         },
//         TaskTemplate: {
//           ContainerSpec: {
//             Image: "coldbolt/skyscannerplus-checker-worker:0.0.1",
//           },
//           Resources: {
//             Reservations: { NanoCPUs: 1000000000 },
//           },
//           RestartPolicy: {
//             Condition: "none",
//             Delay: 10000000000,
//             MaxAttempts: 0,
//           },
//         },
//         UpdateConfig: {
//           Delay: 1000000000,
//           FailureAction: "pause",
//           MaxFailureRatio: 0.15,
//           Monitor: 15000000000,
//           Parallelism: 2,
//         },
//       }
//     );
//     console.log(test);
//   } catch (error) {
//     console.log("ERROR MATE");
//     console.log(error);
//   }
// })

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

const numberOfScansNeeded = async () => {
  console.log(numCPUs);
  const numberScans = await checkIfAllFlightTimeForScan();
  console.log(numberScans.length);
  return numberScans.length;
};

const fireEvents = async (reference: string) => {
  const flightsObject = await searchFlights(reference);
  if (!flightsObject) return false
  const { userFlight, verifyFlights } = flightsObject
  console.log(`What is this ${verifyFlights}`);
  if (verifyFlights === false) {
    console.log(`It's false`);
    return false;
  }
  if (userFlight) {
    await cheapestFlightScannedToday(userFlight);
    await checkMaximumHoliday(userFlight.ref);
  }


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
  // const checkIfJobAvailable = async () => {
  //   console.log("I have fired checkIfJobAvailable");
  //   return await checkIfUserFlightAvailable();
  // };
  // const checkIfJobAvailableQuestion = async () => {
  //   const check = await checkIfJobAvailable();
  //   return check ? true : false;
  // };
  const cpusCurrentlyBeingUsed = await checkAmountOfProcessesInUse();
  console.log(`How many CPUs in use? ${cpusCurrentlyBeingUsed}`);

  // if (cluster.isPrimary) {
  //   console.log(`Primary ${process.pid} is running`);
  // Fork workers.

  // const cpuNeededAnswer = await cpusNeeded();
  // for (let i = cpusCurrentlyBeingUsed; i < numCPUs && await checkIfJobAvailable(); i++) {
  //   console.log("The for loop for cluster.isPrimary has been fired");
  //   console.log("cpuInUse is currently: " + cpusCurrentlyBeingUsed);
  //   console.log(
  //     `What is checkIfJobAvailable: ${await checkIfJobAvailableQuestion()}`
  //   );
  //   if (await checkIfJobAvailableQuestion()) {
  //     // if (1>2) {
  //     cluster.fork();
  //     await new Promise((r) => setTimeout(r, 2000));
  //   } else {
  //     console.log("## DISCONNECT ##");
  //     console.log("## DISCONNECT ##");
  //     console.log("Killing process");
  //     cluster.disconnect();
  //   }
  // }
  // cluster.on("exit", async (worker, code, signal) => {
  //   console.log(`worker ${worker.process.pid} died`);
  //   if (await searchFlightByPID(worker.process.pid)) {
  //     await changeFlightScanStatusByPID(worker.process.pid, false);
  //     await changePIDToZero(worker.process.pid);
  //   } else {
  //     console.log("Worked has fully died and had no work job");
  //   }
  // });
  // } else if (cpusCurrentlyBeingUsed < 5) {
  // CLUSTER PROCESSES WORKING ON THIS

  console.log(`Worker ${process.pid} started`);


  // await new Promise((r) =>
  //   // setTimeout(r, Math.random(Math.floor * 1000) * 30000)
  //   setTimeout(r, Math.random(Math.floor * 1000) * 278346)

  // );
  // console.log(`What is this worker ID ${cluster.worker.id}`);
  // let test = await checkIfUserFlightAvailable()
  let test = await checkIfFlightTimeForScanAndUpdate();
  while (test) {
    // const flightToBeScanned = await checkIfFlightTimeForScanAndUpdate();
    const flightToBeScanned = test;

    console.log(flightToBeScanned)

    if (flightToBeScanned) {
      console.log(flightToBeScanned);
      const reference = flightToBeScanned.ref;
      console.log(`#############################`);
      console.log(`>>> ${flightToBeScanned.ref} will be looked at`);
      console.log(`#############################`);
      console.log(reference);
      console.log("setting flight status by reference");
      await changeFlightScanStatusByReferenceId(reference, true);
      console.log("change pid by reference");
      flightToBeScanned.workerPID = process.pid
      await changePIDByReference(reference, process.pid);
      console.log(`${reference} - scan started`);
      // await new Promise((r) => setTimeout(r, 20000000));
      // await statusChangeByReference(reference, "running")
      await fireEvents(reference);
      console.log(`Worker ${process.pid} ended`);
      console.log("Right time to do some cleanup");

      // test = await checkIfUserFlightAvailable()
      test = await checkIfFlightTimeForScanAndUpdate()
      // await new Promise((r) => setTimeout(r, Math.ceil(Math.random() * 4) * 1000));
    } else {
      console.log("worker should die here");
    }
  }
  // await axios.post("http://host.docker.internal:2375/v1.41/containers/prune", {}) 
  // await new Promise((r) => setTimeout(r, 2000));
  console.log("Killing")
  process.exit(137);

  // try {
  //   console.log("Cleanup time");
  //   var replicateCount = await axios(
  //     "http://host.docker.internal:2375/v1.41/services/worker"
  //   );
  //   console.log(
  //     `Number of Replicas: ${replicateCount.data.Spec.Mode.Replicated.Replicas}`
  //   );
  //   console.log(
  //     `Version number for Update: ${replicateCount.data.Version.Index}`
  //   );
  //   // Find amount of scans currently happening
  //   var checkFlightsBeingScannedNow = await checkFlightsBeingScanned();
  //   console.log(
  //     `Amount of flights being scanned ${checkFlightsBeingScannedNow}`
  //   );
  //   // Versus out the number of scans needed
  //   var numberOfScansNeededNow = await numberOfScansNeeded();
  //   console.log(`Number of scans needed: ${numberOfScansNeededNow}`);
  //   await new Promise((r) => setTimeout(r, 2000));
  // } catch (error) {
  //   console.log("ERROR OCCURED");
  //   console.log(error);
  // }
  // try {
  //   await new Promise((r) =>
  //     setTimeout(r, Math.random(Math.floor * 1000) * 10000)
  //   );
  //   const test = await axios.post(
  //     `http://host.docker.internal:2375/v1.41/services/worker/update?version=${replicateCount.data.Version.Index}`,
  //     {
  //       Name: "worker",
  //       Mode: {
  //         Replicated: {
  //           Replicas:
  //             checkFlightsBeingScannedNow + numberOfScansNeededNow >= 4
  //               ? 3
  //               : checkFlightsBeingScannedNow + numberOfScansNeededNow,
  //         },
  //       },
  //       RollbackConfig: {
  //         Delay: 1000000000,
  //         FailureAction: "pause",
  //         MaxFailureRatio: 0.15,
  //         Monitor: 15000000000,
  //         Parallelism: 1,
  //       },
  //       TaskTemplate: {
  //         ContainerSpec: {
  //           Image: "coldbolt/skyscannerplus-checker-worker:0.0.1",
  //         },
  //         Resources: {
  //           Reservations: { NanoCPUs: 1000000000 },
  //         },
  //         RestartPolicy: {
  //           Condition: "none",
  //           Delay: 10000000000,
  //           MaxAttempts: 0,
  //         },
  //       },
  //       UpdateConfig: {
  //         Parallelism: 1,
  //         Delay: 2000000000,
  //         FailureAction: "pause",
  //         MaxFailureRatio: 0.15,
  //         Monitor: 15000000000,
  //       },
  //     }
  //   );
  //   console.log(test);
  //   if(test.data.status === 200) {
  //     process.exit()
  //   }
  // } catch (error) {
  //   console.log("ERROR MATE");
  //   console.log(error);
  //   const test = await axios.post(
  //     `http://host.docker.internal:2375/v1.41/services/worker/update?version=${replicateCount.data.Version.Index}`,
  //     {
  //       Name: "worker",
  //       Mode: {
  //         Replicated: {
  //           Replicas:
  //             checkFlightsBeingScannedNow + numberOfScansNeededNow > 5
  //               ? 4
  //               : checkFlightsBeingScannedNow + numberOfScansNeededNow,
  //         },
  //       },
  //       RollbackConfig: {
  //         Delay: 1000000000,
  //         FailureAction: "pause",
  //         MaxFailureRatio: 0.15,
  //         Monitor: 15000000000,
  //         Parallelism: 1,
  //       },
  //       TaskTemplate: {
  //         ContainerSpec: {
  //           Image: "coldbolt/skyscannerplus-checker-worker:0.0.1",
  //         },
  //         Resources: {
  //           Reservations: { NanoCPUs: 1000000000 },
  //         },
  //         RestartPolicy: {
  //           Condition: "none",
  //           Delay: 10000000000,
  //           MaxAttempts: 0,
  //         },
  //       },
  //       UpdateConfig: {
  //         Parallelism: 1,
  //         Delay: 2000000000,
  //         FailureAction: "pause",
  //         MaxFailureRatio: 0.15,
  //         Monitor: 15000000000,
  //       },
  //     }
  //   );
  //   console.log(test);
  //   process.exit()
  // }
};

const main = async () => {
  await new Promise((r) => setTimeout(r, Math.ceil(Math.random() * 4) * 1000));
  await fireAllJobs();
  // cron.schedule("0 */12 * * *", async () => {
  // cron.schedule("*/1 * * * *", async () => {
  //   await fireAllJobs();
  // });
};
main();
// fireEvents("GBITYK1EHD");
// fireAllJobs();
// cpuCount()

export { }
