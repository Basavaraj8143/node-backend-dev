# 🚀 WSL + Node.js Backend Setup (Development Environment)

## 📌 Overview

This document tracks the complete setup and initial backend development workflow using:

* Windows + WSL (Linux environment)
* Node.js + Express
* VS Code (WSL integration)

---

## 🧱 1. Environment Setup

### ✅ WSL Installation & Fixes

* Installed Ubuntu using WSL
* Verified WSL version:

  ```bash
  wsl -l -v
  ```
* Ensured WSL2 is active
* Enabled:

  * Virtualization (BIOS)
  * Virtual Machine Platform
  * WSL feature
* Fixed error:

  ```
  WSL_E_VM_MODE_INVALID_STATE
  ```

  by enabling hypervisor:

  ```bash
  bcdedit /set hypervisorlaunchtype auto
  ```

---

## 💻 2. Development Setup

### ✅ Open WSL

```bash
wsl
```

### ✅ Project Workspace

```bash
mkdir ~/projects
cd ~/projects
```

---

## ⚙️ 3. Node.js Setup

### Install Node.js (via NodeSource)

```bash
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt install -y nodejs
```

### Verify

```bash
node -v
npm -v
```

---

## 🔧 4. Essential Tools

```bash
sudo apt install -y git curl build-essential
```

---

## 🧠 5. VS Code Integration

* Installed VS Code
* Installed extension: **Remote - WSL**
* Open project from WSL:

  ```bash
  code .
  ```

---

## 📁 6. First Backend Project

### Initialize Project

```bash
mkdir backend-1
cd backend-1
npm init -y
```

### Install Express

```bash
npm install express
```

---

## 📂 7. Project Structure

```
backend-1/
│
├── src/
│   └── index.js
│
├── routes/
│   └── userRoutes.js
│
├── controllers/
│   └── userController.js
│
├── package.json
└── .gitignore
```

---

## 🧩 8. Backend Implementation

### `src/index.js`

```javascript
const express = require("express");
const userRoutes = require("../routes/userRoutes");

const app = express();

app.use(express.json());
app.use("/api/users", userRoutes);

app.listen(3000, () => console.log("Server running"));
```

---

### `routes/userRoutes.js`

```javascript
const express = require("express");
const router = express.Router();
const { getUsers, createUser } = require("../controllers/userController");

router.get("/", getUsers);
router.post("/", createUser);

module.exports = router;
```

---

### `controllers/userController.js`

```javascript
let users = [];

const getUsers = (req, res) => {
  res.json(users);
};

const createUser = (req, res) => {
  const user = req.body;
  users.push(user);
  res.json({ message: "User added", user });
};

module.exports = { getUsers, createUser };
```

---

## ▶️ 9. Run Server

```bash
node src/index.js
```

Visit:

```
http://localhost:3000/api/users
```

---

## 🔄 10. Workflow Upgrade

### Install Nodemon (local)

```bash
npm install nodemon --save-dev
```

### Update `package.json`

```json
"scripts": {
  "start": "node src/index.js",
  "dev": "nodemon src/index.js"
}
```

### Run

```bash
npm run dev
```

---

## 🧪 11. API Testing

### GET Users

```
GET /api/users
```

### POST User

```json
{
  "name": "Basava",
  "age": 21
}
```

---

## 🔐 12. Git Setup

```bash
git init
```

### `.gitignore`

```
node_modules
.env
```

```bash
git add .
git commit -m "initial backend setup"
```

---

## 🔁 13. Daily Workflow

```bash
wsl
cd ~/projects/backend-1
code .
npm run dev
```

---

## ⚠️ Key Learnings

* WSL2 requires virtualization + hypervisor
* Always work inside Linux paths (`/home/...`)
* Avoid global npm installs → use local dependencies
* Proper project structure matters
* Use nodemon for faster development

---

## 🚀 Next Steps

* Add validation
* Add error handling
* Connect database (MongoDB / MySQL)
* Build real-world APIs

---

## 🎯 Status

✅ Environment Ready
✅ Backend Running
🔜 Scaling to real projects
