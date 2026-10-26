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

  // Object (VERY basic)
  if (input[0] === '{') {
    const obj = {};
    const content = input.slice(1, -1).trim();

    if (content === "") return obj;

    const pairs = content.split(',');

    for (let pair of pairs) {
      let [key, value] = pair.split(':');

      key = key.trim().slice(1, -1); // remove quotes
      value = parseJSON(value.trim());

      obj[key] = value;
    }

    return obj;
  }


  if (input[0] === '[') {
    const content = input.slice(1, -1).trim();
    if (content === "") return [];
    return content.split(',').map(item => parseJSON(item.trim()));
  }
}


// ===== TEST =====
console.log(parseJSON('"hello"'));
console.log(parseJSON('123'));
console.log(parseJSON('true'));
console.log(parseJSON('{"name":"Busss","age":21}'));
console.log(parseJSON('[1,2,3]'));