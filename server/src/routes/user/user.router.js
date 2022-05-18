const express = require("express")

const {httpCreateUser, httpUserTest, httpUpdateUserByReference} = require("./user.controller")

const userRouter = express.Router()

userRouter.get("/test", httpUserTest)
userRouter.post("/create", httpCreateUser)
userRouter.post("/update", httpUpdateUserByReference)

module.exports = userRouter


