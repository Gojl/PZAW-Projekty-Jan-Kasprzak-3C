import { DatabaseSync } from "node:sqlite";

const db = new DatabaseSync("plls/plls.db");

import argon2 from "argon2";

db.exec(`
  CREATE TABLE IF NOT EXISTS myplls (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT,
    algorithm TEXT,
    best_time REAL
  );
`);

db.exec(`
CREATE TABLE IF NOT EXISTS yourplls (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT,
  algorithm TEXT,
  best_time REAL,
  user_id INTEGER
  );
`);

db.exec(`
  CREATE TABLE IF NOT EXISTS users (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  username TEXT UNIQUE,
  passhash TEXT,
  created_at INTEGER
  ) STRICT;
`);

const admin = db.prepare(
  "SELECT * FROM users WHERE username = ?"
).get("admin");

if (!admin) {
  db.prepare(
    "INSERT INTO users (username, passhash, created_at) VALUES (?, ?, ?)"
  ).run(
    "admin",
    "$argon2id$v=19$m=65536,t=3,p=4$LR7jfB9s1i1w2R6iZzklpg$GSsHXTZ9uAzjZbNevRsQvXHYt5bgQeiT55VMvH6m0gk",
    Date.now()
  );

  console.log("Utworzono konto admin");
}

const stmt = db.prepare("SELECT COUNT(*) AS count FROM myplls");
const row = stmt.get();
if (row.count === 0) {
  db.exec(`
    INSERT INTO myplls (name, algorithm, best_time) VALUES
    ('Aa', 'x R'' U R'' D2 R U'' R'' D2 R2 x''', 0.97),
    ('Ab', 'x R2 D2 R U R'' D2 R U'' R x''', 1.12),
    ('E', 'x'' R U'' R'' D R U R'' D'' R U R'' D R U'' R'' D'' x', 1.04),
    ('F', 'R'' U'' F'' R U R'' U'' R'' F R2 U'' R'' U'' R U R'' U R', 0.88),
    ('Ga', 'R2 U R'' U R'' U'' R U'' R2 D U'' R'' U R D''', 1.23),
    ('Gb', 'R'' U'' R U D'' R2 U R'' U R U'' R U'' R2 D', 1.08),
    ('Gc', 'R2 U'' R U'' R U R'' U R2 D'' U R U'' R'' D', 0.95),
    ('Gd', 'R U R'' U'' D R2 U'' R U'' R'' U R'' U R2 D''', 1.31),
    ('H', 'M2 U M2 U2 M2 U M2', 0.74),
    ('Ja', 'x R2 F R F'' R U2 r'' U r U2 x''', 1.19),
    ('Jb', 'R U R'' F'' R U R'' U'' R'' F R2 U'' R''', 0.86),
    ('Na', 'R U R'' U R U R'' F'' R U R'' U'' R'' F R2 U'' R'' U2 R U'' R''', 1.41),
    ('Nb', 'R'' U R U'' R'' F'' U'' F R U R'' F R'' F'' R U'' R', 1.07),
    ('Ra', 'y R U'' R'' U'' R U R D R'' U'' R D'' R'' U2 R''', 0.92),
    ('Rb', 'R2 F R U R U'' R'' F'' R U2 R'' U2 R', 1.34),
    ('T', 'R U R'' U'' R'' F R2 U'' R'' U'' R U R'' F''', 1.28),
    ('Ua', 'M2 U M U2 M'' U M2', 0.81),
    ('Ub', 'M2 U'' M U2 M'' U'' M2', 1.15),
    ('V', 'R'' U R U'' R'' f'' U'' R U2 R'' U'' R U'' R'' f R', 0.99),
    ('Y', 'F R U'' R'' U'' R U R'' F'' R U R'' U'' R'' F R F''', 1.36),
    ('Z', 'M U M2 U M2 U M U2 M2', 1.22);
`);

  console.log("Dane Your PLL zostały dodane.");
} else {
  console.log("Tabela Your PLL już zawiera dane.");
}

export default db;