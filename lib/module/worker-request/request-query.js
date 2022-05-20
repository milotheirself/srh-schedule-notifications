import { default as puppeteer } from 'puppeteer';
import { default as nodeFiles } from 'fs';
import { default as nodePaths } from 'path';
import { default as nodeCrypto } from 'crypto';

const fragment = {};
const internal = {};

// +
internal.urn = {
  injectPlans: () => `lib/module/worker-request-inject/request-inject-plans.js`,
  injectTasks: () => `lib/module/worker-request-inject/request-inject-tasks.js`,
  injectTable: () => `lib/module/worker-request-inject/request-inject-table.js`,
};

fragment.requestSchedule = async () => {
  const debug = nodePaths.resolve('./result/debug/');

  if (nodeFiles.existsSync(debug)) nodeFiles.rmSync(debug, { recursive: true });
  nodeFiles.mkdirSync(debug, { recursive: true });

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
          const inj = nodeFiles.readFileSync(internal.urn.injectPlans(), { encoding: 'utf8' });
          const weeks = await page.evaluate(inj);

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

internal.fetchTasks = ({ urn }) => {
  return new Promise(async (resolve) => {
    const browser = await puppeteer.launch();
    const page = await browser.newPage();

    console.log(urn);

    const result = {};

    const inv = false;

    // ?
    await page
      .goto(urn, {
        waitUntil: 'load',
        timeout: 20000,
      })
      .catch((err) => {
        console.error(err);
        inv = true;
      });
    await page.screenshot({ path: `./result/debug/${Date.now()}.png` });
    console.log(`+ `, `goto  ${page.url()}`);

    // ?
    if (inv) return { invalid: true };

    // ?
    const inj = nodeFiles.readFileSync(internal.urn.injectTasks(), { encoding: 'utf8' });
    const { weeks, tasks } = await page.evaluate(inj);

    // ?
    for (const wee of weeks) {
      result[wee] = {};

      // ?
      const debug = nodePaths.resolve(`./result/${wee}/`);
      if (nodeFiles.existsSync(debug)) nodeFiles.rmSync(debug, { recursive: true });
      nodeFiles.mkdirSync(debug, { recursive: true });

      // ?
      for (const tas of tasks) {
        // if (!['2312', '2412'].includes(tas)) continue;
        // if (!['2311'].includes(tas)) continue;

        const t = `0000${tasks.indexOf(tas) + 1}`.slice(-5);
        const l = urn.replace('/index.html', `/${wee}/c/c${t}.htm`);

        result[wee][tas] = await internal.fetchTable({ page, urn: l, wee, tas });
        // console.log(result[wee][tas]);
      }
    }

    resolve({ invalid: inv, ...result });
    await browser.close();
  });
};

internal.fetchTable = async ({ page, urn, wee, tas }) => {
  // ? load table
  await page.goto(urn, { waitUntil: 'load', timeout: 20000 });
  console.log(`+ `, `goto  ${page.url()}`);

  // ? stylize and get the width and height of the viewport
  const inj = nodeFiles.readFileSync(internal.urn.injectTable(), { encoding: 'utf8' });
  const { wid, hei } = await page.evaluate(inj);

  // ? capture table
  await page.setViewport({ width: wid, height: hei, deviceScaleFactor: 2 });
  await page.screenshot({ path: `./result/${wee}/${tas}.png` });

  return {
    week: wee,
    task: tas,
    result: { urn: `./result/${wee}/${tas}.png` },
    source: { urn },
  };
};

export default { ...fragment };
