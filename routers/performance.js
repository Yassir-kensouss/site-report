const express = require("express");
const {
  mediaAnalyzer,
  getUnusedCss,
  filesTotalSize,
  getImgResolution,
} = require("../controllers/optimizationController");
const router = express.Router();

router.get("/media/images/ext", mediaAnalyzer);
router.get("/media/images/resolution", getImgResolution);
router.get("/files/unused-css", getUnusedCss);
router.get("/files/total-size", filesTotalSize);

module.exports = router;
