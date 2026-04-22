# 💞 BestMatch — Friend Compatibility Quiz

Answer 12 questions, share a code with a friend, and see your match percentage!

## How it works
1. **Person 1** opens the app → clicks "Create a Quiz" → answers all questions → gets a 6-letter code
2. **Person 1 shares the code** (or the link) with their friend
3. **Person 2** opens the app → enters the code → answers the same questions
4. Both see their **match % + full question breakdown**

---

## Local Development

```bash
# Install all dependencies
npm run install:all

# Run both backend + frontend together
npm run dev
```

- Backend runs on: http://localhost:3001  
- Frontend runs on: http://localhost:5173 (proxies API to backend)

---

## Deploy to Railway (Recommended — Free)

1. Push this repo to GitHub
2. Go to [railway.app](https://railway.app) → New Project → Deploy from GitHub
3. Select your repo
4. Set these in Railway **Variables**:
   ```
   PORT=3001
   NODE_ENV=production
   ```
5. Set the **Build Command**:
   ```
   npm run build
   ```
6. Set the **Start Command**:
   ```
   npm start
   ```
7. Done! Railway gives you a public URL to share 🎉

---

## Deploy to Render (Also Free)

1. Push to GitHub
2. Go to [render.com](https://render.com) → New Web Service
3. Connect your repo
4. Set:
   - **Build Command:** `npm run install:all && npm run build`
   - **Start Command:** `npm start`
   - **Environment:** Node
5. Deploy!

---

## Deploy to Fly.io

```bash
npm install -g flyctl
fly auth login
fly launch
fly deploy
```

---

## Project Structure

```
bestmatch/
├── server/
│   └── index.js       # Express API + SQLite database
├── client/
│   ├── src/
│   │   ├── main.jsx
│   │   └── App.jsx    # Full React frontend
│   ├── index.html
│   └── vite.config.js
├── package.json
└── README.md
```

## Tech Stack
- **Backend:** Node.js, Express, better-sqlite3
- **Frontend:** React, Vite
- **Database:** SQLite (file-based, zero config, persists on disk)
- **Styling:** Pure CSS (no dependencies)
