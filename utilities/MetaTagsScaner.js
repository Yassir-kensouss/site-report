const {
  LONG_PAGE_TITLE_WRONG,
  TITLE_KEYWORD_COUNT_WRONG,
  TITLE_KEYWORD_COUNT_GOOD,
  LEVELS,
  LONG_PAGE_TITLE_GOOD,
  RECOMMENDED_TITLE_LENGTH,
  RECOMMENDED_TITLE_KEYWORD_COUNT,
} = require("../config/mesages");
const getKeywordsCount = require("./getKeywords");

class PageTitleScanner {
  constructor(pageLink = "", page) {
    this.pageLink = pageLink;
    this.page = page;
  }

  async getPageTitle() {
    // Get title
    const title = await this.page.title();

    // Check if page has title or not
    const existence = await (title && title !== "");

    // Check title length
    const titleLength = {
      count: title?.length,
      result:
        title?.length > RECOMMENDED_TITLE_LENGTH
          ? LONG_PAGE_TITLE_WRONG
          : LONG_PAGE_TITLE_GOOD,
      level:
        title?.length > RECOMMENDED_TITLE_LENGTH ? LEVELS.FIX : LEVELS.PASSED,
    };

    // Check title keyword count
    const keywordsCount = {
      count: getKeywordsCount(title),
      result:
        getKeywordsCount(title) < RECOMMENDED_TITLE_KEYWORD_COUNT
          ? TITLE_KEYWORD_COUNT_WRONG
          : TITLE_KEYWORD_COUNT_GOOD,
      level:
        getKeywordsCount(title) < RECOMMENDED_TITLE_KEYWORD_COUNT
          ? LEVELS.FIX
          : LEVELS.PASSED,
    };
    return { title, existence, titleLength, keywordsCount };
  }
}

module.exports = PageTitleScanner;
