import { default as puppeteer } from 'puppeteer';
import { default as nodeFiles } from 'fs';

const fragment = {};
const internal = {};

fragment.requestSchedule = async () => {
  internal.weeks = await internal.getWeeks();
  internal.tasks = await internal.getTasks({
    match: ['2312', '2412'],
  });

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
          await page.type('input[name="txtUser"]', `${process.env.DSB_ID}`, { delay: 10 });
          await page.type('input[name="txtPass"]', `${process.env.DSB_PA}`, { delay: 100 });
          await page.click('input[type="submit"]');

          return;
        }

        if (page.url().toLowerCase().indexOf('default') != -1) {
          // + query current files
          resolve(
            await page.evaluate(`
            [...document.querySelector('.timetableView').children].map((node) => {
                return {
                  changed: ((str) => {
                    const tim = str.split(' ');
                    const val = tim[0].split('.');
                    return new Date(\`\${val[1]}.\${val[0]}.\${val[2]} \${tim[1]}\`).getTime();
                  })(node.querySelector('.meta').textContent),
                  title: node.querySelector('.title').textContent,
                  plans: ((count) => {
                    const paths = node
                      .querySelector('.preview')
                      .src //
                      .replace(\`\${location.origin}/Image.ashx?f=\`, '')
                      .split('/')
                      .slice(0, 2)
                      .join('/');

                    return new Array(count).fill(null).map(
                      (n, i) => \`https://dsbmobile.de/data/\${paths}/c\${('00000' + (i + 1)).slice(-5)}.htm\` //
                    );
                  })(parseInt(node.querySelector('.page').textContent)),
                };
              });
          `)
          );

          // await page.screenshot({ path: `out/view.png` });
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
    const weeks = [];

    const inj = nodeFiles.readFileSync('./lib/module/actors/actors-inject.js', { encoding: 'utf8' });

    await Promise.all(
      internal.weeks.map(async (wee, i) => {
        const result = {
          index: i,
          plans: [],
        };

        await Promise.all(
          wee.plans.map(async (urn, j) => {
            const page = await browser.newPage();
            await page.goto(urn);
            console.log(`+ `, `goto  ${urn}`);

            const value = await page.evaluate(inj);

            result.plans.push(
              Object.keys(value).length != 0 //
                ? { index: j, invalid: false, ...value }
                : { index: j, invalid: true }
            );
          })
        );

        weeks.push(result);
      })
    );

    resolve(weeks);
    await browser.close();
  });
};

export default { ...fragment };
