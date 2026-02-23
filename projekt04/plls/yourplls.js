import { DatabaseSync } from "node:sqlite";

const db = new DatabaseSync("./plls/yourplls.db");

db.exec(`
  CREATE TABLE IF NOT EXISTS yourplls (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT,
    algorithm TEXT,
    best_time TEXT
  );
`);
