const fs = require('fs');
// puppeteer-extra is a drop-in replacement for puppeteer,
// it augments the installed puppeteer with plugin functionality
const puppeteer = require('puppeteer-extra')

// add stealth plugin and use defaults (all evasion techniques)
const StealthPlugin = require('puppeteer-extra-plugin-stealth')
puppeteer.use(StealthPlugin())

const main = async () => {
  const browser = await puppeteer.launch({headless: false})
  const page = await browser.newPage()
  await page.goto("https://skyscanner.net", {waitUntil: "domcontentloaded"})
  await page.click("#acceptCookieButton")
  await page.waitForTimeout(200)
  await page.click("#culture-info > button > div")
  await page.waitForTimeout(1000)
  // Grab lists
  const popular = await page.$$eval("#culture-selector-currency option", element => element.map((el) => {
    console.log(el.text)
    const transform = el.text.split(" ").filter((part, index) => index !== 1);
    return {
      fullName: el.text,
      currencyCode: transform[0],
      currencySymbol: transform[1]
    }
  }))
  await page.waitForTimeout(3000)

  console.log(popular)
  let data = JSON.stringify(popular);
fs.writeFileSync('currencyStuff.json', data);

  await browser.close()
}

main()