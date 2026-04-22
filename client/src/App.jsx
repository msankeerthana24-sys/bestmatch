import { useState, useEffect } from "react";

const API = "/api";

const QUESTIONS = [
  { id: "q1",  text: "What's your ideal weekend?",           options: ["Netflix & chill at home", "Outdoor adventure", "Social hangout", "Exploring somewhere new"] },
  { id: "q2",  text: "Pick your go-to comfort food:",        options: ["Pizza", "Ramen / noodles", "Ice cream", "Chips & snacks"] },
  { id: "q3",  text: "What time do you usually wake up?",    options: ["Before 7am", "7–9am", "9–11am", "After 11am"] },
  { id: "q4",  text: "Your energy in social situations:",    options: ["Life of the party", "Chill and observant", "Depends on mood", "Prefer one-on-ones"] },
  { id: "q5",  text: "What's your love language?",           options: ["Words of affirmation", "Quality time", "Acts of service", "Gifts / touch"] },
  { id: "q6",  text: "Pick a travel style:",                 options: ["Backpacking / budget", "Luxury & comfort", "Road trips", "Stay-cation"] },
  { id: "q7",  text: "How do you handle conflict?",          options: ["Talk it out immediately", "Need space first", "Avoid it if possible", "Depends on situation"] },
  { id: "q8",  text: "Your ideal Friday night:",             options: ["House party", "Quiet dinner out", "Gaming / movies", "Dancing / clubbing"] },
  { id: "q9",  text: "What matters most in a friend?",       options: ["Loyalty", "Humor", "Honesty", "Emotional support"] },
  { id: "q10", text: "Pick your vibe:",                      options: ["Chaotic & spontaneous", "Calm & structured", "Dreamy & creative", "Ambitious & driven"] },
  { id: "q11", text: "Your relationship with money:",        options: ["Save everything", "Treat yourself often", "Balance both", "Money comes, money goes"] },
  { id: "q12", text: "How do you make decisions?",           options: ["Logic & data", "Gut feeling", "Ask others first", "Pros & cons list"] },
];

// ── API helpers ──────────────────────────────────────────────────────────────
async function createSession(name) {
  const r = await fetch(`${API}/sessions`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ name }),
  });
  return r.json();
}

async function getSession(code) {
  const r = await fetch(`${API}/sessions/${code}`);
  if (!r.ok) return null;
  return r.json();
}

