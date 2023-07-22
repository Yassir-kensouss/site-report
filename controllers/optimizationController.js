const { INVALID_PAGE_LINK } = require("../config/errors");
const ImagesDetails = require("../utilities/ImagesAnalytics");
const PageLoader = require("../utilities/PageLoader");
const puppeteer = require("puppeteer");
const { unusedCss } = require("../utilities/styleSheetsPer");

exports.mediaAnalyzer = async (req, res) => {
  let pageLink = req.body.pageLink;

  try {
    // Load Page Init
    const pageLoader = new PageLoader(pageLink);
    const page = await pageLoader.loadPage();

    // Page Image Details Init
    const imageDetails = new ImagesDetails(pageLink, page);
    const extensions = await imageDetails.getExtension();

    res.json({
      ...extensions,
    });
  } catch (error) {
    res.status(400).json({
      error: INVALID_PAGE_LINK,
    });
  }
};

exports.filesAnalyzer = async (req, res) => {
  let pageLink = req.body.pageLink;

  // try {
  // Load Page Init
  const browser = await puppeteer.launch();
  const page = await browser.newPage();

  await page.setRequestInterception(true);

  let requestTypes = {
    document: 0,
    font: 0,
    stylesheet: 0,
    script: 0,
    image: 0,
  };

  page.on("request", request => {
    requestTypes = {
      ...requestTypes,
      [request.resourceType()]: requestTypes[request.resourceType()] + 1,
    };
    request.continue();
  });

  const client = await page.target().createCDPSession();
  await client.send("DOM.enable");
  await client.send("CSS.enable");
  await client.send("CSS.startRuleUsageTracking");
  await client.send("Performance.enable");

  const stylesheets = [];
  client.on("CSS.styleSheetAdded", s => stylesheets.push(s.header));

  await page.goto(pageLink, {
    waitUntil: "domcontentloaded",
  });

  const { ruleUsage } = await client.send("CSS.stopRuleUsageTracking");
  const _unusedCss = unusedCss(stylesheets, ruleUsage);
  const scriptElements = await page.$$("script");

  // const cssLinks = await page.$$eval('link[rel="stylesheet"]', elements =>
  //   elements.map(el => el.href)
  // );

  // let totalCssSize = 0;

  // for (const cssLink of cssLinks) {
  //   const response = await page.goto(cssLink, {
  //     waitUntil: "domcontentloaded",
  //   });

  //   if (response.ok()) {
  //     const contentLength = response.headers()["content-length"];
  //     if (contentLength) {
  //       totalCssSize += parseInt(contentLength);
  //     }
  //   }
  // }

  await browser.close();
  // } catch (error) {
  //   res.status(400).json({
  //     error: error,
  //   });
  // }
};
