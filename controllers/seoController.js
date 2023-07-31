const { INVALID_PAGE_LINK } = require("../config/errors");
const ImagesDetails = require("../utilities/ImagesAnalytics");
const MetaDescriptionScanner = require("../utilities/MetaDescription");
const PageTitleScanner = require("../utilities/MetaTagsScaner");
const PageLoader = require("../utilities/PageLoader");
const puppeteer = require("puppeteer");
const SemanticScanning = require("../utilities/semanticScaning");

exports.mediaAnalyzer = async (req, res) => {
  let pageLink = req.body.pageLink;

  try {
    // Load Page Init
    const pageLoader = new PageLoader(pageLink);
    const page = await pageLoader.loadPage();

    // Page Image Details Init
    const imageDetails = new ImagesDetails(pageLink, page);
    const alt = await imageDetails.checkAlt();

    res.json({
      ...alt,
    });
  } catch (error) {
    res.status(400).json({
      error: INVALID_PAGE_LINK,
    });
  }
};

exports.scanPageMetaTags = async (req, res) => {
  try {
    const pageLink = req.body.pageLink;

    // Load page init
    const pageLoader = new PageLoader(pageLink);
    const page = await pageLoader.loadPage();

    // get page title tag and content
    const pageTitleScanner = new PageTitleScanner(pageLink, page);
    const { title, existence, titleLength, keywordsCount } =
      await pageTitleScanner.getPageTitle();

    // get page meta description
    const pageDescriptionMetadata = new MetaDescriptionScanner(pageLink, page);
    const { content, descriptionExist } =
      await pageDescriptionMetadata.scanMetaTag();

    res.json({
      title: {
        title,
        existence,
        titleLength,
        keywordsCount,
      },
      description: {
        description: content,
        existence: descriptionExist,
      },
    });
  } catch (error) {
    return res.status(500).json({
      error: error.message,
    });
  }
};

exports.generateKeywords = async (req, res) => {
  const prompt = req.body.prompt;

  // open a new browser
  const browser = await puppeteer.launch();

  // create a new page
  const page = await browser.newPage();

  // navigate to google
  await page.goto("https://www.google.com");

  // type slowly and parse the keyword
  await page.type("*[name='q']", prompt, { delay: 500 });

  // go to ul class listbox
  await page.waitForSelector("ul[role='listbox']");

  // extracting keywords from ul li span
  const search = await page.evaluate(() => {
    // count over the li's starting with 0
    let listBox = document.body.querySelectorAll(
      "ul[role='listbox'] li .wM6W7d"
    );
    // loop over each li store the results as x
    let item = Object.values(listBox).map(x => {
      return {
        keyword: x.querySelector("span").innerText,
      };
    });
    return item;
  });

  // logging results
  res.json({
    search,
  });

  await browser.close();
};

exports.semantic = async (req, res) => {
  try {
    // Load Page Init
    let pageLink = req.body.pageLink;
    const pageLoader = new PageLoader(pageLink);
    const page = await pageLoader.loadPage();

    const semantic = new SemanticScanning(pageLink, page);
    const { existence, onePerPage, message } =
      await semantic.firstLevelHeading();

    res.json({
      headings: {
        firstLevel: {
          existence,
          message,
          onePerPage,
        },
      },
    });
  } catch (error) {
    res.status(400).json({
      error: error.message,
    });
  }
};
