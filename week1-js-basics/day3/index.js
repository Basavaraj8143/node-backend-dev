function safeParse(jsonString) {
  try {
    return JSON.parse(jsonString);
  } catch (err) {
    console.log("Invalid JSON:", err.message);
    return null;
  }
}

const result = safeParse('{"name":"Busss"}');
console.log(result);