const express = require("express");
const cors = require("cors");
const path = require("path");
const sqlite3 = require("sqlite3").verbose();
const app = express();
const PORT = process.env.PORT || 3001;
const db = new sqlite3.Database(path.join(__dirname, "quiz.db"));
db.run("CREATE TABLE IF NOT EXISTS sessions (code TEXT PRIMARY KEY, answers1 TEXT, answers2 TEXT, name1 TEXT, name2 TEXT)");
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, "../client/dist")));
function genCode() { return Math.random().toString(36).substring(2, 8).toUpperCase(); }
app.post("/api/sessions", (req, res) => { const code = genCode(); db.run("INSERT INTO sessions (code, name1) VALUES (?, ?)", [code, req.body.name || "Person 1"], (err) => { if (err) return res.status(500).json({ error: err.message }); res.json({ code }); }); });
app.put("/api/sessions/:code/person1", (req, res) => { const code = req.params.code.toUpperCase(); db.run("UPDATE sessions SET answers1 = ?, name1 = ? WHERE code = ?", [JSON.stringify(req.body.answers), req.body.name || "Person 1", code], (err) => { if (err) return res.status(500).json({ error: err.message }); res.json({ ok: true }); }); });
app.put("/api/sessions/:code/person2", (req, res) => { const code = req.params.code.toUpperCase(); db.run("UPDATE sessions SET answers2 = ?, name2 = ? WHERE code = ?", [JSON.stringify(req.body.answers), req.body.name || "Person 2", code], (err) => { if (err) return res.status(500).json({ error: err.message }); res.json({ ok: true }); }); });
app.get("*", (req, res) => { res.sendFile(path.join(__dirname, "../client/dist/index.html")); });
app.listen(PORT, () => console.log("BestMatch running on port " + PORT));
