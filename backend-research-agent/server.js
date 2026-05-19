const app = require("./src/app");
const config = require("./src/config/config");

const server = app.listen(config.port, () => {
  console.log(
    `[research-agent] Server running on port ${config.port} in ${config.nodeEnv} mode`
  );
});

process.on("unhandledRejection", (reason) => {
  console.error("[research-agent] Unhandled rejection:", reason);
  server.close(() => process.exit(1));
});

process.on("uncaughtException", (error) => {
  console.error("[research-agent] Uncaught exception:", error);
  server.close(() => process.exit(1));
});
