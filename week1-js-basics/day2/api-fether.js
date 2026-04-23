async function getPosts() {
  const res = await fetch("https://jsonplaceholder.typicode.com/posts");
  const data = await res.json();
  console.log(data);
}

getPosts();

/*
async function getPosts() {
  try {
    const res = await fetch("https://jsonplaceholder.typicode.com/posts");

    if (!res.ok) {
      throw new Error("HTTP error: " + res.status);
    }

    const data = await res.json();
    console.log(data.slice(0, 5)); // show first 5
  } catch (err) {
    console.error("Error:", err.message);
  }
}

getPosts();
*/
/*
async function getPosts() {
  try {
    const res = await fetch("https://jsonplaceholder.typicode.com/posts");
    const data = await res.json();

    const titles = data.map(post => post.title);

    console.log("Titles:");
    titles.slice(0, 5).forEach(t => console.log("- " + t));
  } catch (err) {
    console.error(err.message);
  }
}

getPosts();
*/
/*
async function fetchWithRetry(url, retries = 3) {
  for (let i = 0; i < retries; i++) {
    try {
      const res = await fetch(url);

      if (!res.ok) throw new Error("HTTP error");

      return await res.json();
    } catch (err) {
      console.log(`Retry ${i + 1} failed`);

      if (i === retries - 1) {
        throw err;
      }
    }
  }
}
async function main() {
  try {
    const data = await fetchWithRetry("https://jsonplaceholder.typicode.com/osts");
    console.log(data.length);
  } catch (err) {
    console.error("Final failure:", err.message);
  }
}

main();
*/