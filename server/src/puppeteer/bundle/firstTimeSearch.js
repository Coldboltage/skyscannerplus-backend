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

const main = async () => {
  console.log("Starting Main");
  const browser = await puppeteer.launch({
    headless: false,
    args: ["--no-sandbox", "--disable-setuid-sandbox"],
  });
  const page = await browser.newPage();

  await page.setRequestInterception(true);

  const pages = await browser.pages();
  await pages[0].close();
  // Execute skyscannerHomePage
  const newUser = {
    user: {
      name: "James",
      email: "veryrandomemailaddress@lol.com",
    },
    ref: "james-miami",
    flights: {
      departure: "London (Any)",
      arrival: "Miami International, FL (MIA)",
    },
    dates: {
      departureDate: "2022-07-09",
      returnDate: "2022-07-31",
      minimalHoliday: 7,
    },
  };

  await FlightsDatabase.create(newUser);

  const datePageData = await skyscannerHomePage(page, newUser);
  await datePage(datePageData, browser, newUser);
  return newUser;
};

module.exports = main;