async function saveAnswers(code, role, answers, name) {
  await fetch(`${API}/sessions/${code}/${role}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ answers, name }),
  });
}

// ── Screens ───────────────────────────────────────────────────────────────────

function HomeScreen({ onCreate, onJoin }) {
  const [code, setCode] = useState("");
  const [err, setErr] = useState("");

  async function handleJoin() {
    setErr("");
    if (code.length < 4) return;
    const s = await getSession(code);
    if (!s) { setErr("Quiz code not found. Double-check and try again!"); return; }
    if (!s.answers1) { setErr("Person 1 hasn't finished answering yet!"); return; }
    onJoin(code, s);
  }

  return (
    <div className="screen home">
      <div className="hero">
        <div className="hero-icon">💞</div>
        <h1>BestMatch</h1>
        <p className="hero-sub">Find out how compatible you really are</p>
      </div>

      <div className="card">
        <button className="btn primary" onClick={onCreate}>
          ✨ Create a Quiz
        </button>

        <div className="divider"><span>or join one</span></div>

        <input
          className="code-input"
          placeholder="ENTER CODE"
          value={code}
          maxLength={6}
          onChange={e => { setCode(e.target.value.toUpperCase()); setErr(""); }}
          onKeyDown={e => e.key === "Enter" && handleJoin()}
        />
        {err && <p className="error">{err}</p>}
        <button className="btn secondary" onClick={handleJoin} disabled={code.length < 4}>
          🔗 Join Quiz
        </button>
      </div>

      <p className="foot">Share your code with a friend to see your match 💌</p>
    </div>
  );
}

function NameScreen({ label, onNext }) {
  const [name, setName] = useState("");
  return (
    <div className="screen name-screen">
      <div className="name-icon">👤</div>
      <h2>What's your name?</h2>
      <p className="name-sub">{label}</p>
      <input
        className="text-input"
        placeholder="Your name..."
        value={name}
        maxLength={24}
        onChange={e => setName(e.target.value)}
        autoFocus
      />
      <button className="btn primary" onClick={() => onNext(name || "Anonymous")} disabled={!name.trim()}>
        Let's go →
      </button>
    </div>
  );
}

function QuizScreen({ myName, onFinish }) {
  const [idx, setIdx] = useState(0);
  const [answers, setAnswers] = useState({});
  const q = QUESTIONS[idx];
  const pct = (idx / QUESTIONS.length) * 100;

  function pick(opt) {
    const newA = { ...answers, [q.id]: opt };
    setAnswers(newA);
    if (idx + 1 < QUESTIONS.length) setIdx(idx + 1);
    else onFinish(newA);
  }

  return (
    <div className="screen quiz">
      <div className="q-top">
        <div className="prog-bar"><div className="prog-fill" style={{ width: `${pct}%` }} /></div>
        <span className="q-num">{idx + 1} / {QUESTIONS.length}</span>
      </div>
      <p className="q-name">{myName}'s answers</p>
      <div className="q-card">
        <p className="q-text">{q.text}</p>
        <div className="opts">
          {q.options.map(o => (
            <button
              key={o}
              className={`opt ${answers[q.id] === o ? "sel" : ""}`}
              onClick={() => pick(o)}
            >
              {o}
            </button>
          ))}
        </div>
      </div>
      {idx > 0 && <button className="back-btn" onClick={() => setIdx(idx - 1)}>← Back</button>}
    </div>
  );
}

function WaitingScreen({ code, name1 }) {
  const [copied, setCopied] = useState(false);

  function copy() {
    navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  return (
    <div className="screen waiting">
      <div className="wait-icon">⏳</div>
      <h2>Waiting for your friend...</h2>
      <p className="wait-sub">Share this code with them:</p>
      <div className="code-box" onClick={copy}>
        <span className="code-big">{code}</span>
        <span className="copy-hint">{copied ? "✅ Copied!" : "tap to copy"}</span>
      </div>
      <p className="wait-note">They open this app, enter the code, answer the questions — then you'll both see your match!</p>
      <p className="wait-check">Already answered? <a href={`/?code=${code}&check=1`} style={{color:"#ff6eb4"}}>Check results →</a></p>
    </div>
  );
}

function ResultsScreen({ session }) {
  const { name1, name2, answers1, answers2, match, ready } = session;

  const emoji = match >= 80 ? "🔥" : match >= 60 ? "💛" : match >= 40 ? "🙂" : "🤷";
  const label = match >= 80 ? "Soul Twins!" : match >= 60 ? "Great Match!" : match >= 40 ? "Some Common Ground" : "Opposites Attract?";

  return (
    <div className="screen results">
      <div className="res-hero">
        <div className="res-emoji">{emoji}</div>
        <div className="res-pct">{match}%</div>
        <div className="res-label">{label}</div>
        {name1 && name2 && <div className="res-names">{name1} & {name2}</div>}
      </div>

      {ready ? (
        <div className="breakdown">
          <h3>Question Breakdown</h3>
          {QUESTIONS.map(q => {
            const a1 = answers1?.[q.id];
            const a2 = answers2?.[q.id];
            const same = a1 === a2;
            return (
              <div key={q.id} className={`row ${same ? "yes" : "no"}`}>
                <p className="row-q">{q.text}</p>
                <div className="row-ans">
                  <span className="pill p1">👤 {a1 || "—"}</span>
                  <span className="dot">{same ? "✅" : "❌"}</span>
                  <span className="pill p2">👥 {a2 || "—"}</span>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="pending-card">
          <p>Your answers are in! Waiting for your friend to answer…</p>
          <button className="btn primary" style={{marginTop:16}} onClick={() => window.location.reload()}>
            🔄 Refresh
          </button>
        </div>
      )}
    </div>
  );
}

// ── App shell ────────────────────────────────────────────────────────────────

export default function App() {
  const [screen, setScreen] = useState("loading");
  const [session, setSession] = useState(null);
  const [role, setRole] = useState(null);
  const [myName, setMyName] = useState("");

  // Handle deep-link /?code=XXX or /?code=XXX&check=1
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const code = params.get("code");
    const check = params.get("check");
    if (code) {
      getSession(code).then(s => {
        if (s) {
          setSession(s);
          if (check) { setScreen("results"); }
          else if (!s.answers1) { setRole("person1"); setScreen("name"); }
          else { setRole("person2"); setScreen("name"); }
        } else {
          setScreen("home");
        }
      });
    } else {
      setScreen("home");
    }
  }, []);

  async function handleCreate() {
    setRole("person1");
    setScreen("name");
  }

  async function handleNameDone(name) {
    setMyName(name);
    if (role === "person1" && !session) {
      const { code } = await createSession(name);
      const s = await getSession(code);
      setSession(s);
      // update URL without reload
      window.history.replaceState({}, "", `/?code=${code}`);
    }
    setScreen("quiz");
  }

  async function handleJoin(code, s) {
    setSession(s);
    setRole("person2");
    window.history.replaceState({}, "", `/?code=${code}`);
    setScreen("name");
  }

  async function handleQuizDone(answers) {
    await saveAnswers(session.code, role, answers, myName);
    const updated = await getSession(session.code);
    setSession(updated);
    if (role === "person1") setScreen("waiting");
    else setScreen("results");
  }

  if (screen === "loading") return <div className="loading">💞</div>;

  return (
    <>
      <style>{CSS}</style>
      {screen === "home"    && <HomeScreen    onCreate={handleCreate} onJoin={handleJoin} />}
      {screen === "name"    && <NameScreen    label={role === "person1" ? "You're creating this quiz" : `Joining ${session?.name1 || "your friend"}'s quiz`} onNext={handleNameDone} />}
      {screen === "quiz"    && <QuizScreen    myName={myName} onFinish={handleQuizDone} />}
      {screen === "waiting" && <WaitingScreen code={session?.code} name1={myName} />}
      {screen === "results" && <ResultsScreen session={session} />}
    </>
  );
}

