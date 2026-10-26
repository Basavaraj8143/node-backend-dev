const log = require('./simple-logger');

(async () => {
  await log("INFO", "App started");
  await log("ERROR", "Database failed");
})();