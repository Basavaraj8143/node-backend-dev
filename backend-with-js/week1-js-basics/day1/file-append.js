const fs = require('fs/promises');

async function run() {
  try {
    await fs.appendFile('test-data.txt', '\nAdded new line', 'utf8');
    console.log('Content appended');

    const data = await fs.readFile('test-data.txt', 'utf8');
    console.log(data);

  } catch (err) {
    console.error(err);
  }
}

run();