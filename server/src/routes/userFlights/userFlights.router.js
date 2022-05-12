const express = require("express")
const {httpGetLatestFlightsByReference, httpGetAllDocuments, httpFireEvents, httpGetAllReferences} = require("./userFlights.controller")

const flightsRouter = express.Router()

flightsRouter.get("/", httpGetAllDocuments)
flightsRouter.post("/reference", httpGetLatestFlightsByReference)
flightsRouter.post("/fire-reference", httpFireEvents)
flightsRouter.get("/get-references", httpGetAllReferences)


module.exports = flightsRouter