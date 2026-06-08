import db from "./plls.js";  
import { randomBytes } from "node:crypto";


const SESSION_COOKIE = "__Host-fish-id";
const ONE_WEEK = 7 * 24 * 60 * 60 * 1000;

db.exec(`
  CREATE TABLE IF NOT EXISTS fc_session (
    id              INTEGER PRIMARY KEY,
    user_id         INTEGER,
    created_at      INTEGER
  ) STRICT;
  `);

function createSession(userId, res) {
  const sessionId = randomBytes(4).readUInt32BE();
  const createdAt = Date.now();

  const session = db.prepare(`
    INSERT INTO fc_session (id, user_id, created_at)
    VALUES (?, ?, ?)
    RETURNING id, user_id, created_at
  `).get(sessionId, userId, createdAt);

  session.user = userId;

  res.locals.session = session;

  res.cookie(SESSION_COOKIE, session.id.toString(), {
    maxAge: ONE_WEEK,
    httpOnly: true,
    secure: true,
  });

  return session;
}

function sessionHandler(req, res, next) {
  let sessionId = req.cookies[SESSION_COOKIE];
  let session = null;

  if (sessionId != null) {
    if (!sessionId.match(/^[0-9]+$/)) {
      sessionId = null;
    } else {
      sessionId = Number(sessionId);
    }
  }

  if (sessionId != null) {
    session = db.prepare(
      "SELECT id, user_id, created_at FROM fc_session WHERE id = ?"
    ).get(sessionId);
  }

  if (session) {
    session.user = session.user_id;

    res.locals.session = session;

    res.cookie(SESSION_COOKIE, session.id.toString(), {
      maxAge: ONE_WEEK,
      httpOnly: true,
      secure: true,
    });
  } else {
    session = createSession(null, res);
  }

  console.info(
    "Session:",
    session.id,
    "user:",
    session.user,
    "created at:",
    new Date(session.created_at).toISOString()
  );

  next();
}

export default {
	createSession,
	sessionHandler,
};