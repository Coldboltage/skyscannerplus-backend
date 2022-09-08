const express = require("express")
const {httpGetLatestFlightsByReference, httpGetAllDocuments, httpFireEvents, httpGetAllReferences, httpResetFlightStatus} = require("./userFlights.controller")

const flightsRouter = express.Router()

flightsRouter.get("/", httpGetAllDocuments)
flightsRouter.post("/reference", httpGetLatestFlightsByReference)
flightsRouter.post("/fire-reference", httpFireEvents)
flightsRouter.get("/get-references", httpGetAllReferences)
flightsRouter.get("/status-reset", httpResetFlightStatus)


module.exports = flightsRouter