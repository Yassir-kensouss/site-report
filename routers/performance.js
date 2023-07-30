const express = require("express");
const {
  mediaAnalyzer,
  getUnusedCss,
  filesTotalSize,
  getImgResolution,
  getFCP,
  getTTFB,
  getMetrics,
} = require("../controllers/optimizationController");
const router = express.Router();

router.get("/media/images/ext", mediaAnalyzer);
router.get("/media/images/resolution", getImgResolution);
router.get("/files/unused-css", getUnusedCss);
router.get("/files/total-size", filesTotalSize);
router.get("/web-vitals/fcp", getFCP);
router.get("/web-vitals/ttfb", getTTFB);
router.get("/metrics", getMetrics);

module.exports = router;
