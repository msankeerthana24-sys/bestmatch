const express = require("express");
const cors = require("cors");
const path = require("path");
const Database = require("better-sqlite3");

const app = express();
const PORT = process.env.PORT || 3001;

// DB setup
const db = new Database(path.join(__dirname, "quiz.db"));
db.exec(`
  CREATE TABLE IF NOT EXISTS sessions (
    code TEXT PRIMARY KEY,
    answers1 TEXT,
    answers2 TEXT,
    name1 TEXT,
    name2 TEXT,
    created_at INTEGER DEFAULT (strftime('%s','now'))
  )
`);

app.use(cors());
app.use(express.json());

// Serve built React app in production
app.use(express.static(path.join(__dirname, "../client/dist")));

// Generate a random 6-char code
function genCode() {
  return Math.random().toString(36).substring(2, 8).toUpperCase();
}

// Calculate match %
function calcMatch(a1, a2) {
  if (!a1 || !a2) return null;
  const keys = Object.keys(a1);
  let matches = 0;
  let total = 0;
  keys.forEach(k => {
    if (a2[k] !== undefined) {
      total++;
      if (a1[k] === a2[k]) matches++;
    }
  });
  return total === 0 ? 0 : Math.round((matches / total) * 100);
}

// POST /api/sessions — create new session
app.post("/api/sessions", (req, res) => {
  const { name } = req.body;
  let code;
  let attempts = 0;
  do {
    code = genCode();
    attempts++;
  } while (db.prepare("SELECT code FROM sessions WHERE code = ?").get(code) && attempts < 10);

  db.prepare("INSERT INTO sessions (code, name1) VALUES (?, ?)").run(code, name || "Person 1");
  res.json({ code });
});

// GET /api/sessions/:code — get session
app.get("/api/sessions/:code", (req, res) => {
  const session = db.prepare("SELECT * FROM sessions WHERE code = ?").get(req.params.code.toUpperCase());
  if (!session) return res.status(404).json({ error: "Session not found" });

  const a1 = session.answers1 ? JSON.parse(session.answers1) : null;
  const a2 = session.answers2 ? JSON.parse(session.answers2) : null;
  res.json({
    code: session.code,
    name1: session.name1,
    name2: session.name2,
    answers1: a1,
    answers2: a2,
    match: calcMatch(a1, a2),
    ready: !!(a1 && a2),
  });
});

// PUT /api/sessions/:code/person1 — save person1 answers
app.put("/api/sessions/:code/person1", (req, res) => {
  const { answers, name } = req.body;
  const code = req.params.code.toUpperCase();
  const session = db.prepare("SELECT * FROM sessions WHERE code = ?").get(code);
  if (!session) return res.status(404).json({ error: "Session not found" });

  db.prepare("UPDATE sessions SET answers1 = ?, name1 = ? WHERE code = ?")
    .run(JSON.stringify(answers), name || session.name1, code);
  res.json({ ok: true });
});

// PUT /api/sessions/:code/person2 — save person2 answers
app.put("/api/sessions/:code/person2", (req, res) => {
  const { answers, name } = req.body;
  const code = req.params.code.toUpperCase();
  const session = db.prepare("SELECT * FROM sessions WHERE code = ?").get(code);
  if (!session) return res.status(404).json({ error: "Session not found" });

  db.prepare("UPDATE sessions SET answers2 = ?, name2 = ? WHERE code = ?")
    .run(JSON.stringify(answers), name || "Person 2", code);

  const updated = db.prepare("SELECT * FROM sessions WHERE code = ?").get(code);
  const a1 = updated.answers1 ? JSON.parse(updated.answers1) : null;
  const a2 = updated.answers2 ? JSON.parse(updated.answers2) : null;
  res.json({ ok: true, match: calcMatch(a1, a2) });
});

// Fallback to React app
app.get("*", (req, res) => {
  res.sendFile(path.join(__dirname, "../client/dist/index.html"));
});

app.listen(PORT, () => {
  console.log(`BestMatch server running on port ${PORT}`);
});
