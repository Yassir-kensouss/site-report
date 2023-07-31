const sanitizeString = input => {
  return input.replace(/\n|\t/g, "");
};

module.exports = sanitizeString;
