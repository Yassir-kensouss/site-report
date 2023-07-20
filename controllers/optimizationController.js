const { INVALID_PAGE_LINK } = require("../config/errors");
const ImagesDetails = require("../utilities/ImagesAnalytics");
const PageLoader = require("../utilities/PageLoader");

exports.mediaAnalyzer = async (req, res) => {
  let pageLink = req.body.pageLink;

  try {
    // Load Page Init
    const pageLoader = new PageLoader(pageLink);
    const page = await pageLoader.loadPage();

    // Page Image Details Init
    const imageDetails = new ImagesDetails(pageLink, page);
    const extensions = await imageDetails.getExtension();

    res.json({
      ...extensions,
    });
  } catch (error) {
    res.status(400).json({
      error: INVALID_PAGE_LINK,
    });
  }
};
