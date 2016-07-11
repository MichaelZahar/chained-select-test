/* eslint-disable no-console */
const fetch = require('node-fetch');
const cheerio = require('cheerio');
const co = require('co');
const fs = require('fs');
const path = require('path');

/**
 * Адрес файла со список марок, моделей и опций
 * @const
 * @type {string}
 * @default
 */
const OUTPUT_JSON = path.resolve(__dirname, '../data/marks.json');

/**
 * Адрес файла со список марок, моделей и опций
 * @const
 * @type {string}
 * @default
 */
const OUTPUT_JS = path.resolve(__dirname, '../src/client/js/constants/marks.js');

/**
 * Анрес источника их которого будем получать данные
 * @const
 * @type {string}
 * @default
 */
const SOURCE = 'http://www.exist.ru';

/**
 * Страница с каталогом марок
 * @const
 * @type {string}
 * @default
 */
const MARKS = SOURCE + '/cat/TecDoc';

/**
 * В текущем источнике у разных марок и разных моделей
 * различается представление данные. Таблица с опциями
 * может содержать разное кол-во столбцов, но столбцы всегда
 * имеют одинаковые назания. С помощь/ этого признака будем
 * извлекать нужную информацию.
 *
 * Название столбца, в котором хранится тип двигателя.
 *
 * @const
 * @type {string}
 * @default
 */
const TYPE_FIELD_TITLE = 'Тип двиг.';

/**
 * Название столбца, в котором хранится объем двигателя
 *
 * @const
 * @type {string}
 * @default
 */
const VOLUME_TITLE = 'Объем двиг. л';

/**
 * Несколько вариантов userAgent, на случай
 * если сервер проверяет его наличие
 *
 * @const
 * @type {string}
 * @default
 */
const USER_AGENTS = [
  'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_11_5) AppleWebKit/601.6.17 (KHTML, like Gecko) Version/9.1.1 Safari/601.6.17',
  'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_11_5) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/51.0.2704.103 Safari/537.36',
  'Mozilla/5.0 (Macintosh; Intel Mac OS X 10.11; rv:47.0) Gecko/20100101 Firefox/47.0',
  'Mozilla/5.0 (Windows NT 6.3; Win64, x64; Trident/7.0; rv:11.0) like Gecko'
];

/**
 * `человеческий` header для запроса html страниц
 * (на случай примитивной хащиты от парсинга)
 *
 * @const
 * @type {string}
 * @default
 */
const HEADERS = {
  'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
  'Accept-Encoding': 'gzip, deflate, sdch',
  'Accept-Language': 'en-US,en;q=0.8,ru;q=0.6',
  'Cache-Control': 'no-cache',
  'Connection': 'keep-alive',
  'Cookie': '',
  'Host': 'www.exist.ru',
  'Pragma': 'no-cache',
  'Upgrade-Insecure-Requests': 1
};

/**
 * Возвращает headers для запроса
 * @function
 * @return {Object}
 */
const getHeader = () => {
  const userAgent = USER_AGENTS[Math.round(Math.random() * (USER_AGENTS.length - 1))];

  return Object.assign({ 'User-Agent': userAgent }, HEADERS);
};

/**
 * Список опций
 * @typedef {Object.<string, string[]>} Options
 */

/**
 * @typedef {Object} Model
 * @prop {string} model название модели
 * @prop {string} link ссылка на страницу со списком опций данной модели
 * @prop {Otions} engines список опций двигателя (объем и тип)
 */

/**
 * @typedef {Object} Mark
 * @prop {string} mark название марки
 * @prop {string} link ссылка на страницу со списком моделей марки
 * @prop {Model[]} [models] список данных о моделях
 */

/**
 * Возвращает список марок
 * @param {string} page html страница для парсинга
 * @return {Mark[]} список марок
 */
const parseMarks = (page) => {
  const $ = cheerio.load(page);
  const result = [];

  $('#bmVendorTypesC0 .catalog-column a').each((i, el) => {
    const $el = $(el);
    result.push({ mark: $el.text(), link: $el.attr('href') });
  });

  return result;
};

/**
 * Возвращает список моделей
 * @param {string} page html страница для парсинга
 * @return {Model[]} список моделей
 */
const parseModels = (page) => {
  const $ = cheerio.load(page);
  const result = [];

  $('#models dd a').each((i, el) => {
    const $el = $(el);
    result.push({ model: $el.text(), link: $el.attr('href') });
  });

  return result;
};

