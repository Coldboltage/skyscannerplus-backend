const express = require("express")
const {httpGetLatestFlightsByReference, httpGetAllDocuments} = require("./userFlights.controller")

const flightsRouter = express.Router()

flightsRouter.get("/", httpGetAllDocuments)
flightsRouter.post("/reference", httpGetLatestFlightsByReference)

module.exports = flightsRouter