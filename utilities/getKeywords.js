const getKeywordsCount = (text = "") => {
  const split = text?.split(" ");
  let count = 0;

  split.forEach(word => {
    if (/^[a-zA-Z0-9]+$/.test(word)) {
      count++;
    }
  });

  return count;
};

module.exports = getKeywordsCount;
