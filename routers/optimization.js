const express = require("express");
const {
  mediaAnalyzer,
  filesAnalyzer,
} = require("../controllers/optimizationController");
const router = express.Router();

router.get("/media", mediaAnalyzer);
router.get("/files", filesAnalyzer);

module.exports = router;
