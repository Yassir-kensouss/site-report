const { INVALID_PAGE_LINK } = require("../config/errors");
const ImagesDetails = require("../utilities/ImagesAnalytics");
const PageLoader = require("../utilities/PageLoader");
const puppeteer = require("puppeteer");
const { unusedCss } = require("../utilities/styleSheetsPer");
const fetch = require("node-fetch");
const { HTTP_LINKS_REGEX } = require("../config/contants");
const { fromBase64 } = require("b64-lite");

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

  let fontsTotalSize = 0;
  let imageTotalSize = 0;
  let totalCssSize = 0;
  let totalScriptsSize = 0;

  page.on("request", async request => {
    const isLink = request.url() && HTTP_LINKS_REGEX.test(request.url());
    const base64Data = request.url() && request.url().startsWith("data:image");

    requestTypes = {
      ...requestTypes,
      [request.resourceType()]: requestTypes[request.resourceType()] + 1,
    };

    if (request.resourceType() === "font" && isLink) {
      const response = await fetch(request.url());
      const contentLength = parseInt(
        response.headers.get("content-length"),
        10
      );
      if (!isNaN(contentLength)) fontsTotalSize += contentLength;
    }

    if (request.resourceType() === "image") {
      if (isLink) {
        const response = await fetch(request.url());
        const contentLength = parseInt(
          response.headers.get("content-length"),
          10
        );
        if (!isNaN(contentLength)) imageTotalSize += contentLength;
      } else if (base64Data) {
        const data = request.url().split(",")[1];
        const decodedData = fromBase64(data);
        imageTotalSize += decodedData.length;
      }
    }

    if (request.resourceType() === "stylesheet" && isLink) {
      const response = await fetch(request.url());
      const contentLength = parseInt(
        response.headers.get("content-length"),
        10
      );
      if (!isNaN(contentLength)) totalCssSize += contentLength;
    }

    if (request.resourceType() === "script" && isLink) {
      const response = await fetch(request.url());
      const contentLength = parseInt(
        response.headers.get("content-length"),
        10
      );
      if (!isNaN(contentLength)) totalScriptsSize += contentLength;
    }

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

  await page.waitForTimeout(6000);

  const { ruleUsage } = await client.send("CSS.stopRuleUsageTracking");
  const _unusedCss = unusedCss(stylesheets, ruleUsage);

  res.json({
    fontsTotalSize,
    imageTotalSize,
    totalCssSize,
    totalScriptsSize,
    requestTypes,
    _unusedCss,
  });

  await browser.close();
  // } catch (error) {
  //   res.status(400).json({
  //     error: error,
  //   });
  // }
};
