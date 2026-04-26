# 📝 Simple Logger (Node.js)

## 📌 What this project is

A basic logging utility built using Node.js that writes logs to files with timestamps and log levels.

This project helps understand:

* File handling (`fs`)
* Async operations (`async/await`)
* Error handling
* Modular code structure

---

## ⚙️ Tech Used

* Node.js
* Built-in `fs` module (no external libraries)

---

## 🚀 Features

* Log messages with levels:

  * `INFO`
  * `ERROR`
  * `DEBUG`
* Timestamped logs
* Writes logs to file
* Async logging using promises
* Error-safe logging system

---

## 📁 Project Structure

```
logger/
├── logger.js     # Core logging logic
├── app.js        # Test file to use logger
├── app.log       # Generated log file
```

---

## 🧠 How it works

* `logger.js` exports a function
* It takes:

  * log level
  * message
* Adds timestamp
* Writes to file using `fs.appendFile`

---

## ▶️ How to run

1. Clone the repo or download files

2. Go to project folder:

```
cd logger
```

3. Run the app:

```
node app.js
```

4. Check generated logs:

```
app.log
```

---

## 🧪 Example Usage

```js
const log = require('./logger');

(async () => {
  await log("INFO", "App started");
  await log("ERROR", "Something went wrong");
})();
```

---

## 📚 What I learned

* How Node.js handles file operations
* Difference between sync and async operations
* How to structure small backend utilities
* Handling errors in async code

---

## ⚠️ Limitations

* Not optimized for high concurrency
* No log rotation
* No external config support

---

## 🚧 Future Improvements

* Separate log files (info.log, error.log)
* JSON-based structured logging
* Log rotation system
* CLI support

---

## 💡 Why this matters

Logging is a core part of backend systems. Every real-world app needs proper logging for debugging and monitoring.

This is a foundational step toward building production-grade systems.

---
