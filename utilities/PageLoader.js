const puppeteer = require("puppeteer");
const { scrollPageToBottom } = require("puppeteer-autoscroll-down");

/**
 * @description This class used to initialize and load the page
 * @param PageLink: absence of this param will reduce an error
 */

class PageLoader {
  constructor(pageLink) {
    this.pageLink = pageLink;
  }

  async loadPage() {
    const browser = await puppeteer.launch();
    const page = await browser.newPage();

    await page.goto(this.pageLink, { waitUntil: "load" });

    await page.evaluate(_ => {
      window.scrollTo(0, 0);
    });

    await scrollPageToBottom(page);

    return page;
  }
}

module.exports = PageLoader;
