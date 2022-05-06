module.exports = {
  apps : [{
    name   : "checker",
    script : "./server/src/checker.js",
    watch: true,
    env: {
      "MONGODB_CONNECTION": "mongodb+srv://coldbolt-flightscanner:Dy7GkhKhfyYa9Ds@scannerplus.zgsmw.mongodb.net/scannerplus?retryWrites=true&w=majority",
    }
  }]
}