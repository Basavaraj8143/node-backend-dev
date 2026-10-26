# 🔵 PHASE 1 FOUNDATION (Weeks 1–6)

## 🎯 Goal

By the end of this phase, you should be able to:

- Build a backend without copying tutorials
- Understand HTTP flow clearly
- Store & retrieve data from DB
- Push a real project to GitHub

---

## 🧱 Tech Stack (locked)

| Layer | Tool |
|-------|------|
| Runtime | Node.js |
| Database | PostgreSQL |
| Tools | Git, Postman, Linux terminal |

---

## ⚠️ Rules (follow strictly)

- No long YouTube courses
- Build while learning
- Push code **DAILY**
- Don't skip raw HTTP server

---

## 📅 WEEK 1–2 → JavaScript + Core Thinking

### 🎯 Focus
Become comfortable writing JS without thinking.

### 🔹 Topics to Learn

- Variables (`let`, `const`)
- Functions (normal + arrow)
- Arrays & Objects
- Loops
- Error handling (`try/catch`)

### 🔥 MOST IMPORTANT

- `async/await`
- Promises

### 🛠️ What to BUILD

> Do NOT just read. Build these:

- **File reader** — read/write file
- **API fetcher** — call public API
- **Simple logger** — write logs to file
- **JSON parser tool**

### 📁 GitHub Structure

```
phase-1/
 ├── week-1-js-basics/
 ├── week-2-async/
```

### ✅ Outcome Check

If you can:
- Write async code without Google
- Handle errors properly

👉 **Move ahead.** Otherwise repeat.

---

## 📅 WEEK 3–4 → HTTP + Raw Backend

### 🎯 Focus
Understand how backend ACTUALLY works.

### 🔹 Topics

- HTTP request/response
- Methods (`GET`, `POST`)
- Headers
- Status codes (basic)

### 🛠️ Build (IMPORTANT)

Use Node core — **NO Express**:

```js
const http = require('http');

http.createServer((req, res) => {
  if (req.url === "/") {
    res.end("Home");
  }
}).listen(3000);
```

Extend it:
- Add routes (`/about`, `/api`)
- Return JSON
- Handle POST data

### 🧠 Also Learn — Linux Basics

- `ls`, `cd`, `mkdir`
- File permissions
- `curl` commands

### 📁 GitHub Structure

```
phase-1/
 ├── week-3-http-server/
 ├── week-4-linux/
```

### ✅ Outcome Check

If you can:
- Explain request flow
- Build a basic server

👉 **You're ahead of most students.**

---

## 📅 WEEK 5–6 → Database + Git

### 🎯 Focus
Store real data — this is backend core.

### 🔹 Database (PostgreSQL)

Learn:
- `CREATE TABLE`
- `INSERT`, `SELECT`
- `JOIN`
- `INDEX` (basic idea)

### 🛠️ Build

- Connect Node → PostgreSQL
- Create table: `URLs`
- Store data
- Fetch data

### 🔹 Git (important)

Learn:
- `branch`
- `merge`
- Resolving conflicts

### 📁 GitHub Structure

```
phase-1/
 ├── week-5-db/
 ├── week-6-integration/
```

---

## 🚀 PHASE 1 FINAL PROJECT (MANDATORY)

### 👉 URL Shortener

**Features:**
- Create short URL
- Redirect to original
- Store in DB
- Track clicks

### 📁 Final Structure

```
phase-1/
 ├── url-shortener/
 ├── README.md
```

### 🧾 README should include

- What you built
- Tech used
- How to run
- What you learned

---

## 📊 DAILY ROUTINE (don't ignore)

| Block | Hours | Focus |
|-------|-------|-------|
| 🖥️ Backend | 2–3 hrs | Build & learn |
| 🧠 DSA | 2 hrs | Problem solving |
| 📐 Aptitude | 1 hr | Practice |
