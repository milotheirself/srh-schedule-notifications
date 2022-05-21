import { default as puppeteer } from 'puppeteer';
import { default as nodeFiles } from 'fs/promises';
import { default as nodePaths } from 'path';
import { default as nodeCrypto } from 'crypto';

const fragment = {};
const internal = {};

// ?
fragment.requestSchedule = async () => {
  // ? fetch injection scripts
  internal.inject = {
    'inject-plans': await nodeFiles.readFile(`lib/module/schedule-query/inject/request-inject-plans.js`, { encoding: 'utf8' }),
    'inject-tasks': await nodeFiles.readFile(`lib/module/schedule-query/inject/request-inject-tasks.js`, { encoding: 'utf8' }),
    'inject-table': await nodeFiles.readFile(`lib/module/schedule-query/inject/request-inject-table.js`, { encoding: 'utf8' }),
  };

  // ? initialize folders
  await nodeFiles
    .access('result/debug')
    .then(async () => await nodeFiles.rm('result/debug', { recursive: true }))
    .catch(() => false);

  await nodeFiles
    .access('result/image')
    .then(async () => await nodeFiles.rm('result/image', { recursive: true }))
    .catch(() => false);

  await nodeFiles.mkdir('result/debug', { recursive: true });
  await nodeFiles.mkdir('result/image', { recursive: true });

  // ? fetch current schedule
  const weeks = await internal.fetchWeeks();
  const tasks = await internal.fetchTasks({ urn: weeks.urn });

  return tasks;
};

internal.fetchWeeks = () => {
  return new Promise(async (resolve) => {
    const browser = await puppeteer.launch();
    const page = await browser.newPage();

    page.on('load', () => {
      console.log(`+ `, `goto  ${page.url()}`);

      setTimeout(async () => {
        await page.screenshot({ path: `./result/debug/${Date.now()}.png` });

        // + login
        if (page.url().toLowerCase().indexOf('login') != -1) {
          await page.type('input[name="txtUser"]', `${process.env.DSB_ID}`);
          await page.type('input[name="txtPass"]', `${process.env.DSB_PA}`);
          await page.click('input[type="submit"]');

          return;
        }

        // + query current schedules
        if (page.url().toLowerCase().indexOf('default') != -1) {
          const weeks = await page.evaluate(internal.inject['inject-plans']);

          resolve({ urn: Object.values(Object.values(weeks)[0].element)[0].source.urn });

          await browser.close();
        }
      }, 1000);
    });

    page //
      .goto('https://dsbmobile.de', { waitUntil: 'load', timeout: 20000 })
      .catch((err) => {
        console.error(err);
        resolve({ invalid: true });
      });
  });
};

internal.fetchTasks = async ({ urn }) => {
  const browser = await puppeteer.launch();
  const page = await browser.newPage();

  const result = {};

  // ?
  await page.goto(urn, { waitUntil: 'load', timeout: 20000 });
  await page.screenshot({ path: `./result/debug/${Date.now()}.png` });
  console.log(`+ `, `goto  ${page.url()}`);

  // ?
  const { weeks, tasks } = await page.evaluate(internal.inject['inject-tasks']);

  for (const wee of weeks) {
    result[wee] = {};

    // ?
    for (const tas of tasks) {
      // if (tas != '3211') continue;

      const t = `0000${tasks.indexOf(tas) + 1}`.slice(-5);
      const tasUrn = urn.replace('/index.html', `/${wee}/c/c${t}.htm`);

      result[wee][tas] = await internal.fetchTable({ page, urn: tasUrn, wee, tas });
    }
  }

  await browser.close();
  return result;
};

internal.fetchTable = async ({ page, urn, wee, tas }) => {
  // ? load table
  await page.goto(urn, { waitUntil: 'load', timeout: 20000 });
  await page.setViewport({ width: 1920, height: 1920, deviceScaleFactor: 2 });
  console.log(`+ `, `goto  ${page.url()}`);

  // ? stylize and get the width and height of the viewport
  const { wid, hei } = await page.evaluate(internal.inject['inject-table']);

  // ? capture table
  await page.setViewport({ width: wid, height: hei, deviceScaleFactor: 2 });
  await page.screenshot({ path: `./result/image/${wee}-${tas}.png` });

  // ?

  const hashSum = nodeCrypto.createHash('sha256');
  hashSum.update(await nodeFiles.readFile(`./result/image/${wee}-${tas}.png`));
  const hash = hashSum.digest('hex');

  // const img = await nodeFiles.readFile(`./result/image/${wee}-${tas}.png`, { encoding: 'base64' });
  // const imgUrn = `data:image/png;base64,${img}`;

  return {
    hash,
    week: wee,
    task: tas,
    // result: { urn: imgUrn },
    result: { urn: `./result/image/${wee}-${tas}.png` },
    source: { urn },
  };
};

export default { ...fragment };
