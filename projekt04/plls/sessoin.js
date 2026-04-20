import { DatabaseSync } from "node:sqlite";
import { randomBytes } from "node:crypto";

const db = new DatabaseSync("plls/plls.db", { readBigInts: true });

const SESSION_COOKIE = "__Host-fish-id";
const ONE_WEEK = 7 * 24 * 60 * 60 * 1000;

db.exec(`
  CREATE TABLE IF NOT EXISTS fc_session (
    id              INTEGER PRIMARY KEY,
    user_id         INTEGER,
    created_at      INTEGER
  ) STRICT;
  `);

const db_ops = {
	create_session: db.prepare(
		`INSERT INTO fc_session (id, user_id, created_at)
            VALUES (?, ?, ?) RETURNING id, user_id, created_at;`
	),
	get_session: db.prepare(
		"SELECT id, user_id, created_at from fc_session WHERE id = ?;"
	),
};

function createSession(userId, res) {
	let sessionId = randomBytes(8).readBigInt64BE();
	let createdAt = Date.now();

	let session = db_ops.create_session.get(sessionId, userId, createdAt);

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
		if (!sessionId.match(/^-?[0-9]+$/)) {
			sessionId = null;
		} else {
			sessionId = BigInt(sessionId);
		}
	}

	if (sessionId != null) session = db_ops.get_session.get(sessionId);

	if (session != null) {
		res.locals.session = session;
		res.locals.session.user = session.user_id;

		res.cookie(SESSION_COOKIE, res.locals.session.id.toString(), {
			maxAge: ONE_WEEK,
			httpOnly: true,
			secure: true,
		});
	} else {
		session = createSession(null, res);
	}

	setImmediate(printUserSession);

	next();

	function printUserSession() {
		console.info(
			"Session:",
			session.id,
			"user:",
			session.user,
			"created at:",
			new Date(Number(session.created_at)).toISOString()
		);
	}
}

export default {
	createSession,
	sessionHandler,
};