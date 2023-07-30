const express = require("express");
const {
  mediaAnalyzer,
  scanPageMetaTags,
  generateKeywords,
} = require("../controllers/seoController");
const router = express.Router();

router.get("/media", mediaAnalyzer);
router.get("/meta-tags", scanPageMetaTags);
router.get("/keyword/generate", generateKeywords);

module.exports = router;
