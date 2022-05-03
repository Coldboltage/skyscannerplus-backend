require('dotenv').config()

// Puppeteer Bundles / Individuals
const firstTimeSearch = require("./puppeteer/bundle/firstTimeSearch")

const {cheapestFlightScannedToday} = require("./models/userFlight.model")


// Database things
const {mongoConnect} = require("../services/mongo")
const FlightsDatabase = require("./models/userFlight.mongo")

const main = async () => {
  await mongoConnect()
  const newUser = await firstTimeSearch()
  // Creating Object see if it works
  await cheapestFlightScannedToday(newUser)
}

main()
