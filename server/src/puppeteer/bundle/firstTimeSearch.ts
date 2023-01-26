const Xvfb = require('xvfb');
var xvfb = new Xvfb({
  silent: true,
  xvfb_args: ["-screen", "0", '1920x1080x24', "-ac"],
});
xvfb.start((err: any) => { if (err) console.error(err) })

// puppeteer-extra is a drop-in replacement for puppeteer,
// it augments the installed puppeteer with plugin functionality
import puppeteer from "puppeteer-extra";

// add stealth plugin and use defaults (all evasion techniques)
import StealthPlugin from "puppeteer-extra-plugin-stealth";
puppeteer.use(StealthPlugin());

// const AdblockerPlugin = require("puppeteer-extra-plugin-adblocker");
// puppeteer.use(AdblockerPlugin({ blockTrackers: true }));

// const PuppeteerExtraPluginProxy = require("puppeteer-extra-plugin-proxy2");

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
import FlightsDatabase from "../../models/userFlight.mongo";

// Puppeteer Modules
import skyscannerHomePage from "../individual/skyscannerHomepage.puppeteer";
import datePage from "../individual/datePage.puppeteer";

// TypeORM
import { UserFlightTypeORM } from "../../entity/user-flight.entity";
import { AppDataSource } from "../../data-source";
import { Page } from "puppeteer";
const userFlightTypeORMDatabase = AppDataSource.getRepository(UserFlightTypeORM)

// Test
const todaysDate = new Date();

const main = async (reference: string) => {
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

  const userFlight = await userFlightTypeORMDatabase.findOneBy({ ref: reference });
  if (!userFlight) return false
  console.log(userFlight);

  // Execute skyscannerHomePage

  let results = await skyscannerHomePage(page, userFlight);
  if (!results) return false
  const { page: datePageData, url, verifyNames } = results
  console.log(url);
  const verifyFlights = await datePage(datePageData, browser, userFlight, puppeteer, url, verifyNames);
  return { userFlight, verifyFlights };
};

export default main;
