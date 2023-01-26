import { LessThan, LessThanOrEqual, MoreThan } from "typeorm";
import { AppDataSource } from "../data-source";
import { Dates, UserFlightTypeORM } from "../entity/user-flight.entity";
import { where } from "./userFlight.mongo";

const userFlightDatabase = require("./userFlight.mongo");
const searchFlights = require("../puppeteer/bundle/firstTimeSearch");
const testEmail = require("../../services/reference.email");
const dayjs = require("dayjs");
// TYPEORM

const userFlightTypeORM = AppDataSource.getRepository(UserFlightTypeORM)
const userFlightDateORM = AppDataSource.getRepository(Dates)


// Get all documents
export const getAllDocuments = async () => {
  return await userFlightDatabase.find({});
};

const getAllReferences = async () => {
  const documents = await userFlightDatabase.find({});
  const references = documents.map((doc: any) => doc.ref);
  return references;
};

const checkIfScanDead = async () => {
  const time = new Date().getTime() - 120000;
  const userFlight = await userFlightDatabase.find(
    {
      isBeingScanned: true,
      lastUpdated: { $lt: time },
    }
    // {
    //   isBeingScanned: false,
    //   workerPID: 0,
    //   nextScan: new Date().getTime() + 60000
    // }
  );
  console.log(userFlight);
  for (let task of userFlight) {
    task.isBeingScanned = false;
    task.workerPID = 0;
    task.nextScan = new Date().getTime() + 120000
    await task.save();
  }
};

export const checkIfAllFlightTimeForScan = async () => {
  console.log(`checkIfFlightTimeForScan Fired`);
  const currentTime = new Date().getUTCMilliseconds();
  // Next Scan adds 43200000ms to the last scan. If the current time is over this, then we want to scan
  // return await userFlightDatabase.find({$or : [ {isBeingScanned: false},{nextScan: 0}, {nextScan: {$lt: new Date().getTime() }}]});
  const test = await userFlightDatabase.find({
    $or: [
      {
        $and: [
          { isBeingScanned: false },
          // {
          //   scannedLast: {
          //     $lt: { $add: [new Date().getUTCMilliseconds(), 100000] },
          //   },
          // },
          { nextScan: 0 },
          { "dates.returnDate": { $gt: new Date().toISOString() } },
        ],
      },
      // {
      //   $and: [
      //     { isBeingScanned: false },
      //     // { scannedLast: { $lt: new Date().getUTCMilliseconds() + 100000 } },
      //     { nextScan: { $lt: new Date().getTime() } },
      //     { "dates.returnDate": { $gt: new Date().toISOString() } },
      //   ],
      // },
    ],
  });
  console.log("###### TEST SETUP ###### ")
  console.log("###### TEST SETUP ###### ")
  console.log(test)
  console.log("###### TEST SETUP ###### ")
  console.log("###### TEST SETUP ###### ")

  return test
};

const checkIfAllFlightTimeForScanAndIfScansHappening = async () => {
  console.log(`checkIfFlightTimeForScan Fired`);
  const currentTime = new Date().getTime() - 30000;
  // Next Scan adds 43200000ms to the last scan. If the current time is over this, then we want to scan
  // return await userFlightDatabase.find({$or : [ {isBeingScanned: false},{nextScan: 0}, {nextScan: {$lt: new Date().getTime() }}]});
  const test = await userFlightDatabase.find({
    $or: [
      {
        $and: [
          { isBeingScanned: false },
          { nextScan: 0 },
          { "dates.returnDate": { $gt: new Date().toISOString() } },
        ],
      },
      {
        $and: [
          { isBeingScanned: false },
          { nextScan: { $lt: new Date().getTime() } },
          { "dates.returnDate": { $gt: new Date().toISOString() } },
        ],
      },
      {
        $and: [
          { isBeingScanned: true },
          { "dates.returnDate": { $gt: new Date().toISOString() } },
        ],
      },
      {
        // Don't delete too early, give process time to quit
        $and: [
          { isBeingScanned: false },
          { lastUpdated: { $gt: currentTime } },
          { status: "completed" },
          // Need a way to know if the job actually finished to cancel this then gg.
          { "dates.returnDate": { $gt: new Date().toISOString() } },
        ],
      },
      // {
      //   // If it crashes, this will fix it.
      //   $and: [
      //     { isBeingScanned: true },
      //     { lastUpdated: { $gt: currentTime - 80000 } },
      //     { status: "running" },
      //     // Need a way to know if the job actually finished to cancel this then gg.
      //     { "dates.returnDate": { $gt: new Date().toISOString() } },
      //   ],
      // },
    ],
  });
  return +test.length;
};

