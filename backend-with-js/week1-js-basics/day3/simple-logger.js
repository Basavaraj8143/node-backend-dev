const fs = require('fs').promises;

async function log(level, message) {
  const time = new Date().toISOString();
  const logMessage = `[${level}] ${time} - ${message}\n`;

  try {
    await fs.appendFile('app.log', logMessage);
  } catch (err) {
    console.error("Logging failed:", err);
  }
}

module.exports = log;

/*const fs = require('fs');

function log(message) {
  const time = new Date().toISOString();
  const logMessage = `[INFO] ${time} - ${message}\n`;

  fs.appendFile('app.log', logMessage, (err) => {
    if (err) {
      console.error("Failed to write log:", err);
    }
  });
}

module.exports = log;
*/