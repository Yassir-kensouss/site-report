const puppeteer = require("puppeteer");
const fetch = require("node-fetch");
const { HTTP_LINKS_REGEX } = require("../config/contants");
const { fromBase64 } = require("b64-lite");

const getFilesSizes = async pageLink => {
  let requestTypes = {
    document: 0,
    font: 0,
    stylesheet: 0,
    script: 0,
    image: 0,
  };

  let fontsTotalSize = 0;
  let imageTotalSize = 0;
  let stylesheetsTotalSize = 0;
  let scriptsTotalSize = 0;

  try {
    // Load Page Init
    const browser = await puppeteer.launch();
    const page = await browser.newPage();
    await page.setDefaultNavigationTimeout(0);
    await page.setRequestInterception(true);

    page.on("request", async request => {
      const isLink = request.url() && HTTP_LINKS_REGEX.test(request.url());
      const base64Data =
        request.url() && request.url().startsWith("data:image");

      requestTypes = {
        ...requestTypes,
        [request.resourceType()]:
          request.resourceType() in requestTypes
            ? requestTypes[request.resourceType()] + 1
            : 1,
      };

      if (request.resourceType() === "font" && isLink) {
        try {
          const response = await fetch(request.url());
          const buffer = await response.buffer();
          const bufferSize = buffer.length;
          const contentLength = parseInt(
            response.headers.get("content-length"),
            10
          );
          if (!isNaN(contentLength)) fontsTotalSize += contentLength;
          else if (bufferSize) fontsTotalSize += bufferSize;
        } catch (error) {
          console.log("error", error.message);
        }
      }

      if (request.resourceType() === "image") {
        if (isLink) {
          try {
            const response = await fetch(request.url());
            const buffer = await response.buffer();
            const bufferSize = buffer.length;
            const contentLength = parseInt(
              response.headers.get("content-length"),
              10
            );
            if (!isNaN(contentLength)) imageTotalSize += contentLength;
            else if (bufferSize) imageTotalSize += bufferSize;
          } catch (error) {
            console.log("error.message", error.message);
          }
        } else if (base64Data) {
          const data = request.url().split(",")[1];
          const decodedData = fromBase64(data);
          imageTotalSize += decodedData.length;
        }
      }

      if (request.resourceType() === "stylesheet" && isLink) {
        console.log("first", request.resourceType());
        try {
          const response = await fetch(request.url());
          const buffer = await response.buffer();
          const bufferSize = buffer.length;
          const contentLength = parseInt(
            response.headers.get("content-length"),
            10
          );
          if (!isNaN(contentLength)) stylesheetsTotalSize += contentLength;
          else if (bufferSize) stylesheetsTotalSize += bufferSize;
        } catch (error) {
          console.log("error.message", error.message);
        }
      }

      if (request.resourceType() === "script" && isLink) {
        try {
          const response = await fetch(request.url());
          const contentLength = parseInt(
            response.headers.get("content-length"),
            10
          );
          const buffer = await response.buffer();
          const bufferSize = buffer.length;

          if (!isNaN(contentLength)) scriptsTotalSize += contentLength;
          else if (bufferSize) scriptsTotalSize += bufferSize;
        } catch (error) {
          console.log("error.message", error.message);
        }
      }

      request.continue();
    });

    await page.goto(pageLink, {
      waitUntil: "load",
    });

    await page.waitForTimeout(30000);

    return {
      stylesheetsTotalSize,
      scriptsTotalSize,
      requestTypes,
      imageTotalSize,
      fontsTotalSize,
    };
  } catch (error) {
    console.log("error.message", error.message);
  }
};

module.exports = getFilesSizes;
