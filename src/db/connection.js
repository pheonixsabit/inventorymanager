import { DatabaseSync } from "node:sqlite";
import { mkdirSync } from "node:fs";
import path from "node:path";
import { config } from "../config/env.js";

let db;

export function getDatabase() {
  if (!db) {
    mkdirSync(path.dirname(config.databasePath), { recursive: true });
    db = new DatabaseSync(config.databasePath);
    db.exec("PRAGMA foreign_keys = ON");
  }

  return db;
}
