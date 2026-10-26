# 🔵 PHASE 2 — CORE BACKEND (Weeks 7–14)

## 🎯 Goal

By the end of this phase, you should be able to:

- Build a complete backend system
- Handle auth, caching, async work
- Write code like someone who understands backend — not just uses it

Reference aligned from your roadmap — but adapted for you.

---

## 🧱 Stack (same — don't change)

- Runtime → Node.js
- Framework → Express.js
- DB → PostgreSQL
- Cache → Redis

---

## ⚠️ Rules for Phase 2

- No switching frameworks
- No MongoDB distraction
- Build everything yourself once
- Understand WHY, not just HOW

---

## 📅 WEEK 7–8 → Express + REST (clean backend)

### 🎯 Focus:
Stop writing messy APIs. Start writing structured backend

### 🔹 Topics

- Express routing
- Middleware (core concept)
- Request validation
- Error handling (centralized)

### 🛠️ Build

Create API:

```
/users
  GET
  POST
  DELETE
```

Add structure:

```
src/
 ├── routes/
 ├── controllers/
 ├── services/
 ├── middleware/
```

### ✅ Outcome

- ✔ You understand request flow
- ✔ You don't mix logic everywhere

---

## 📅 WEEK 9–10 → Database Design + Redis

### 🎯 Focus:
Write DB logic that doesn't break

### 🔹 Topics (PostgreSQL)

- Normalization basics
- Index (when to use)
- Avoid N+1 queries
- Transactions (basic idea)

### 🔹 Redis

- What caching is
- TTL
- When NOT to cache

### 🛠️ Build

- Add caching to your API
- Example:
  - Cache user list
  - Invalidate on update

### ✅ Outcome

- ✔ You reduce DB load
- ✔ You understand performance basics

---

## 📅 WEEK 11–12 → Authentication (CRITICAL)

### 🎯 Focus:
Build auth properly (not copy-paste)

### 🔹 Topics

- Password hashing (bcrypt)
- JWT (access + refresh tokens)
- Sessions (basic understanding)
- Security basics

### 🛠️ Build

- Signup
- Login
- Protected routes

### ⚠️ Mistakes to avoid

- ❌ Storing plain passwords
- ❌ Copying JWT code blindly

### ✅ Outcome

- ✔ You can build real login systems

---

## 📅 WEEK 13–14 → Async + Background Jobs

### 🎯 Focus:
Handle work outside request-response cycle

### 🔹 Topics

- Event loop (must understand)
- Async flow in Node
- Queues (basic)

### 🛠️ Build

Example:

- Email sender (fake or real)
- Background job (not blocking API)

Tools (simple start):

- Redis queue OR basic job simulation

### ✅ Outcome

- ✔ You understand scalable backend flow

---

## 🚀 PHASE 2 FINAL PROJECT (IMPORTANT)

### 👉 Full Backend System

Build ONE solid project combining everything:

**Features:**

- Auth (login/signup)
- PostgreSQL DB
- Redis caching
- Background job (email/logging)
- Clean API structure

### 📁 GitHub Structure

```
phase-2/
 ├── full-backend-system/
 ├── README.md
```

### 🧾 README must include:

- Architecture (very important)
- API endpoints
- How caching works
- How auth works
- What problems you faced

---

## 📊 DAILY ROUTINE (same discipline)

- 2–3 hrs → Backend
- 2 hrs → DSA
- 1 hr → Aptitude
