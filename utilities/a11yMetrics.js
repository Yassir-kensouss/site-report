exports.a11Metrics = results => {
  const a11yTotal =
    results.passes.length +
    results.incomplete.length +
    results.violations.length;

  const passes = Math.round((results.passes.length / a11yTotal) * 100) + "%";
  const incomplete =
    Math.round((results.incomplete.length / a11yTotal) * 100) + "%";
  const violations =
    Math.round((results.violations.length / a11yTotal) * 100) + "%";

  return {
    passes,
    incomplete,
    violations,
  };
};

exports.a11yViolations = (results, category) => {
  const checks = results[category] || [];

  const criticalIssues = checks.map(check => {
    return {
      title: check.help,
      ruleId: check.id,
      subTitle: check.id.split("-").join(" "),
      description: check.description,
      help: check.helpUrl,
      impact: check.impact,
      nodes: check.nodes.map(node => {
        return {
          html: node.html,
          target: node.target,
          failureSummary: node.failureSummary,
          levels: [...node.all, ...node.any, ...node.none],
        };
      }),
    };
  });

  return criticalIssues;
};

exports.a11yIncomplete = results => {
  const incomplete = results.incomplete || [];

  const incompleteIssues = incomplete.map(inc => {
    return {
      title: inc.help,
      subTitle: inc.id.split("-").join(" "),
      description: inc.description,
      help: inc.helpUrl,
      impact: inc.impact,
      nodes: inc.nodes.map(node => {
        return {
          html: node.html,
          target: node.target,
          failureSummary: node.failureSummary,
        };
      }),
    };
  });
};
