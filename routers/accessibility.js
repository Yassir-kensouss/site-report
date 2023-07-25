const express = require("express");
const router = express.Router();
const { AxePuppeteer } = require("@axe-core/puppeteer");
const puppeteer = require("puppeteer");
const fs = require("fs");
const { a11Metrics, a11yViolations } = require("../utilities/a11yMetrics");

router.get("/", async (req, res) => {
  const browser = await puppeteer.launch();
  const page = await browser.newPage();
  await page.goto(req.body.pageLink);

  try {
    const results = await new AxePuppeteer(page).analyze();

    // get the percentage for each keyword
    const { passes, inapplicable, incomplete, violations } =
      a11Metrics(results);

    // Import the critical issues from a11yViolations
    const criticalIssues = a11yViolations(results, "violations");
    const incompleteIssues = a11yViolations(results, "incomplete");

    res.json({
      metrics: {
        passedChecks: passes,
        inapplicableChecks: inapplicable,
        warningChecks: incomplete,
        criticalIssues: violations,
      },
      criticalIssues: criticalIssues,
      incompleteIssues: incompleteIssues,
      // t: results.violations,
    });
  } catch (e) {
    // do something with the error
  }

  await browser.close();
});

module.exports = router;
