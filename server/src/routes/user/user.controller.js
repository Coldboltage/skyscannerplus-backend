const {createUser, userTest} = require("../../models/userFlight.model");

const httpCreateUser = async (req, res) => {
  
  const response = await createUser(req.body)
  if (response === true) {
    res.status(200).json({success: true})
  } else {
    res.status(400).json({error: "There was an error with the object"})
  }
}

const httpUserTest = (req, res) => {
  return res.status(200).json(userTest())
}

module.exports = {
  httpCreateUser,
  httpUserTest
}