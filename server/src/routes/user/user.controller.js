const {createUser, userTest, updateUserByReference} = require("../../models/userFlight.model");

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

const httpUpdateUserByReference = async (req, res) => {
  const response = await updateUserByReference(req.body.reference)
  if (response === true) {
    res.status(200).json({success: true})
  } else {
    res.status(400).json({error: "Error updating"})
  }
}

module.exports = {
  httpCreateUser,
  httpUserTest,
  httpUpdateUserByReference
}