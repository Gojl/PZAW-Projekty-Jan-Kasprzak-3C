import express from "express";
import path from "path";

import db from "./plls/plls.js";
import session from "./plls/sessoin.js";
import cookieParser from "cookie-parser";
import argon2 from "argon2";
import rateLimit from "express-rate-limit";

const port = 6767;

const app = express(); 
app.set("view engine", "ejs");
app.set("views", path.join(process.cwd(), "views"));
app.use(express.urlencoded());

app.use(cookieParser());
app.use(session.sessionHandler);

const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  message: "Za dużo prób logowania. Spróbuj ponownie później."
});

app.use("/login", loginLimiter);

app.get("/", (req, res) => {
  let isAdmin = false;

  if (res.locals.session.user) {
    const user = db.prepare(
      "SELECT * FROM users WHERE id = ?"
    ).get(res.locals.session.user);

    if (user && user.username === "admin") {
      isAdmin = true;
    }
  }

  res.render("index", {
    session: res.locals.session,
    isAdmin
  });
});

app.get("/myplls", (req, res) => {
  const allStmt = db.prepare("SELECT * FROM myplls");
  const allPLL = allStmt.all();
  res.render("myplls", { pll: allPLL }); 
});

app.get("/yourplls", (req, res) => {
  const userId = res.locals.session.user;

  if (!userId) {
    return res.render("yourplls", { pll: [], error: "notLoggedIn" });
  }

  const stmt = db.prepare("SELECT * FROM yourplls WHERE user_id = ?");
  const data = stmt.all(userId);
  res.render("yourplls", { pll: data, error: null });
});

app.get("/add-change", (req, res) => {
  const userId = res.locals.session.user;

  const { name } = req.query;
  let pllData = null;

  if (!userId) {
    return res.render("add_change", { pll: pllData, error: "notLoggedIn" });
  }

  if (name) {
    pllData = db.prepare("SELECT * FROM yourplls WHERE name = ? AND user_id = ?").get(name, userId);
  }

  res.render("add_change", { pll: pllData, error: null });
});

app.get("/login", (req, res) => {
  res.render("login", { error: null });
});

app.get("/register", (req, res) => {
  res.render("register", { error: null });
});

app.post("/login", async (req, res) => {
  const { username, password } = req.body;

  const stmt = db.prepare("SELECT * FROM users WHERE username = ?");
  const user = stmt.get(username);

  if (!user) {
    return res.render("login", { error: "Nie ma takiego użytkownika" });
  }

  try {
    const valid = await argon2.verify(user.passhash, password);
    if (!valid) {
      return res.render("login", { error: "Złe hasło" });
    }

    session.createSession(user.id, res);

    res.redirect("/");
  } catch (err) {
    console.error("Błąd logowania:", err);
    res.render("login", { error: "Coś poszło nie tak" });
  }
});

app.post("/register", async (req, res) => {
  const { username, password } = req.body;
  const stmtCheck = db.prepare("SELECT * FROM users WHERE username = ?");
  const existingUser = stmtCheck.get(username);
  if (existingUser) {
    return res.render("register", { error: "Użytkownik już istnieje" });
  }

  try {
    const hashedPassword = await argon2.hash(password);
    const stmtInsert = db.prepare(
      "INSERT INTO users (username, passhash, created_at) VALUES (?, ?, ?)"
    );
    stmtInsert.run(username, hashedPassword, Date.now());

    res.redirect("/login");
  } catch (err) {
    console.error(err);
    res.render("register", { error: "Coś poszło nie tak" });
  }
});

app.post("/logout", (req, res) => {
  const sessionId = req.cookies["__Host-fish-id"];

  if (sessionId) {
    db.prepare("DELETE FROM fc_session WHERE id = ?")
      .run(parseInt(sessionId));
  }

  res.clearCookie("__Host-fish-id");
  res.redirect("/");
});

app.post("/add-change-yourpll", (req, res) => {
  const { name, algorithm, best_time } = req.body;
  const userId = res.locals.session.user;

  if (!userId) return res.redirect("/login");

  const stmt = db.prepare("SELECT * FROM yourplls WHERE name = ? AND user_id = ?");
  const existing = stmt.get(name, userId);

  if (existing) {
    const updateStmt = db.prepare(
      "UPDATE yourplls SET algorithm = ?, best_time = ? WHERE name = ? AND user_id = ?"
    );
    updateStmt.run(algorithm, best_time, name, userId);
  } else {
    const insertStmt = db.prepare(
      "INSERT INTO yourplls (name, algorithm, best_time, user_id) VALUES (?, ?, ?, ?)"
    );
    insertStmt.run(name, algorithm, best_time, userId);
  }
  res.redirect("/yourplls");
});

app.post("/delete-yourpll", (req, res) => {
  const { name } = req.body;
  const userId = res.locals.session.user;

  if (!userId) return res.redirect("/login");

  const stmt = db.prepare("DELETE FROM yourplls WHERE name = ? AND user_id = ?");
  stmt.run(name, userId);

  res.redirect("/yourplls");
});

app.get("/admin", (req, res) => {
  const userId = res.locals.session.user;
  if (!userId) return res.redirect("/login");

  const user = db.prepare("SELECT * FROM users WHERE id = ?").get(userId);
  if (!user || user.username !== "admin") {
    return res.status(403).send("Brak dostępu. Tylko admin może wejść na tę stronę.");
  }

  const allPLL = db.prepare("SELECT * FROM yourplls").all();
  res.render("admin", { pll: allPLL, user });
});

app.post("/admin/delete-pll", (req, res) => {
  const userId = res.locals.session.user;
  const user = db.prepare("SELECT * FROM users WHERE id = ?").get(userId);
  if (!user || user.username !== "admin") return res.status(403).send("Brak dostępu");

  const { name, user_id } = req.body;
  db.prepare("DELETE FROM yourplls WHERE name = ? AND user_id = ?").run(name, user_id);

  res.redirect("/admin");
});

app.get("/admin/admin-edit", (req, res) => {
  const currentUserId = res.locals.session.user;
  if (!currentUserId) return res.redirect("/login");

  const user = db.prepare("SELECT * FROM users WHERE id = ?").get(currentUserId);
  if (!user || user.username !== "admin") return res.status(403).send("Brak dostępu");

  const { name, user_id } = req.query;
  const pll = db.prepare("SELECT * FROM yourplls WHERE name = ? AND user_id = ?").get(name, user_id);

  if (!pll) return res.status(404).send("PLL nie znaleziony");

  res.render("admin-edit", { pll });
});

app.post("/admin/edit-pll", (req, res) => {
  const currentUserId = res.locals.session.user;
  const user = db.prepare("SELECT * FROM users WHERE id = ?").get(currentUserId);

  if (!user || user.username !== "admin") return res.status(403).send("Brak dostępu");

  const { old_name, new_name, user_id, algorithm, best_time } = req.body;

  db.prepare(
    "UPDATE yourplls SET name = ?, algorithm = ?, best_time = ? WHERE name = ? AND user_id = ?"
  ).run(new_name, algorithm, best_time, old_name, user_id);

  res.redirect("/admin");
});

app.listen(port, () => { 
  console.log(`Server listening on http://localhost:${port}`);
});