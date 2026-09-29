const app = require("./app.js");
const config = require("./src/config/config.js");
const logger = require("./src/config/logger.js");

const http = require("http");

const server = http.createServer(app);

server.listen(config.port, () => {
  logger.info(`Listening to port ${config.port}`);
});

// Graceful shutdown
const exitHandler = () => {
  if (server) {
    server.close(() => {
      logger.info("Server closed");
      process.exit(0);
    });
  } else {
    process.exit(0);
  }
};

// Handle unexpected errors
const unexpectedErrorHandler = (error) => {
  logger.error(error);
  exitHandler();
};

process.on("uncaughtException", unexpectedErrorHandler);
process.on("unhandledRejection", unexpectedErrorHandler);
process.on("SIGTERM", exitHandler);
