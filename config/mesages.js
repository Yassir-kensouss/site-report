const LEVELS = {
  PASSED: "passed",
  FIX: "fix",
};

const RECOMMENDED_TITLE_KEYWORD_COUNT = 5;
const RECOMMENDED_TITLE_LENGTH = 70;

const LONG_PAGE_TITLE_WRONG = {
  message: "The page title is too long",
  fix: "Set the page title length between 50 character and 70 and avoid 'stop words' such as, 'the', 'to', 'in' to gain some extra space for good keywords",
};

const LONG_PAGE_TITLE_GOOD = {
  message: "Characters length is SEO friendly",
};

const TITLE_KEYWORD_COUNT_WRONG = {
  message: "The page title has minimum amount of keyword",
  fix: "it's recommended to set between 5-6 keyword on the page title for a strong SEO title",
};

const TITLE_KEYWORD_COUNT_GOOD = {
  message: "Title length is SEO Friendly",
};

module.exports = {
  LONG_PAGE_TITLE_WRONG,
  TITLE_KEYWORD_COUNT_WRONG,
  TITLE_KEYWORD_COUNT_GOOD,
  LONG_PAGE_TITLE_GOOD,
  RECOMMENDED_TITLE_KEYWORD_COUNT,
  RECOMMENDED_TITLE_LENGTH,
  LEVELS,
};