const oneHundredSecondWait = async () => {
  console.log("Will this be worked on is this question");
  const numberTest = new Date().valueOf() - 100000;
  console.log(numberTest);
  const test = await userFlightDatabase.find({
    $and: [
      { isBeingScanned: false },
      { nextScan: 0 },
      {
        scannedLast: {
          // $lt:  numberTest,
          $gt: numberTest,
        },
      },
    ],
  });
  console.log(`Test is this ${test.length}`);
  return +test.length;
};

export const checkIfFlightTimeForScan = async () => {
  console.log('checkIfFlightTimeForScan fired')
  const testDate = new Date()
  return await userFlightTypeORM.find({
    where:
    {
      isBeingScanned: false, nextScan: LessThan(new Date()),
      dates: { returnDate: MoreThan(new Date()) }
    }

  })
}

const _checkIfFlightTimeForScan_old = async () => {
  console.log(`checkIfFlightTimeForScan Fired`);

  // Next Scan adds 43200000ms to the last scan. If the current time is over this, then we want to scan
  // return await userFlightDatabase.find({$or : [ {isBeingScanned: false},{nextScan: 0}, {nextScan: {$lt: new Date().getTime() }}]});
  return await userFlightDatabase.findOne({
    $or: [
      {
        $and: [
          { isBeingScanned: false },
          { nextScan: 0 },
          { "dates.returnDate": { $gt: new Date().toISOString() } },
        ],
      },
      {
        $and: [
          { isBeingScanned: false },
          { nextScan: { $lt: new Date().getTime() } },
          { "dates.returnDate": { $gt: new Date().toISOString() } },
        ],
      },
    ],
  });
};

export const checkIfFlightTimeForScanAndUpdate = async (): Promise<UserFlightTypeORM | false> => {
  console.log("Testing checkIfFlightTimeForScanAndUpdate")
  // const userFlight = await userFlightTypeORM.createQueryBuilder("userFlights")
  //   .leftJoinAndSelect("userFlights.dates", "dates")
  //   .where('"isBeingScanned" = :isBeingScanned', {isBeingScanned: false})
  //   .andWhere('"nextScan" < :date', {date: new Date()})
  //   .andWhere('dates.returnDate > :date', {date: new Date()})
  //   .getOne()
  const userFlight = await userFlightTypeORM.findOne({
    where: {
      isBeingScanned: false,
      nextScan: LessThan(new Date()),
      dates: {
        returnDate: MoreThan(new Date())
      }
    }
  })

  console.log(userFlight)
  if (!userFlight) return false
  userFlight.isBeingScanned = true;
  await userFlightTypeORM.save(userFlight);
  return userFlight;
  // return await AppDataSource.transaction(async (transactionalEntityManager) => {
  //   const userFlight = await transactionalEntityManager
  //     .createQueryBuilder(UserFlightTypeORM, "userFlights")
  //     .leftJoinAndSelect("userFlights.dates", "dates")
  //     .where('"isBeingScanned" = :isBeingScanned', {isBeingScanned: false})
  //     .andWhere('"nextScan" < :date', {date: new Date()})
  //     .andWhere('dates.returnDate > :date', {date: new Date()})
  //     .getOne()


  // })

}

export const checkIfFlightTimeForScanAndUpdateOld = async () => {
  console.log(`checkIfFlightTimeForScan Fired`);

  // Next Scan adds 43200000ms to the last scan. If the current time is over this, then we want to scan
  // return await userFlightDatabase.find({$or : [ {isBeingScanned: false},{nextScan: 0}, {nextScan: {$lt: new Date().getTime() }}]});
  const answer = await userFlightDatabase.findOneAndUpdate(
    {
      $or: [
        {
          $and: [
            { isBeingScanned: false },
            { nextScan: 0 },
            { "dates.returnDate": { $gt: new Date().toISOString() } },
          ],
        },
        {
          $and: [
            { isBeingScanned: false },
            { nextScan: { $lt: new Date().getTime() } },
            { "dates.returnDate": { $gt: new Date().toISOString() } },
          ],
        },
      ],
    },
    { isBeingScanned: true }
  );
  answer
    ? console.log("A flight was present")
    : console.log("No flights needed");
  return answer;
};

export const checkFlightsBeingScanned = async () => {
  const response = await userFlightDatabase.find({ isBeingScanned: true });
  return +response.length;
};

const createUser = async (userObject: any) => {
  userObject.dates.departureDateString = dayjs(
    userObject.dates.departureDate
  ).format("dddd DD MMMM YYYY");
  userObject.dates.returnDateString = dayjs(userObject.dates.returnDate).format(
    "dddd DD MMMM YYYY"
  );
  const user = await userFlightDatabase.create(userObject);
  return user._id ? true : false;
};

