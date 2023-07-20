const { EXT_REGEX } = require("../config/contants");

class ImagesDetails {
  extensions = {};
  constructor(pageLink = "", page) {
    this.pageLink = pageLink;
    this.page = page;
  }

  async getExtension() {
    // Load the page images list
    const srcList = await this.page.evaluate(() =>
      Array.from(document.querySelectorAll("img"), e => e.src)
    );

    let count = 0;

    // Sort and Count extensions
    srcList.forEach(src => {
      const link = src?.match(EXT_REGEX) || [];
      const ext = link.length > 0 ? link[0] : "";
      if (ext in this.extensions && ext !== "") {
        this.extensions[ext] = this.extensions[ext] + 1;
        count++;
      } else if (ext !== "") {
        this.extensions[ext] = 1;
        count++;
      }
    });

    // Count the percentage of each extension
    Object.keys(this.extensions).map(el => {
      this.extensions[el] =
        Math.floor((this.extensions[el] / count) * 100) + "%";
    });

    return {
      ext: this.extensions,
      images: srcList,
    };
  }

  async checkAlt() {
    // Load the page images list
    const altList = await this.page.evaluate(() =>
      Array.from(document.querySelectorAll("img"), e => ({
        alt: e.alt,
        src: e.src,
      }))
    );

    // Get elements with missing alt attr
    const missingAlt = altList.filter(el => el.alt === "" || !el.alt) || [];

    return {
      missingAlt,
      total: missingAlt.length,
    };
  }
}

module.exports = ImagesDetails;
