class SemanticScanning {
  constructor(pageLink = "", page) {
    this.pageLink = pageLink;
    this.page = page;
  }

  async firstLevelHeading() {
    const getHeadings = await this.page.$$eval("h1", elements =>
      elements.map(el => el.textContent)
    );

    console.log("getHeadings", getHeadings);

    const existence = getHeadings.length > 0;
    const onePerPage = getHeadings.length === 1;
    const charLength =
      getHeadings[0].length > 120
        ? `heading is too long ${getHeadings[0].length}`
        : "heading length is good";

    return {
      content: getHeadings,
      existence,
      onePerPage,
      charLength,
    };
  }
}

module.exports = SemanticScanning;
