const express = require("express");
const {
  mediaAnalyzer,
  scanPageMetaTags,
  generateKeywords,
  semantic,
} = require("../controllers/seoController");
const router = express.Router();

router.get("/media", mediaAnalyzer);
router.get("/meta-tags", scanPageMetaTags);
router.get("/semantic", semantic);
router.get("/keyword/generate", generateKeywords);

module.exports = router;
