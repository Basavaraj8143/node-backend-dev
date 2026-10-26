# Day 2 — API Fetcher (JavaScript)

## 🎯 Goal

Learn how to fetch data from an API using async/await and handle errors properly.

---

## 🔹 What I Practiced

### 1. Basic API Fetch

Used the Fetch API to get data from a public API.

```js
async function getPosts() {
  const res = await fetch("https://jsonplaceholder.typicode.com/posts");
  const data = await res.json();
  console.log(data);
}
```

---

### 2. Error Handling (try/catch)

```js
async function getPosts() {
  try {
    const res = await fetch("https://jsonplaceholder.typicode.com/posts");

    if (!res.ok) {
      throw new Error("HTTP error: " + res.status);
    }

    const data = await res.json();
    console.log(data.slice(0, 5));
  } catch (err) {
    console.error("Error:", err.message);
  }
}
```

---

### 3. Data Filtering

Displayed only useful data (titles instead of full JSON).

```js
const titles = data.map(post => post.title);
```

---

### 4. Retry Logic (Important Concept)

```js
async function fetchWithRetry(url, retries = 3) {
  for (let i = 0; i < retries; i++) {
    try {
      const res = await fetch(url);

      if (!res.ok) throw new Error("HTTP error");

      return await res.json();
    } catch (err) {
      console.log(`Retry ${i + 1} failed`);

      if (i === retries - 1) throw err;
    }
  }
}
```

---

### 5. CLI Input (Advanced)

```bash
node app.js https://jsonplaceholder.typicode.com/posts
```

Used process.argv to take URL input.

---

## 🧠 Key Learnings

* async/await makes async code look synchronous
* try/catch handles runtime + network errors
* res.ok is important for HTTP validation
* retry logic makes apps more reliable

---

## ⚔️ Mistakes to Avoid

* Forgetting await → returns Promise instead of data
* Ignoring errors → app crashes
* Logging full JSON blindly → messy output

---

## 🚀 Next Step

Combine API + file system:

* Fetch data
* Save to file
* Log results
