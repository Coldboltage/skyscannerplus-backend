const path = require("path");
require("dotenv").config(path.join(__dirname, "..", "..", "..", ".env"));
console.log(path.join(__dirname, "..", "..", ".env"));
const cron = require("node-cron");
const cluster = require("node:cluster");
const numCPUs = require("node:os").cpus().length;
const process = require("node:process");
const axios = require("axios").default;
const superagent = require("superagent");

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
  checkFlightsBeingScanned,
} = require("../models/userFlight.model");

// Database things
const { mongoConnect } = require("../../services/mongo");

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

const numberOfScansNeeded = async () => {
  console.log(numCPUs);
  const numberScans = await checkIfAllFlightTimeForScan();
  console.log(numberScans.length);
  return numberScans.length;
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

const initSwarm = async () => {
  try {
    console.log("FIRING THE BIG CANNON");
    var codeTime = await axios.post("http://localhost:2375/swarm/init", {
      ListenAddr: "127.0.0.1",
      AdvertiseAddr: "192.168.1.2",
      ForceNewCluster: false,
      Spec: {
        CAConfig: {},
        Dispatcher: {},
        EncryptionConfig: {
          AutoLockManagers: false,
        },
        Orchestration: {},
        Raft: {},
      },
    });
    console.log(codeTime.data);
  } catch (error) {
    console.log(error);
  }

  if (true) {
    // try {
    //    await axios.post("http://localhost:2375/v1.41/services/create", {
    //   Name: "manager",
    //   Mode: {
    //     Replicated: {
    //       Replicas: 1,
    //     },
    //   },
    //   RollbackConfig: {
    //     Delay: 1000000000,
    //     FailureAction: "pause",
    //     MaxFailureRatio: 0.15,
    //     Monitor: 15000000000,
    //     Parallelism: 1,
    //   },
    //   TaskTemplate: {
    //     ContainerSpec: {
    //       Image: "coldbolt/skyscannerplus-checker-manager:0.0.3",
    //     },
    //     Resources: {
    //       Reservations: { NanoCPUs: 1000000000 },
    //     },
    //     // RestartPolicy: {
    //     //   Condition: "on-failure",
    //     //   Delay: 10000000000,
    //     //   MaxAttempts: 10,
    //     // },
    //   },
    //   UpdateConfig: {
    //     Delay: 1000000000,
    //     FailureAction: "pause",
    //     MaxFailureRatio: 0.15,
    //     Monitor: 15000000000,
    //     Parallelism: 2,
    //   },
    // });
    // } catch (error) {
    //   console.log(error.data)
    // }

    // WORKER
    try {
      await axios.post("http://localhost:2375/v1.41/services/create", {
        Name: "worker",
        Mode: {
          Replicated: {
            Replicas: 0,
          },
        },
        RollbackConfig: {
          Delay: 1000000000,
          FailureAction: "pause",
          MaxFailureRatio: 0.15,
          Monitor: 15000000000,
          Parallelism: 1,
        },
        TaskTemplate: {
          ContainerSpec: {
            Image: "coldbolt/skyscannerplus-checker-worker:0.0.1",
          },
          Resources: {
            Reservations: { NanoCPUs: 1000000000 },
          },
          RestartPolicy: {
            Condition: "none",
            Delay: 10000000000,
            MaxAttempts: 0,
          },
        },
        UpdateConfig: {
          Parallelism: 1,
          Delay: 2000000000,
          FailureAction: "pause",
          MaxFailureRatio: 0.15,
          Monitor: 15000000000,
        },
      });
    } catch (error) {
      console.log(error);
    }
    await new Promise((r) => setTimeout(r, 2000));

    // try {
    //   const test = await axios(
    //     "http://localhost:2375/v1.41/services/worker/update", {}
    //   );
    //   console.log(test);
    // } catch (error) {
    //   console.log("ERROR MATE");
    //   console.log(error);
    // }
  }
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
  const checkIfJobAvailable = async () => {
    console.log("I have fired checkIfJobAvailable");
    return await checkIfUserFlightAvailable();
  };
  const checkIfJobAvailableQuestion = async () => {
    const check = await checkIfJobAvailable();
    return check ? true : false;
  };

  // Checks the amount of processes being used via looking at PID over 0.
  const cpusCurrentlyBeingUsed = await checkAmountOfProcessesInUse();
  console.log(`How many CPUs in use? ${cpusCurrentlyBeingUsed}`);

  if (cluster.isPrimary) {
    console.log(`Primary ${process.pid} is running`);
    // Create new containers.
    // await new Promise((r) => setTimeout(r, 200000));
    // const cpuNeededAnswer = await cpusNeeded();
    // cpusCurrentlyBeingUsed previously checked the amount of jobs being performed. We don't need this anymore
    // Docker will create new machines based upon the work which we currently have.
    // An upper limit of jobs can be undertaken
    // if (cpusCurrentlyBeingUsed < 3 && await checkIfJobAvailable()) {
      console.log("The for loop for cluster.isPrimary has been fired");
      console.log("cpuInUse is currently: " + cpusCurrentlyBeingUsed);
      console.log(
        `What is checkIfJobAvailable: ${await checkIfJobAvailableQuestion()}`
      );
      // It checks if any job is available which will return true
      // if (await checkIfJobAvailableQuestion()) {
        // if (1>2) {
        const response = await axios("http://0.0.0.0:2375/v1.41/version");
        // console.log(response.data);
        try {
          var replicateCount = await axios(
            "http://0.0.0.0:2375/v1.41/services/worker"
          );
          console.log(
            `Number of Replicas: ${replicateCount.data.Spec.Mode.Replicated.Replicas}`
          );
          console.log(
            `Version number for Update: ${replicateCount.data.Version.Index}`
          );
          // Find amount of scans currently happening
          var checkFlightsBeingScannedNow = await checkFlightsBeingScanned();
          console.log(
            `Amount of flights being scanned ${checkFlightsBeingScannedNow}`
          );
          // Versus out the number of scans needed
          var numberOfScansNeededNow = await numberOfScansNeeded();
          console.log(`Number of scans needed: ${numberOfScansNeededNow}`);
          // await new Promise((r) => setTimeout(r, 2000));
        } catch (error) {
          console.log("ERROR OCCURED");
          console.log(error);
        }

        try {
          const test = await axios.post(
            `http://0.0.0.0:2375/v1.41/services/worker/update?version=${replicateCount.data.Version.Index}`,
            {
              Name: "worker",
              Mode: {
                Replicated: {
                  Replicas:
                    checkFlightsBeingScannedNow + numberOfScansNeededNow >= 5
                      ? 5
                      : checkFlightsBeingScannedNow + numberOfScansNeededNow,
                },
              },
              RollbackConfig: {
                Delay: 1000000000,
                FailureAction: "pause",
                MaxFailureRatio: 0.15,
                Monitor: 15000000000,
                Parallelism: 1,
              },
              TaskTemplate: {
                ContainerSpec: {
                  Image: "coldbolt/skyscannerplus-checker-worker:0.0.1",
                },
                Resources: {
                  Reservations: { NanoCPUs: 1000000000 },
                },
                RestartPolicy: {
                  Condition: "none",
                  Delay: 10000000000,
                  MaxAttempts: 0,
                },
              },
              UpdateConfig: {
                Delay: 1000000000,
                FailureAction: "pause",
                MaxFailureRatio: 0.15,
                Monitor: 15000000000,
                Parallelism: 2,
              },
            }
          );
          console.log(test);
        } catch (error) {
          console.log("ERROR MATE");
          console.log(error);
        }

        // try {
        //   const response = await axios(
        //     "http://localhost:2375/v1.41/services/worker/update"
        //   );
        //   console.log(response.data)
        // } catch (error) {
        //   console.log(error);
        // }

        // await axios.post("http://localhost:2375/v1.41/containers/worker/start");
        console.log("Setup complete");
        // await new Promise((r) => setTimeout(r, 200000));
      // } else {
      //   console.log("## DISCONNECT ##");
      //   console.log("## DISCONNECT ##");
      //   console.log("Killing process");
      //   cluster.disconnect();
      // }
    }
    // cluster.on("exit", async (worker, code, signal) => {
    //   console.log(`worker ${worker.process.pid} died`);
    //   if (await searchFlightByPID(worker.process.pid)) {
    //     await changeFlightScanStatusByPID(worker.process.pid, false);
    //     await changePIDToZero(worker.process.pid);
    //   } else {
    //     console.log("Worked has fully died and had no work job");
    //   }
    // }
    // );
  }
// };

const main = async () => {
  await initSwarm();
  await fireAllJobs();
  // cron.schedule("0 */12 * * *", async () => {
  cron.schedule("*/1 * * * *", async () => {
    await fireAllJobs();
  });
};

main();
// fireAllJobs();
// cpuCount()
