import { default as puppeteer } from 'puppeteer';
import { default as nodeFiles } from 'fs';
import { default as nodeCrypto } from 'crypto';

const fragment = {};
const internal = {};

// +
internal.urn = {
  injectPlans: () => `lib/module/worker-request-inject/request-inject-plans.js`,
  injectTasks: () => `lib/module/worker-request-inject/request-inject-tasks.js`,
  injectPrint: () => `lib/module/worker-request-inject/request-inject-print.js`,
};

fragment.requestSchedule = async () => {
  const weeks = await internal.fetchWeeks();
  const tasks = await internal.fetchTasks({ weeks });
  return tasks;
};

internal.fetchWeeks = () => {
  return new Promise(async (resolve) => {
    const browser = await puppeteer.launch();
    const page = await browser.newPage();

    page.on('load', () => {
      console.log(`+ `, `goto  ${page.url()}`);

      setTimeout(async () => {
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

          resolve({ ...weeks });

          await browser.close();
        }
      }, 1000);
    });

    page
      .goto('https://dsbmobile.de', {
        waitUntil: 'load',
        timeout: 20000,
      })
      .catch((err) => {
        console.error(err);
        resolve({ invalid: true });
      });
  });
};

internal.fetchTasks = ({ weeks }) => {
  return new Promise(async (resolve) => {
    const browser = await puppeteer.launch();
    const result = { ...weeks };
    const page = await browser.newPage();

    const inv = false;
    const inj = nodeFiles.readFileSync(internal.urn.injectTasks(), { encoding: 'utf8' });

    await Promise.all(
      Object.keys(weeks).map(async (wee) => {
        for (const ele in weeks[wee].element) {
          if (inv) return;

          await page
            .goto(weeks[wee].element[ele].source.urn, {
              waitUntil: 'load',
              timeout: 20000,
            })
            .catch((err) => {
              console.error(err);
              inv = true;
            });

          console.log(`+ `, `goto  ${page.url()}`);
          if (!inv) {
            const { caption, content } = await page.evaluate(inj);

            weeks[wee].element[ele].caption = caption;
            weeks[wee].element[ele].content = content;
            weeks[wee].element[ele].contentHash = nodeCrypto.createHash('md5').update(JSON.stringify(content)).digest('hex');
          }
        }
      })
    );

    resolve({ invalid: inv, ...result });
    await browser.close();
  });
};

export default { ...fragment };
