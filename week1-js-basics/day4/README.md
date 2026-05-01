# 🧩 Basic JSON Parser in JavaScript

This is a **simple JSON parser built from scratch** using JavaScript.
It is designed for learning purposes — not a full replacement for `JSON.parse()`.

---

## 🚀 Features

* Parses:

  * Strings → `"hello"`
  * Numbers → `123`
  * Booleans → `true`, `false`
  * Null → `null`
  * Basic Objects → `{"key": "value"}`
  * Basic Arrays → `[1, 2, 3]`

---

## 📄 Code

```js
function parseJSON(input) {
  input = input.trim();

  // String
  if (input[0] === '"' && input[input.length - 1] === '"') {
    return input.slice(1, -1);
  }

  // Number
  if (!isNaN(input)) {
    return Number(input);
  }

  // Boolean
  if (input === "true") return true;
  if (input === "false") return false;

  // Null
  if (input === "null") return null;

  // Object (basic)
  if (input[0] === '{') {
    const obj = {};
    const content = input.slice(1, -1).trim();

    if (content === "") return obj;

    const pairs = content.split(',');

    for (let pair of pairs) {
      let [key, value] = pair.split(':');

      key = key.trim().slice(1, -1);
      value = parseJSON(value.trim());

      obj[key] = value;
    }

    return obj;
  }

  // Array (basic)
  if (input[0] === '[') {
    const content = input.slice(1, -1).trim();

    if (content === "") return [];

    return content.split(',').map(item => parseJSON(item.trim()));
  }
}
```

---

## ▶️ How to Run

1. Create a file:

   ```
   basicParser.js
   ```

2. Paste the code above

3. Add test cases:

   ```js
   console.log(parseJSON('"hello"'));
   console.log(parseJSON('123'));
   console.log(parseJSON('true'));
   console.log(parseJSON('{"name":"Busss","age":21}'));
   console.log(parseJSON('[1,2,3]'));
   ```

4. Run:

   ```bash
   node basicParser.js
   ```

---

## ⚠️ Limitations

This parser is **very basic** and will fail for:

* Nested objects
  `{"a": {"b": 1}}`

* Strings with commas
  `"hello,world"`

* Complex JSON structures

---

## 🎯 Purpose

This project helps you understand:

* Recursion
* String parsing
* How real parsers work internally

---

## 🔥 Next Steps

To improve this parser:

* Handle nested objects properly
* Build a tokenizer
* Add escape character support (`\n`, `\t`)
* Improve error handling

---

## 💡 Note

This is for **learning only**.
For real applications, always use:

```js
JSON.parse()
```
