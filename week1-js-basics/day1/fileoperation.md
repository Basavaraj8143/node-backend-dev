# 📘 Day 1 – Node.js File System (fs/promises)

## ✅ What I Learned

* How to **read**, **write**, and **append** files using Node.js
* Using **async/await** with `fs/promises`
* Basic **error handling** with try-catch

---

## 📂 Importing fs (Promise-based)

```js
const fs = require('fs/promises');
```

* Gives async functions (returns promises)
* Cleaner than callback-based `fs`

---

## 📖 1. Read File

```js
const data = await fs.readFile('file.txt', 'utf8');
console.log(data);
```

### Key Points:

* `'utf8'` → converts buffer → readable string
* Returns file content

---

## ✏️ 2. Write File (Overwrite)

```js
await fs.writeFile('file.txt', 'Hello World', 'utf8');
```

### Behavior:

* File exists → overwritten
* File doesn’t exist → created

---

## ➕ 3. Append File

```js
await fs.appendFile('file.txt', '\nNew Line', 'utf8');
```

### Behavior:

* Adds content at end
* Does NOT remove old data

---

## 🧠 Real File Editing (Important)

Node.js cannot directly edit specific parts of a file.

### Process:

1. Read file
2. Modify data
3. Write back

```js
let data = await fs.readFile('file.txt', 'utf8');
data = data.replace('old', 'new');
await fs.writeFile('file.txt', data);
```

---

## ⚠️ Common Mistakes

### ❌ Using await outside async

```js
const data = await fs.readFile(...) // ERROR
```

### ✅ Fix

```js
async function main() {
  const data = await fs.readFile(...);
}
```

---

### ❌ Not waiting for async operations

```js
appendFile();
readFile(); // may run before append finishes
```

### ✅ Fix

```js
await appendFile();
await readFile();
```

---

### ❌ Forgetting encoding

```js
await fs.readFile('file.txt'); // returns Buffer
```

### ✅ Fix

```js
await fs.readFile('file.txt', 'utf8');
```

---

## 🔥 Key Takeaways

* `readFile` → read data
* `writeFile` → overwrite
* `appendFile` → add data
* No direct "edit" → always read + modify + write
* Always use `await` properly

---

## 🎯 Mini Practice

1. Create a file and write your name
2. Append your goal
3. Read and print it

---

## 🚀 Next Step (Day 2 Idea)

* Working with JSON files
* Parsing and storing structured data

---
