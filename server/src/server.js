require('dotenv').config()

// Puppeteer Bundles / Individuals
const firstTimeSearch = require("./puppeteer/bundle/firstTimeSearch")

// Database things
const {mongoConnect} = require("../services/mongo")
const FlightsDatabase = require("./models/userFlight.mongo")

const main = async () => {
  await mongoConnect()
  await firstTimeSearch()
  // Creating Object see if it works
}

main()
