const express = require("express");
const helmet = require("helmet");
const cors = require("cors");
const compression = require("compression");
const httpStatus = require("http-status");
const path = require("path");

const config = require("./src/config/config.js");
const routes = require("./src/routes/v1");
const morgan = require("./src/config/morgan.js");
const { authLimiter } = require("./src/middlewares/rateLimiter.js");
const ApiError = require("./src/utils/ApiError.js");
const upload = require("./src/config/multer.js");

require("./src/models");
require("./src/schedular/subscriptionOperation.js");

const app = express();

const PUBLIC_DIR = path.resolve(__dirname, "./public");

/*
 * Security headers
 */
app.use(helmet());

/*
 * CORS
 *
 * Allowed origins are managed centrally through config/accessDomains.js.
 */
app.use(
  cors({
    origin: config.accessDomains.split(","),
    methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
    credentials: true,
  }),
);

/*
 * Logging
 */
if (config.env !== "test") {
  app.use(morgan.successHandler);
  app.use(morgan.errorHandler);
}

/*
 * Request parsing
 */
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

/*
 * Compression
 */
app.use(compression());

/*
 * Static files
 */
app.use(express.static(PUBLIC_DIR));

app.use("/images", express.static(path.join(PUBLIC_DIR, "uploads/images")));
app.use("/videos", express.static(path.join(PUBLIC_DIR, "uploads/videos")));
app.use("/gifs", express.static(path.join(PUBLIC_DIR, "uploads/gifs")));
app.use("/docs", express.static(path.join(PUBLIC_DIR, "uploads/docs")));
app.use("/songs", express.static(path.join(PUBLIC_DIR, "uploads/songs")));

/*
 * Health check
 */
app.get("/api/healthcheck", (req, res) => {
  res.status(200).json({
    response: "ok",
  });
});

/*
 * Test endpoint
 */
app.get("/test", (req, res) => {
  res.status(200).send("Hello World !!");
});

/*
 * Authentication rate limiting
 */
if (config.env === "production") {
  app.use("/api/v1/auth", authLimiter);
}

/*
 * API routes
 */
app.use("/api/v1", upload, routes);

/*
 * 404 handler
 */
app.use((req, res, next) => {
  next(new ApiError(httpStatus.NOT_FOUND, "Not found"));
});

/*
 * Export Express application
 */
module.exports = app;
