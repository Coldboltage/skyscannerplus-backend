const express = require("express")
const path = require("path")
const cors = require("cors")
const api = require("./routes/api")

const app = express()

app.use(cors())

app.use(express.json())


app.use("/api", api)


module.exports = app
