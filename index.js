const express = require("express");
const bodyParser = require("body-parser");

// Routes
const analyzerRoutes = require("./routers/analyzer");
const optimizationRoutes = require("./routers/optimization");
const seoRoutes = require("./routers/seo");

// App config
require("dotenv").config();
const app = express();

// Middleware
app.use(express.json({ limit: "50mb" }));
// app.use(cors());
app.use(express.urlencoded({ limit: "50mb", extended: "true" }));

// Routes Middleware
app.use("/api", analyzerRoutes);
app.use("/api/optimization", optimizationRoutes);
app.use("/api/seo", seoRoutes);

app.listen(process.env.PORT, () => {
  console.log(`app running at ${process.env.PORT}`);
});