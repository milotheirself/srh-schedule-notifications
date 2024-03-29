import { default as puppeteer } from 'puppeteer';
import { default as nodeFiles } from 'fs/promises';
import { default as nodeCrypto } from 'crypto';

const fragment = {};
const internal = {};
const external = globalThis.nodeExternal || (globalThis.nodeExternal = {});

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
  try {
    const weeks = await internal.fetchWeeks();
    const tasks = await internal.fetchTasks({ urn: weeks.urn });
    return tasks;
  } catch (error) {
    return null;
  }
};

internal.fetchWeeks = async () => {
  return new Promise(async (resolve) => {
    const browser = await puppeteer.launch();
    const page = await browser.newPage();

    page.on('load', async () => {
      console.log(`+ `, `goto ${page.url()}`);

      await new Promise((res) => setTimeout(res, 300));
      await page.screenshot({ path: `./result/debug/${Date.now()}.png` });

      // + timeout page was reached
      if (page.url().toLowerCase().indexOf('chrome') != -1) {
        resolve(null);
        return;
      }

      // + login
      if (page.url().toLowerCase().indexOf('login') != -1) {
        await page.type('input[name="txtUser"]', `${external.options.request.name}`);
        await page.type('input[name="txtPass"]', `${external.options.request.pass}`);
        await page.click('input[type="submit"]');

        return;
      }

      // + query current schedules
      if (page.url().toLowerCase().indexOf('default') != -1) {
        const weeks = await page.evaluate(internal.inject['inject-plans']);

        resolve({ urn: internal.previus != weeks.urn ? weeks.urn : null });

        internal.previus = weeks.urn;
        await browser.close();
        return;
      }

      await browser.close();
    });

    await page.setRequestInterception(true);
    page.on('request', (req) => {
      if (
        req.resourceType() == 'stylesheet' || //
        req.resourceType() == 'image'
      ) {
        req.abort();
      } else {
        req.continue();
      }
    });

    page //
      .goto('https://dsbmobile.de', { waitUntil: 'load', timeout: 20000 })
      .catch(async (err) => {
        console.error(err);

        await browser.close().catch((err) => console.error);

        resolve(null);
      });
  });
};

internal.fetchTasks = async ({ urn }) => {
  if (!urn) return null;

  const browser = await puppeteer.launch();
  const page = await browser.newPage();

  const result = {};

  // ?
  await page.goto(urn, { waitUntil: 'load', timeout: 20000 });
  await page.screenshot({ path: `./result/debug/${Date.now()}.png` });
  console.log(`+ `, `goto ${page.url()}`);

  // ?
  const { weeks, tasks } = await page.evaluate(internal.inject['inject-tasks']);

  for (const wee of weeks) {
    result[wee] = {};

    // ?
    for (const tas of tasks) {
      if (!(tas in external.options.publish.target)) continue;

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
  console.log(`+ `, `goto ${page.url()}`);

  // ? stylize and get the width and height of the viewport
  const { wid, hei, val } = await page.evaluate(internal.inject['inject-table']);

  // ? capture table
  await page.setViewport({ width: wid, height: hei, deviceScaleFactor: 2 });
  await page.screenshot({ path: `./result/image/${wee}-${tas}.png` });

  // ?
  const hashSum = nodeCrypto.createHash('sha256');
  hashSum.update(val);
  const hash = hashSum.digest('hex');

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
