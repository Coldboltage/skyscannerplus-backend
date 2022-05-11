// puppeteer-extra is a drop-in replacement for puppeteer,
// it augments the installed puppeteer with plugin functionality
const puppeteer = require("puppeteer-extra");

// add stealth plugin and use defaults (all evasion techniques)
const StealthPlugin = require("puppeteer-extra-plugin-stealth");
puppeteer.use(StealthPlugin());

const AdblockerPlugin = require("puppeteer-extra-plugin-adblocker");
puppeteer.use(AdblockerPlugin({ blockTrackers: true }));

// const PuppeteerExtraPluginProxy = require("puppeteer-extra-plugin-proxy2");
const pluginProxy = require("puppeteer-extra-plugin-proxy");

// puppeteer.use(
//   pluginProxy({
//     address: "proxy.iproyal.com",
//     port: 12323,
//     // address: "154.17.91.227",
//     // port: 29842,
//     credentials: {
//       username: `${process.env.PROXY_USERNAME}`,
//       password: `${process.env.PROXY_PASSWORD}`,
//     },
//   })
// );

// puppeteer.use(
//   PuppeteerExtraPluginProxy({
//     proxy: `http://cbolt:Fuj0dAfcV8IX7b87_country-gb@91.239.130.17:12323`,
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
    headless: false,
    args: [
      "--no-sandbox",
      "--disable-setuid-sandbox",
      "--disable-background-timer-throttling",
      "--disable-backgrounding-occluded-windows",
      "--disable-renderer-backgrounding",
    ],
  });
  let page = await browser.newPage();
  await page.setCacheEnabled(false);
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
  
  let {page:datePageData,  url} = await skyscannerHomePage(page, user)
  console.log(datePageData)
  console.log(url)
  await datePage(datePageData, browser, user, puppeteer, url);
  return user;
};

module.exports = main;
