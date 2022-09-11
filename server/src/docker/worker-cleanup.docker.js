const axios = require("axios")

(async () => {
  console.log("We have fired the cleanup script")
  await axios.post("0.0.0.0:2375/v1.41/containers/prune", {})
  console.log("Fired the call")
})()