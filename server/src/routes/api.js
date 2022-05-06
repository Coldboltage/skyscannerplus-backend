const express = require("express")
const flighstRouter = require("./userFlights/userFlights.router")
const userRouter = require("./user/user.router")

const api = express.Router()

api.use("/flights" , flighstRouter)
api.use("/users", userRouter)

// api.use()

module.exports = api