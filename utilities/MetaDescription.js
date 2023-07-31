const keywordGenerator = require("./keywordGenerator");

class MetaDescriptionScanner {
  constructor(pageLink = "", page) {
    this.pageLink = pageLink;
    this.page = page;
  }

  async scanMetaTag() {
    const metaDescriptionName = await this.page.evaluate(() => {
      const metaTag = document.querySelector('meta[name="description"]');
      return metaTag ? metaTag.getAttribute("content") : null;
    });

    const descriptionExist = metaDescriptionName && metaDescriptionName !== "";

    return {
      content: metaDescriptionName,
      descriptionExist,
    };
  }
}

module.exports = MetaDescriptionScanner;
