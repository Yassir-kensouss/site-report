const { INVALID_PAGE_LINK } = require("../config/errors");
const ImagesDetails = require("../utilities/ImagesAnalytics");
const PageLoader = require("../utilities/PageLoader");
const puppeteer = require("puppeteer");
const { unusedCss } = require("../utilities/styleSheetsPer");
const getFilesSizes = require("../utilities/filesTotalSize");
const sizeOf = require("image-size");
const { scrollPageToBottom } = require("puppeteer-autoscroll-down");

const fs = require("fs");
const lighthouse = require("lighthouse");
const chromeLauncher = require("chrome-launcher");
const reportGenerator = require("lighthouse/lighthouse-core/report/report-generator");
const request = require("request");
const util = require("util");
const { PerformanceObserver } = require("perf_hooks");

const options = {
  logLevel: "info",
  disableDeviceEmulation: true,
  chromeFlags: ["--disable-mobile-emulation"],
};

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

exports.getUnusedCss = async (req, res) => {
  let pageLink = req.body.pageLink;

  try {
    // Load Page Init
    const browser = await puppeteer.launch();
    const page = await browser.newPage();

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
      unusedCss: _unusedCss,
    });

    await browser.close();
  } catch (error) {
    return res.status(400).json({
      error: INVALID_PAGE_LINK,
    });
  }
};

exports.filesTotalSize = async (req, res) => {
  let pageLink = req.body.pageLink;

  try {
    const {
      stylesheetsTotalSize,
      requestTypes,
      imageTotalSize,
      scriptsTotalSize,
      fontsTotalSize,
    } = await getFilesSizes(pageLink);
    res.json({
      requestTypes,
      stylesheetsTotalSize,
      scriptsTotalSize,
      fontsTotalSize,
      imageTotalSize,
    });
  } catch (error) {
    return res.status(400).json({
      error: INVALID_PAGE_LINK,
    });
  }
};

exports.getImgResolution = async (req, res) => {
  try {
    const pageLink = req.body.pageLink;
    const browser = await puppeteer.launch();
    const page = await browser.newPage();
    await page.goto(pageLink, { waitUntil: "networkidle2" });

    await page.evaluate(_ => {
      window.scrollTo(0, 0);
    });
    await scrollPageToBottom(page);

    const imagesUrls = await page.evaluate(() => {
      const imgElements = Array.from(document.querySelectorAll("img"));
      return imgElements.map(img => img.src);
    });

    const imageResolutions = [];

    for (const imageUrl of imagesUrls) {
      const imageBuffer = await page
        .goto(imageUrl)
        .then(response => response.buffer());
      const dimensions = sizeOf(imageBuffer);
      imageResolutions.push({ url: imageUrl, resolution: dimensions });
    }

    const highRes = imageResolutions.filter(
      el => el.resolution?.width > 1080 || el.resolution?.width > 1080
    );

    res.json({
      highRes,
      total: highRes.length,
    });
  } catch (error) {
    res.status(400).json({
      error: INVALID_PAGE_LINK,
    });
  }
};

exports.getFCP = async (req, res) => {
  try {
    const pageLink = req.body.pageLink;
    const browser = await puppeteer.launch();
    const page = await browser.newPage();
    await page.goto(pageLink, { waitUntil: "networkidle2" });

    // Get performance entries
    const rawPerfEntries = await page.evaluate(function () {
      return JSON.stringify(window.performance.getEntries());
    });

    // Parsing string
    const allPerformanceEntries = JSON.parse(rawPerfEntries);

    // Find FirstContentfulPaing
    const fcp = allPerformanceEntries.filter(
      x => x.name === "first-contentful-paint"
    );

    return res.json({
      first_contentful_pain: fcp,
    });
  } catch (error) {
    return res.status(500).json({
      error: error.message,
    });
  }
};

exports.getTTFB = async (req, res) => {
  try {
    const pageLink = req.body.pageLink;
    const browser = await puppeteer.launch();
    const page = await browser.newPage();
    await page.goto(pageLink, { waitUntil: "networkidle2" });

    // Get performance entries
    const rawPerfEntries = await page.evaluate(function () {
      return JSON.stringify(window.performance.getEntries());
    });

    // Parsing string
    const allPerformanceEntries = JSON.parse(rawPerfEntries);

    // get first time to interactive
    const navigationEvents = allPerformanceEntries.find(
      el => el.entryType === "navigation"
    );

    res.json({
      time_to_first_byte: navigationEvents.responseStart,
    });
  } catch {
    return res.status(500).json({
      error: error.message,
    });
  }
};

exports.getMetrics = async (req, res) => {
  const pageLink = req.body.pageLink;
  const browser = await puppeteer.launch();
  const page = await browser.newPage();

  await page.goto(pageLink, { waitUntil: "networkidle2" });

  const metrics = await page.evaluate(() => JSON.stringify(window.performance));
  const performanceTiming = JSON.parse(metrics);

  const totalReqResTime =
    performanceTiming.timing.responseEnd -
    performanceTiming.timing.requestStart;

  const ttfb =
    performanceTiming.timing.responseStart -
    performanceTiming.timing.requestStart;

  await browser.close();

  res.json({
    totalReqResTime,
    ttfb,
  });
};
