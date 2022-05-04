// puppeteer-extra is a drop-in replacement for puppeteer,
// it augments the installed puppeteer with plugin functionality
const puppeteer = require("puppeteer-extra");

// add stealth plugin and use defaults (all evasion techniques)
const StealthPlugin = require("puppeteer-extra-plugin-stealth");
puppeteer.use(StealthPlugin());

const AdblockerPlugin = require("puppeteer-extra-plugin-adblocker");
puppeteer.use(AdblockerPlugin({ blockTrackers: true }));

// const pluginProxy = require('puppeteer-extra-plugin-proxy');

// puppeteer.use(
//   pluginProxy({
//     address: "proxy.iproyal.com",
//     port: 12323,
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
  const browser = await puppeteer.launch({
    headless: false,
    args: ["--no-sandbox", "--disable-setuid-sandbox"],
  });
  const page = await browser.newPage();
  const pages = await browser.pages();
  await pages[0].close();
  // If the reference exists, add the scan in scanDate
  if (reference) {
    user = await FlightsDatabase.findOne({ref: reference})
  } else {
    user = {
      user: {
        name: "Alan Reid",
        email: "alandreid@hotmail.co.uk",
      },
      ref: "split-holiday",
      flights: {
        departure: "Dublin (DUB)",
        arrival: "Split (SPU)",
      },
      dates: {
        departureDate: "2022-06-07",
        returnDate: "2022-07-07",
        minimalHoliday: 7,
      },
    };
    await FlightsDatabase.create(user);
  }
  // Execute skyscannerHomePage
  

  const datePageData = await skyscannerHomePage(page, user);
  await datePage(datePageData, browser, user);
  return user;
};

module.exports = main;