const updateUserByReference = async (reference: string) => {
  console.log("Fired updateUserByReference");
  console.log(`Reference is ${reference}`);
  const flightUser = await getUserFlightByReference(reference);
  console.log("Flight User found");
  if (flightUser) {
    console.log(flightUser.dates.id)
    await userFlightDateORM.update({id: flightUser.dates.id}, {departureDateString: dayjs(
      flightUser.dates.departureDate
    ).format("dddd DD MMMM YYYY"), returnDateString: dayjs(flightUser.dates.returnDate).format(
      "dddd DD MMMM YYYY"
    )})

    // flightUser.dates.departureDateString = dayjs(
    //   flightUser.dates.departureDate
    // ).format("dddd DD MMMM YYYY");
    // flightUser.dates.returnDateString = dayjs(flightUser.dates.returnDate).format(
    //   "dddd DD MMMM YYYY"
    // );
    // console.log(flightUser.dates.returnDateString);
    // await flightUser.save();

    return flightUser.dates.departureDateString &&
      flightUser.dates.returnDateString
      ? true
      : false;
  }

};

const userTest = () => {
  return { test: "This is a test" };
};

export const getUserFlightByReference = async (reference: string) => {
  console.log(`Fired getUserFlightByReference`);
  return await userFlightTypeORM.findOneBy({ ref: reference });
};

export const changeFlightScanStatusByReferenceId = async (reference: string, status: boolean) => {
  const UserFlight = await getUserFlightByReference(reference);
  if (UserFlight) return await userFlightTypeORM.update({ id: UserFlight.id }, { isBeingScanned: true })
};

// export const changeFlightScanStatusByReferenceOld = async (reference: string, status: string) => {
//   const UserFlight = await getUserFlightByReference(reference);
//   UserFlight.isBeingScanned = status;
//   await UserFlight.save();
// };

export const searchFlightByPID = async (workerPID: number) => {
  console.log(`searchFlightByPID fired`);
  return await userFlightDatabase.findOne({ workerPID: workerPID });
};

export const changePIDByReference = async (reference: string, workerPID: number) => {
  const UserFlight = await getUserFlightByReference(reference);
  if (UserFlight) return await userFlightTypeORM.update({ id: UserFlight.id }, { workerPID })
};

export const changeFlightScanStatusByPID = async (workerPID: number, status: string) => {
  console.log(`changeFlightScanStatusByPID fired`);
  const UserFlight = await searchFlightByPID(workerPID);
  console.log(UserFlight);
  UserFlight.isBeingScanned = status;
  await UserFlight.save();
  console.log(`Flight status changed to ${status}`);
};

export const changePIDToZero = async (workerPID: number) => {
  const UserFlight = await searchFlightByPID(workerPID);
  UserFlight.workerPID = 0;
  await UserFlight.save();
  console.log(`Worker PID changed to ${0}`);
};

export const checkAmountOfProcessesInUse = async () => {
  const array = await userFlightDatabase.find({ workerPID: { $gt: 0 } });
  const number = array.length;
  console.log(number);
  return number;
};

// All functions will fire cheapestFlightScannedToday. We can add other parameters in the future
export const cheapestFlightScannedToday = async (newUser: any) => {
  console.log("Started cheapestFlightScannedToday");
  // console.log(newUser)
  const Flight = await userFlightDatabase.findOne({ ref: newUser.ref });
  // console.log(Flight)
  const FlightArrays = await Flight.scanDate.at(-1).departureDate;
  let cheapestObject = [];
  let bestObject = [];
  for (let departureDateArray of FlightArrays) {
    console.log("new loop");
    for (let returnDatesArray of departureDateArray.returnDates) {
      if (returnDatesArray.cheapest.cost > 0) {
        cheapestObject.push(returnDatesArray);
      }
      if (returnDatesArray.best.cost > 0) {
        bestObject.push(returnDatesArray);
      }
    }
  }
  const cheapestFlightsOrder = cheapestObject.sort((a, b) => {
    return a.cheapest.cost - b.cheapest.cost;
  });

  const bestFlightsOrder = bestObject.sort((a, b) => {
    return a.best.cost - b.best.cost;
  });

  let cheapestFlightsOrderTopTen = [];
  let bestFlightsOrderTopTen = [];

  for (let i = 0; i < 10 && i < cheapestFlightsOrder.length; i++) {
    // console.log(`${i}: ${cheapestFlightsOrder[i]}`)
    cheapestFlightsOrderTopTen.push(cheapestFlightsOrder[i]);
  }
  console.log("####################");
  console.log("####################");
  console.log("####################");

  for (let i = 0; i < 10 && i < bestFlightsOrder.length; i++) {
    // console.log(`${i}: ${bestFlightsOrder[i]}`)
    bestFlightsOrderTopTen.push(bestFlightsOrder[i]);
  }
  console.log("Ending cheapestFlightScannedToday");
  return { cheapestFlightsOrderTopTen, bestFlightsOrderTopTen };
};