// ── Styles ────────────────────────────────────────────────────────────────────

const CSS = `
  @import url('https://fonts.googleapis.com/css2?family=Fraunces:ital,wght@0,400;0,700;0,900;1,400&family=DM+Sans:wght@400;500;600&display=swap');
  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
  body { background: #0c0c10; color: #f0ece4; font-family: 'DM Sans', sans-serif; min-height: 100vh; }
  a { color: inherit; }
  
  .loading { display: flex; align-items: center; justify-content: center; min-height: 100vh; font-size: 64px; animation: pulse 1.2s ease-in-out infinite; }
  @keyframes pulse { 0%,100%{opacity:1} 50%{opacity:.3} }

  .screen { min-height: 100vh; display: flex; flex-direction: column; align-items: center; padding: 40px 20px 60px; max-width: 500px; margin: 0 auto; }

  /* HOME */
  .home { justify-content: center; gap: 28px; }
  .hero { text-align: center; }
  .hero-icon { font-size: 60px; margin-bottom: 10px; }
  h1 { font-family: 'Fraunces', serif; font-size: 46px; font-weight: 900; background: linear-gradient(135deg, #ff6eb4 20%, #ffa94d 80%); -webkit-background-clip: text; -webkit-text-fill-color: transparent; background-clip: text; }
  .hero-sub { color: #777; font-size: 15px; margin-top: 8px; }
  .card { background: #161619; border: 1px solid #252530; border-radius: 22px; padding: 28px; width: 100%; display: flex; flex-direction: column; gap: 14px; }
  .btn { width: 100%; padding: 15px; border-radius: 13px; border: none; font-size: 16px; font-weight: 600; cursor: pointer; font-family: 'DM Sans', sans-serif; transition: all .2s; }
  .btn:disabled { opacity: .35; cursor: not-allowed; }
  .btn.primary { background: linear-gradient(135deg, #ff6eb4, #ffa94d); color: #fff; }
  .btn.primary:hover:not(:disabled) { transform: translateY(-2px); box-shadow: 0 10px 28px rgba(255,110,180,.3); }
  .btn.secondary { background: #222228; color: #f0ece4; }
  .btn.secondary:hover:not(:disabled) { background: #2c2c35; }
  .divider { display: flex; align-items: center; gap: 12px; color: #444; font-size: 13px; }
  .divider::before,.divider::after { content:''; flex:1; height:1px; background:#252530; }
  .code-input { background: #0c0c10; border: 1.5px solid #252530; color: #ff6eb4; border-radius: 13px; padding: 14px; font-size: 26px; font-weight: 900; letter-spacing: 8px; text-align: center; width: 100%; font-family: 'Fraunces', serif; outline: none; }
  .code-input:focus { border-color: #ff6eb4; }
  .error { color: #ff6eb4; font-size: 13px; text-align: center; }
  .foot { color: #444; font-size: 13px; text-align: center; }

  /* NAME */
  .name-screen { justify-content: center; gap: 20px; text-align: center; }
  .name-icon { font-size: 56px; }
  .name-screen h2 { font-family: 'Fraunces', serif; font-size: 30px; }
  .name-sub { color: #666; font-size: 14px; }
  .text-input { background: #161619; border: 1.5px solid #252530; color: #f0ece4; border-radius: 13px; padding: 15px 18px; font-size: 18px; width: 100%; font-family: 'DM Sans', sans-serif; outline: none; text-align: center; }
  .text-input:focus { border-color: #ff6eb4; }

  /* QUIZ */
  .quiz { justify-content: flex-start; gap: 22px; padding-top: 48px; }
  .q-top { width: 100%; display: flex; flex-direction: column; gap: 6px; }
  .prog-bar { background: #161619; border-radius: 99px; height: 5px; overflow: hidden; }
  .prog-fill { background: linear-gradient(90deg, #ff6eb4, #ffa94d); height: 100%; border-radius: 99px; transition: width .4s ease; }
  .q-num { font-size: 12px; color: #555; text-align: right; }
  .q-name { font-size: 12px; color: #ff6eb4; letter-spacing: 2px; text-transform: uppercase; font-weight: 600; width: 100%; }
  .q-card { background: #161619; border: 1px solid #252530; border-radius: 20px; padding: 28px; width: 100%; }
  .q-text { font-family: 'Fraunces', serif; font-size: 22px; font-weight: 700; line-height: 1.4; margin-bottom: 22px; }
  .opts { display: flex; flex-direction: column; gap: 10px; }
  .opt { background: #0c0c10; border: 1.5px solid #252530; color: #f0ece4; border-radius: 12px; padding: 14px 18px; text-align: left; font-size: 15px; cursor: pointer; font-family: 'DM Sans', sans-serif; transition: all .15s; }
  .opt:hover { border-color: #ff6eb4; background: #1a0f16; }
  .opt.sel { border-color: #ff6eb4; background: linear-gradient(135deg, rgba(255,110,180,.15), rgba(255,169,77,.1)); }
  .back-btn { background: none; border: none; color: #555; font-size: 14px; cursor: pointer; padding: 8px; }

  /* WAITING */
  .waiting { justify-content: center; gap: 20px; text-align: center; }
  .wait-icon { font-size: 64px; }
  .waiting h2 { font-family: 'Fraunces', serif; font-size: 28px; }
  .wait-sub { color: #777; }
  .code-box { background: #161619; border: 2px dashed #ff6eb4; border-radius: 18px; padding: 22px 36px; cursor: pointer; user-select: none; }
  .code-big { font-family: 'Fraunces', serif; font-size: 46px; font-weight: 900; letter-spacing: 10px; color: #ff6eb4; display: block; }
  .copy-hint { font-size: 12px; color: #555; display: block; margin-top: 4px; }
  .wait-note { color: #555; font-size: 14px; max-width: 320px; line-height: 1.7; }
  .wait-check { font-size: 14px; color: #555; }

  /* RESULTS */
  .results { justify-content: flex-start; gap: 22px; padding-top: 36px; }
  .res-hero { text-align: center; width: 100%; background: #161619; border-radius: 24px; padding: 36px 24px; border: 1px solid #252530; }
  .res-emoji { font-size: 64px; margin-bottom: 12px; }
  .res-pct { font-family: 'Fraunces', serif; font-size: 80px; font-weight: 900; line-height: 1; background: linear-gradient(135deg, #ff6eb4, #ffa94d); -webkit-background-clip: text; -webkit-text-fill-color: transparent; background-clip: text; }
  .res-label { font-family: 'Fraunces', serif; font-size: 22px; color: #aaa; margin-top: 8px; }
  .res-names { font-size: 14px; color: #666; margin-top: 10px; }
  .breakdown { width: 100%; display: flex; flex-direction: column; gap: 12px; }
  .breakdown h3 { font-family: 'Fraunces', serif; font-size: 20px; color: #888; }
  .row { background: #161619; border: 1px solid #252530; border-radius: 14px; padding: 16px; }
  .row.yes { border-color: rgba(255,110,180,.25); }
  .row-q { font-size: 13px; color: #777; margin-bottom: 10px; }
  .row-ans { display: flex; align-items: center; gap: 8px; flex-wrap: wrap; }
  .pill { background: #0c0c10; border-radius: 8px; padding: 5px 10px; font-size: 13px; flex: 1; min-width: 110px; }
  .dot { font-size: 16px; flex-shrink: 0; }
  .pending-card { background: #161619; border-radius: 16px; padding: 28px; text-align: center; color: #888; line-height: 1.7; width: 100%; }
`;
