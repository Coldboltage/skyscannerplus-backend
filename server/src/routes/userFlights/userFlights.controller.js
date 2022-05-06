const {checkUserFlightStuff, getAllDocuments} = require("../../models/userFlight.model")

const httpGetLatestFlightsByReference = async (req, res) => {
  console.log(req.body)
  // console.log("I think I was called!! Wooot")
  return res.status(200).json(await checkUserFlightStuff(req.body.reference))
}

const httpGetAllDocuments = async (req, res) => {
  return res.status(200).json(await getAllDocuments())
}

module.exports = {
  httpGetLatestFlightsByReference,
  httpGetAllDocuments,
}