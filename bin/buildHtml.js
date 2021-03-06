/**
 * This script copies src/index.html into build/index.html
 * This is a good example of using Node and cheerio to do a simple file transformation.
 * It might be useful when we only want to do smth. specific in the built production code.
 */

/* eslint-disable no-console */

const fs = require('fs');
const cheerio = require('cheerio');

fs.readFile('src/client/index.html', 'utf8', (err, markup) => {
  if (err) {
    return console.log(err);
  }

  const $ = cheerio.load(markup);

  // Since a separate spreadsheet is only utilized for the production build, need to dynamically add this here.
  $('head').append('<link rel="stylesheet" href="/css/app.css">');

  fs.writeFile('build/index.html', $.html(), 'utf8', function handler(error) {
    if (error) {
      return console.log(error);
    }
  });

  console.log('index.html written to /build'.green);
});
