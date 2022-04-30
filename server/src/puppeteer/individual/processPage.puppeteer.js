

const processPage = async (page) => {
  console.log("Reading Page")
  await page.waitForTimeout(5000)
  console.log("Done")
  await page.close()
}

module.exports = processPage