// We know users will have a reference. We can use this to find flights
const findUserFlight = async (reference: string) => {
  console.log("Started findUserFlight");
  return await userFlightDatabase.findOne({ ref: reference });
};

const checkUserFlightStuff = async (reference: string) => {
  console.log(`checkedUserFlightStuff passed reference = ${reference}`);
  const userFlight = await findUserFlight(reference);
  const {
    cheapestFlightsOrderTopTen: cheapestFlightsOrder,
    bestFlightsOrderTopTen: bestFlightsOrder,
  } = await cheapestFlightScannedToday(userFlight);
  return { cheapestFlightsOrder, bestFlightsOrder, userFlight };
};

// I'm expecting the flights to have been processed in cheapestFlightScannedToday.
const maximumHoliday = async (flightArray: any, daysOfMaxHoliday: any) => {
  console.log(`Starting maximumHoliday`);
  const sortedFlights = flightArray.filter((flight: any, index: number) => {
    // console.log(
    //   `flight.daysBetweenDepartureDateAndArrivalDate = ${
    //     flight.daysBetweenDepartureDateAndArrivalDate
    //   } while daysOfMaxHoliday = ${daysOfMaxHoliday} is flight.daysBetweenDepartureDateAndArrivalDate <= daysOfMaxHoliday? ${
    //     flight.daysBetweenDepartureDateAndArrivalDate <= daysOfMaxHoliday
    //   }`
    // );
    return flight.daysBetweenDepartureDateAndArrivalDate <= daysOfMaxHoliday;
  });
  return sortedFlights.filter((flights: any, index: number) => index <= 10);
};

export const checkMaximumHoliday = async (reference: string) => {
  let { cheapestFlightsOrder, bestFlightsOrder, userFlight } =
    await checkUserFlightStuff(reference);
  console.log(`Cheapest Length ${cheapestFlightsOrder.length}`);
  const cheapestFlightsOrderMax = await maximumHoliday(
    cheapestFlightsOrder,
    userFlight.dates.maximumHoliday
  );
  const bestFlightsOrderMax = await maximumHoliday(
    bestFlightsOrder,
    userFlight.dates.maximumHoliday
  );
  console.log(
    `cheapestFlightsOrderMax Length = ${cheapestFlightsOrderMax.length}`
  );
  consoleOutput(cheapestFlightsOrderMax, bestFlightsOrderMax);
  // Send email
  // testEmail(cheapestFlightsOrderMax, bestFlightsOrderMax, userFlight)
  return { cheapestFlightsOrderMax, bestFlightsOrderMax };
};

const fireEvents = async (reference: string) => {
  const userFlight = await searchFlights(reference);
  await cheapestFlightScannedToday(userFlight);
  await checkMaximumHoliday(userFlight.ref);
};

const resetFlightStatus = async () => {
  const response = await userFlightDatabase.find(
    {},
    {
      isBeingScanned: false,
      workerPID: 0,
      nextScan: 0,
      scannedLast: 0,
      updatedLast: 0,
    }
  );
  return { message: "reset successful" };
};

export const statusChangeByReference = async (reference: string, status: string) => {
  const userFlight = await userFlightDatabase.findOne({ ref: reference });
  userFlight.status = status;
  await userFlight.save();
};

const consoleOutput = async (cheapestFlightsOrder: any, bestFlightsOrder: any) => {
  console.log("#################");
  console.log(">> Max Holiday Output: Cheapest <<");
  console.log(cheapestFlightsOrder);
  console.log("#################");
  console.log(">> Max Holiday Output: Best <<");
  console.log(bestFlightsOrder);
  console.log("#################");
};

module.exports = {
  createUser,
  updateUserByReference,
  userTest,
  checkIfAllFlightTimeForScan,
  checkIfFlightTimeForScan,
  getUserFlightByReference,
  changeFlightScanStatusByReferenceId,
  changePIDByReference,
  searchFlightByPID,
  changeFlightScanStatusByPID,
  changePIDToZero,
  getAllDocuments,
  getAllReferences,
  checkAmountOfProcessesInUse,
  cheapestFlightScannedToday,
  findUserFlight,
  maximumHoliday,
  checkUserFlightStuff,
  checkMaximumHoliday,
  fireEvents,
  checkFlightsBeingScanned,
  checkIfFlightTimeForScanAndUpdate,
  resetFlightStatus,
  oneHundredSecondWait,
  checkIfAllFlightTimeForScanAndIfScansHappening,
  checkIfScanDead,
  statusChangeByReference,
};
