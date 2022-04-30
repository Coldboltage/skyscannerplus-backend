// puppeteer-extra is a drop-in replacement for puppeteer,
// it augments the installed puppeteer with plugin functionality
const puppeteer = require("puppeteer-extra");

// add stealth plugin and use defaults (all evasion techniques)
const StealthPlugin = require("puppeteer-extra-plugin-stealth");
puppeteer.use(StealthPlugin());

// Database
const FlightsDatabase = require("../../models/userFlight.mongo");

// Puppeteer Modules
const skyscannerHomePage = require("../individual/skyscannerHomepage.puppeteer");
const datePage = require("../individual/datePage.puppeteer");

const main = async () => {
  console.log("Starting Main");
  const browser = await puppeteer.launch({ headless: false });
  const page = await browser.newPage();
  const pages = await browser.pages();
  await pages[0].close();
  // Execute skyscannerHomePage
  await FlightsDatabase.create({
    user: {
      name: "Alan Reid",
      email: "alanreid@hotmail.co.uk",
    },
    flights: {
      departure: "Belfast",
      arrival: "Oslo",
    },
    dates: {
      departureDate: "2022-06-28",
      returnDate: "2022-07-21",
      minimalHoliday: 14,
    },
  });
  const datePageData = await skyscannerHomePage(page);
  await datePage(datePageData, browser);
};

module.exports = main;
