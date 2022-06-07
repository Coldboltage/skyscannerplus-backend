const mongoose = require("mongoose")
console.log("fired")

mongoose.connection.once("open", () => {
  console.log("MongoDB connection ready")
})

mongoose.connection.on("error", error => {
  console.error(error)
})


const mongoConnect = async () => {
  await mongoose.connect(`${process.env.MONGODB_CONNECTION}`)
}

async function mongoDisconnect() {
  await mongoose.disconnect()
}

module.exports = {
  mongoConnect,
  mongoDisconnect
}