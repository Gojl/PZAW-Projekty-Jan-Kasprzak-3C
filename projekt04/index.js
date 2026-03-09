import express from "express";
import { DatabaseSync } from "node:sqlite";
import path from "path";

import db from "./plls/plls.js"

const port = 6767;

const app = express(); 
app.set("view engine", "ejs");
app.set("views", path.join(process.cwd(), "views"));

app.set("view engine", "ejs");
app.use(express.static("main"));
app.use(express.urlencoded());

app.get("/myplls", (req, res) => {
  const allStmt = db.prepare("SELECT * FROM myplls");
  const allPLL = allStmt.all();
  res.render("myplls", { pll: allPLL }); 
});

app.get("/yourplls", (req, res) => {
  const stmt = db.prepare("SELECT * FROM yourplls");
  const data = stmt.all();
  res.render("yourplls", { pll: data });
});

app.get("/add-change", (req, res) => {
  const { name } = req.query;
  let pllData = null;

  if (name) {
    pllData = db.prepare("SELECT * FROM yourplls WHERE name = ?").get(name);
  }

  res.render("add_change", { pll: pllData });
});

app.post("/add-change-yourpll", (req, res) => {
  const { name, algorithm, best_time } = req.body;

  const stmt = db.prepare("SELECT * FROM yourplls WHERE name = ?");
  const existing = stmt.get(name);

  if (existing) {
    const updateStmt = db.prepare(
      "UPDATE yourplls SET algorithm = ?, best_time = ? WHERE name = ?"
    );
    updateStmt.run(algorithm, best_time, name);
  } else {

    const insertStmt = db.prepare(
      "INSERT INTO yourplls (name, algorithm, best_time) VALUES (?, ?, ?)"
    );
    insertStmt.run(name, algorithm, best_time);
  }
  res.redirect("/yourplls");
});

app.post("/delete-yourpll", (req, res) => {
  const { name } = req.body;

  const stmt = db.prepare("DELETE FROM yourplls WHERE name = ?");
  stmt.run(name);

  res.redirect("/yourplls");
});


app.listen(port, () => { 
  console.log(`Server listening on http://localhost:${port}`);
});