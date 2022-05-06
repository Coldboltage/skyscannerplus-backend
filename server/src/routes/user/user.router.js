const express = require("express")

const {httpCreateUser, httpUserTest} = require("./user.controller")

const userRouter = express.Router()

userRouter.get("/test", httpUserTest)
userRouter.post("/create", httpCreateUser)

module.exports = userRouter


