import { createApp } from "./app.js";
import { config } from "./config/env.js";
import { runMigrations } from "./db/migrations.js";

runMigrations();
const app = createApp();

const server = app.listen(config.port, () => {
  console.log(`Inventory Manager listening on port ${config.port}`);
});

server.on("error", (error) => {
  if (error.code === "EADDRINUSE") {
    console.error(`Port ${config.port} is already in use. Set PORT in .env or stop the process using that port.`);
    process.exitCode = 1;
    return;
  }

  throw error;
});
