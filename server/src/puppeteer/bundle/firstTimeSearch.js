const Xvfb = require('xvfb');
var xvfb = new Xvfb({
  silent: true,
  xvfb_args: ["-screen", "0", '1920x1080x24', "-ac"],
});
xvfb.start((err)=>{if (err) console.error(err)})

// puppeteer-extra is a drop-in replacement for puppeteer,
// it augments the installed puppeteer with plugin functionality
const puppeteer = require("puppeteer-extra");

// add stealth plugin and use defaults (all evasion techniques)
const StealthPlugin = require("puppeteer-extra-plugin-stealth");
puppeteer.use(StealthPlugin());

// const AdblockerPlugin = require("puppeteer-extra-plugin-adblocker");
// puppeteer.use(AdblockerPlugin({ blockTrackers: true }));

// const PuppeteerExtraPluginProxy = require("puppeteer-extra-plugin-proxy2");
const pluginProxy = require("puppeteer-extra-plugin-proxy");
const ipExport = require("../../../services/proxies")

console.log()

// puppeteer.use(
//   pluginProxy({
//     address: "p.webshare.io",
//     // port: 12323,
//     // address: ipExport[Math.floor(Math.random() * ipExport.length)],
//     port: 80,
//     credentials: {
//       username: `${process.env.PROXY_USERNAME}`,
//       password: `${process.env.PROXY_PASSWORD}`,
//     },
//   })
// );

// Database
const FlightsDatabase = require("../../models/userFlight.mongo");

// Puppeteer Modules
const skyscannerHomePage = require("../individual/skyscannerHomepage.puppeteer");
const datePage = require("../individual/datePage.puppeteer");

// Test
const todaysDate = new Date();

const main = async (reference = false) => {
  console.log("Starting Main");
  let browser = await puppeteer.launch({
    // slowMo: 20,
    headless: false,
    args: [
      // "--incognito",
      "--no-sandbox",
      "--disable-setuid-sandbox",
      "--disable-background-timer-throttling",
      "--disable-backgrounding-occluded-windows",
      "--disable-renderer-backgrounding",
    ],
  });
  let page = await browser.newPage();

  await page.setCacheEnabled(false);

  // await page.setRequestInterception(true);

  // const rejectRequestPattern = [
  //   "googlesyndication.com",
  //   "/*.doubleclick.net",
  //   "/*.amazon-adsystem.com",
  //   "/*.adnxs.com",
  //   "/*.nr-data.net",
  // ];
  // const blockList = [];

  // page.on("request", (request) => {
  //   if (rejectRequestPattern.find((pattern) => request.url().match(pattern))) {
  //     blockList.push(request.url());
  //     request.abort();
  //   } else if (request.resourceType() === "image") {
  //     request.abort();
  //   } else {
  //     request.continue();
  //   }
  // });

  const pages = await browser.pages();
  await pages[0].close();
  // If the reference exists, add the scan in scanDate
  if (reference) {
    user = await FlightsDatabase.findOne({ ref: reference });
    console.log(user);
  } else {
    user = {
      user: {
        name: "Alan Reid",
        email: "alandreid@hotmail.co.uk",
      },
      ref: "bangok-september",
      flights: {
        departure: "Dublin (DUB)",
        arrival: "Bangkok (Any)",
      },
      dates: {
        departureDate: "2022-09-01",
        returnDate: "2022-09-28",
        minimalHoliday: 14,
        maximumHoliday: 28,
      },
      isBeingScanned: false,
      workerPID: 0,
    };
    await FlightsDatabase.create(user);
  }
  // Execute skyscannerHomePage

  let { page: datePageData, url, verifyNames } = await skyscannerHomePage(page, user);
  console.log(url);
  const verifyFlights = await datePage(datePageData, browser, user, puppeteer, url, verifyNames);
  return {user, verifyFlights};
};

module.exports = main;
