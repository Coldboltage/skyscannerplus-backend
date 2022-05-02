// puppeteer-extra is a drop-in replacement for puppeteer,
// it augments the installed puppeteer with plugin functionality
const puppeteer = require("puppeteer-extra");

// add stealth plugin and use defaults (all evasion techniques)
const StealthPlugin = require("puppeteer-extra-plugin-stealth");
puppeteer.use(StealthPlugin());

const AdblockerPlugin = require("puppeteer-extra-plugin-adblocker");
puppeteer.use(AdblockerPlugin({blockTrackers: true}));

// Database
const FlightsDatabase = require("../../models/userFlight.mongo");

// Puppeteer Modules
const skyscannerHomePage = require("../individual/skyscannerHomepage.puppeteer");
const datePage = require("../individual/datePage.puppeteer");

// Test

const todaysDate = new Date();

const main = async () => {
  console.log("Starting Main");
  const browser = await puppeteer.launch({ headless: false });
  const page = await browser.newPage();

  await page.setRequestInterception( true )


  const pages = await browser.pages();
  await pages[0].close();
  // Execute skyscannerHomePage
  await FlightsDatabase.create({
    user: {
      name: "Alan Reid",
      email: "alanreid@hotmail.co.uk",
    },
    flights: {
      departure: "Dublin",
      arrival: "Milan (Any)",
    },
    dates: {
      departureDate: "2022-06-01",
      returnDate: "2022-06-28",
      minimalHoliday: 3,
    },
  });

  // page.on("request", (req) => {
  //   if (
  //     req.resourceType() == "stylesheet" ||
  //     req.resourceType() == "font" ||
  //     req.resourceType() == "image"
  //   ) {
  //     req.abort();
  //   } else {
  //     req.continue();
  //   }
  // });
  const datePageData = await skyscannerHomePage(page);
  await datePage(datePageData, browser);
};

module.exports = main;
