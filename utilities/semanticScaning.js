const {
  HEADING_CHAR_LENGTH,
  LONG_HEADING_WRONG,
  LONG_HEADING_GOOD,
  MISSING_HEADING,
} = require("../config/mesages");
const sanitizeString = require("./sanitizeString");

const scanLength = input => {
  let result = "";

  if (input && input.length > 0) {
    if (input[0].length > HEADING_CHAR_LENGTH) {
      result = LONG_HEADING_WRONG;
    } else {
      result = LONG_HEADING_GOOD;
    }
  } else {
    result = MISSING_HEADING;
  }

  return result;
};

const extractText = async element => {
  let text = "";

  if (element.nodeType === 3) {
    text += element.textContent.trim();
  }

  if (element.childNodes) {
    for (const childNode of element.childNodes) {
      text += await extractText(childNode);
    }
  }

  return text;
};

class SemanticScanning {
  constructor(pageLink = "", page) {
    this.pageLink = pageLink;
    this.page = page;
  }

  async firstLevelHeading() {
    const getHeadings = await this.page.$$eval("h1", elements =>
      elements.map(el => el?.textContent?.trim())
    );

    const existence = getHeadings.length > 0;
    const onePerPage = getHeadings.length === 1;
    const message = onePerPage
      ? "First level heading is good"
      : "Only one h1 tag per page is required";

    return {
      existence,
      onePerPage,
      message,
    };
  }
}

module.exports = SemanticScanning;
