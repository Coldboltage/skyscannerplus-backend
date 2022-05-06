module.exports = {
  apps : [{
    name   : "checker",
    script : "./server/src/checker.js",
    watch: true,
    env: {
      "PORT": 8000,
      "MONGODB_CONNECTION": "mongodb+srv://coldbolt-flightscanner:Dy7GkhKhfyYa9Ds@scannerplus.zgsmw.mongodb.net/scannerplus?retryWrites=true&w=majority",
    }
  }]
}