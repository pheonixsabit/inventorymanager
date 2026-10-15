import "dotenv/config";

export const config = {
  env: process.env.NODE_ENV || "development",
  port: Number(process.env.PORT || 30000),
  databasePath: process.env.DATABASE_PATH || "./data/inventory.sqlite"
};
