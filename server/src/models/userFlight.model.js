const userFlightDatabase = require("./userFlight.mongo");
const searchFlights = require("../puppeteer/bundle/firstTimeSearch");
const testEmail = require("../../services/reference.email")


// Get all documents
const getAllDocuments = async () => {
  return await userFlightDatabase.find({})
}

const getAllReferences = async () => {
  const documents = await userFlightDatabase.find({})
  const references = documents.map(doc => doc.ref)
  return references
}

const createUser = async (userObject) => {
  const user = await userFlightDatabase.create(userObject)
  return user._id ? true : false
}

const userTest = () => {
  return {test: "This is a test"}
}

const getUserFlightByReference = async (reference) => {
  return await userFlightDatabase.findOne({ref: reference})
}

const changeFlightScanStatusByReference = async (reference, status) => {
  const UserFlight = await getUserFlightByReference(reference)
  UserFlight.isBeingScanned = status
  await UserFlight.save()
}

const searchFlightByPID = async (workerPID) => {
  return await userFlightDatabase.findOne({workerPID: workerPID})
}

const changePIDByReference = async (reference, workerPID) => {
  const UserFlight = await getUserFlightByReference(reference)
  UserFlight.workerPID = workerPID
  await UserFlight.save()
}

const changeFlightScanStatusByPID = async (workerPID, status) => {
  const UserFlight = await searchFlightByPID(workerPID)
  UserFlight.isBeingScanned = status
  await UserFlight.save()
  console.log(`Flight status changed to ${status}`)
}

const changePIDToZero = async (workerPID) => {
  const UserFlight = await searchFlightByPID(workerPID)
  UserFlight.workerPID = 0
  await UserFlight.save()
  console.log(`Worker PID changed to ${0}`)
}

const checkAmountOfProcessesInUse = async () => {
  const array = await userFlightDatabase.find({workerPID: {$gt: 0}})
  const number = array.length
  console.log(number)
  return number
}

// All functions will fire cheapestFlightScannedToday. We can add other parameters in the future
const cheapestFlightScannedToday = async (newUser) => {
  console.log("Started cheapestFlightScannedToday")
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

  let cheapestFlightsOrderTopTen = []
  let bestFlightsOrderTopTen = []


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
  console.log("Ending cheapestFlightScannedToday")
  return { cheapestFlightsOrderTopTen, bestFlightsOrderTopTen };
};

// We know users will have a reference. We can use this to find flights
const findUserFlight = async (reference) => {
  console.log("Started findUserFlight")
  return await userFlightDatabase.findOne({ref:reference}); 
}

const checkUserFlightStuff = async (reference) => {
  console.log(`checkedUserFlightStuff passed reference = ${reference}`)
  const userFlight = await findUserFlight(reference)
  const {cheapestFlightsOrderTopTen: cheapestFlightsOrder, bestFlightsOrderTopTen: bestFlightsOrder} = await cheapestFlightScannedToday(userFlight)
  return {cheapestFlightsOrder, bestFlightsOrder, userFlight}
};


// I'm expecting the flights to have been processed in cheapestFlightScannedToday.
const maximumHoliday = async (flightArray, daysOfMaxHoliday) => {
  console.log(`Starting maximumHoliday`)
  const sortedFlights = flightArray.filter((flight, index) => flight.daysBetweenDepartureDateAndArrivalDate <= daysOfMaxHoliday)
  return sortedFlights.filter((flights,index) => index <= daysOfMaxHoliday)
}

const checkMaximumHoliday = async (reference) => {
  let {cheapestFlightsOrder, bestFlightsOrder, userFlight} = await checkUserFlightStuff(reference)
  const cheapestFlightsOrderMax = await maximumHoliday(cheapestFlightsOrder, userFlight.dates.maximumHoliday)
  const bestFlightsOrderMax = await maximumHoliday(bestFlightsOrder, userFlight.dates.maximumHoliday)
  consoleOutput(cheapestFlightsOrderMax, bestFlightsOrderMax)
  // Send email
  testEmail(cheapestFlightsOrderMax, bestFlightsOrderMax, userFlight)
  return {cheapestFlightsOrderMax, bestFlightsOrderMax}
}

const fireEvents = async (reference) => {
  const userFlight = await searchFlights(reference);
  await cheapestFlightScannedToday(userFlight);
  await checkMaximumHoliday(userFlight.ref);
}

const consoleOutput = async (cheapestFlightsOrder, bestFlightsOrder) => {
  console.log("#################")
  console.log(">> Max Holiday Output: Cheapest <<")
  console.log(cheapestFlightsOrder)
  console.log("#################")
  console.log(">> Max Holiday Output: Best <<")
  console.log(bestFlightsOrder)
  console.log("#################")
}

module.exports = {
  createUser,
  userTest,
  getUserFlightByReference,
  changeFlightScanStatusByReference,
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
  fireEvents
};
