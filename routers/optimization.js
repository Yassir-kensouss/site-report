const express = require("express");
const { mediaAnalyzer } = require("../controllers/optimizationController");
const router = express.Router();

router.get("/media", mediaAnalyzer);

module.exports = router;
