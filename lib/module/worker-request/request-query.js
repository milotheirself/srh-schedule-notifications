import { default as puppeteer } from 'puppeteer';
import { default as nodeFiles } from 'fs';

const fragment = {};
const internal = {};

// +
internal.inj = [
  './lib/module/worker-request-inject/request-inject-plans.js', //
  './lib/module/worker-request-inject/request-inject-tasks.js',
  './lib/module/worker-request-inject/request-inject-print.js',
];

fragment.requestSchedule = async ({ outputs }) => {
  internal.weeks = await internal.getWeeks();
  internal.tasks = await internal.getTasks({ outputs });

  return {
    weeks: internal.weeks,
    tasks: internal.tasks,
  };
};

internal.getWeeks = () => {
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
          const inj = nodeFiles.readFileSync(internal.inj[0], { encoding: 'utf8' });
          resolve(await page.evaluate(inj));

          await browser.close();
        }
      }, 1000);
    });

    page.goto('https://dsbmobile.de');
  });
};

internal.getTasks = () => {
  return new Promise(async (resolve) => {
    const browser = await puppeteer.launch();
    const weeks = {};

    const inj = nodeFiles.readFileSync(internal.inj[1], { encoding: 'utf8' });

    await Promise.all(
      Object.keys(internal.weeks).map(async (wee) => {
        const result = { plans: {} };

        await Promise.all(
          Object.keys(internal.weeks[wee].plans).map(async (pla) => {
            const page = await browser.newPage();
            await page.goto(internal.weeks[wee].plans[pla].urn);
            console.log(`+ `, `goto  ${page.url()}`);

            const val = await page.evaluate(inj);

            result.plans[pla] =
              Object.keys(val).length != 0 //
                ? { invalid: false, ...val }
                : { invalid: true };
          })
        );

        weeks[wee] = result;
      })
    );

    resolve(weeks);
    await browser.close();
  });
};

export default { ...fragment };
