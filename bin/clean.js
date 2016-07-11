const rimraf = require('rimraf');
const path = require('path');
const fs = require('fs');

const dir = path.resolve(__dirname, '../build');

rimraf(dir, function handler(err) {
  if (err) {
    throw err;
  }

  if (process.argv.indexOf('createdir') >= 0) {
    fs.mkdirSync(dir);
  }
});
