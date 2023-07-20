const express = require("express");
const { mediaAnalyzer } = require("../controllers/seoController");
const router = express.Router();

router.get("/media", mediaAnalyzer);

module.exports = router;