/**
 * Возвращает индексы колонок с объемом и типом двигателя
 *
 * @function
 * @param {Object} $ cheerio представление html страницы
 * @param {Object} tr cheerio представление заголовка таблицы
 * @return {{ volumeIndex: number, typeIndex: number }}
 */
const findFieldsIndexes = ($, tr) => {
  let volumeIndex = -1;
  let typeIndex = -1;

  tr.find('th').each((i, el) => {
    const text = $(el).text();

    if (text === TYPE_FIELD_TITLE) {
      typeIndex = i;
    }

    if (text === VOLUME_TITLE) {
      volumeIndex = i;
    }
  });

  return { volumeIndex, typeIndex };
};

/**
 * Возвращает опции двигателя для модели
 *
 * ! Парсер упрощен, он не учитывает различные модификации
 * двигателя и собирает информацию только об объеме и типе (бензин, дизель)
 *
 * @function
 * @param {string} page html страница для парсинга
 * @return {Options}
 */
const parseEngines = (page) => {
  const $ = cheerio.load(page);
  const result = {};
  let volumeIndex;
  let typeIndex;

  $('.tbl tr').each((i, el) => {
    const tr = $(el);
    const isHeader = tr.attr('class') === 'trh';

    if (isHeader) {
      let indexes = findFieldsIndexes($, tr);
      volumeIndex = indexes.volumeIndex;
      typeIndex = indexes.typeIndex;
      return;
    }

    const volume = tr.children().eq(volumeIndex).text();
    const withoutOptions = typeIndex === -1;

    if (withoutOptions) {
      result[volume] = [];
      return;
    }

    const type = tr.children().eq(typeIndex).text();
    let options = result[volume];

    if (!options) {
      options = result[volume] = [];
    }

    if (options.indexOf(type) === -1) {
      options.push(type);
    }
  });

  return result;
};

/**
 * @function
 * @param {string} url адрес загружаемого файла
 * @return {Promise}
 */
function* loadFile(url) {
  return new Promise((resolve) => {
    fs.readFile(url, 'utf8', (err, text) => {
      if (err) {
        resolve();
        return console.log(`File ${url} not exists`);
      }

      try {
        resolve(JSON.parse(text));
      } catch (error) {
        console.log(error);
        resolve();
      }
    });
  });
}

/**
 * @function
 * @param {string} url по которому сохраняется файл
 * @param {string} file
 * @return {Promise}
 */
function* saveFile(url, file) {
  return new Promise((resolve, reject) => {
    fs.writeFile(url, file, 'utf8', (error) => {
      if (error) {
        reject(error);
        return console.log(error);
      }

      resolve(true);
    });
  });
}

/**
 * Запрашивает страницу по указанному адресу и возвращает ответ
 * @function
 * @param {string} url адрес запрашиваемой страницы
 * @return {Promise}
 */
function* getPage(url) {
  console.log(`Load ${url}`);
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      fetch(url, { method: 'GET', headers: getHeader() })
        .then((res) => res.text())
        .then(resolve).catch((err) => {
          console.log(err);
          reject(err);
        });
    }, 5000 * Math.random());
  });
}

/**
 * Парсит данные о марках и моделях автомобилей на сайте http://exist.ru/
 * Сохраняет результат в файл, поддреживает продолжение парсинга после
 * остановки скрипта.
 *
 * @function
 */
function* loadCarData() {
  let marks = yield loadFile(OUTPUT_JSON);

  if (!marks) {
    const marksPage = yield getPage(MARKS);
    marks = parseMarks(marksPage);
  }

  for (let mark of marks) {
    if (!mark.models) {
      let markPage = yield getPage(SOURCE + mark.link);
      mark.models = parseModels(markPage);

      for (let model of mark.models) {
        let modelPage = yield getPage(SOURCE + model.link);
        model.engines = parseEngines(modelPage);
      }

      console.log(mark.mark, JSON.stringify(mark));
      yield saveFile(OUTPUT_JSON, JSON.stringify(marks, null, 2));
    }
  }

  // Получаем `чистые` данные без ссылок и опций
  // без эелементов/из одного элемента
  const data = marks.map((mark) => {
    delete mark.link;

    mark.models.forEach((model) => {
      delete model.link;

      const engines = [];

      for (let option in model.engines) {
        engines.push({ volume: option, types: model.engines[option] });
      }

      model.engines = engines;
    });

    return mark;
  });

  yield saveFile(OUTPUT_JS, `export const MARKS = ${JSON.stringify(data, null, 2)};`);
}

function parse() {
  co(loadCarData).catch((err) => {
    console.log(err, '\nretry after 30 sec...');

    setTimeout(parse, 30000);
  });
}

parse();
