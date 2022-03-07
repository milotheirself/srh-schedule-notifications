import { default as nodeFiles } from 'fs';

import { default as schedulePrint } from '../schedule-print.js';
import { default as scheduleQuery } from '../schedule-query.js';

const fragment = {};
const internal = {};

fragment.connectedCallback = () => {
  internal.interval({ cal: fragment.requestUpdate, min: 20 * 60, del: -20 });
};

fragment.disconnectedCallback = () => {
  // [...]
};

internal.interval = ({ cal, min, del }) => {
  cal();

  const tim = new Date();
  const pas = tim.getMinutes() * 60 + tim.getSeconds();

  setTimeout(() => {
    internal.interval({ cal, min, del });
  }, (min + del - (pas - Math.floor(pas / min) * min)) * 1000);
};

fragment.requestUpdate = async () => {
  console.log(`\ne `, `schedule request`);
  const clo = Date.now();

  const urn = 'out/state.json';
  const sched = await scheduleQuery.requestSchedule();

  sched.tasks = sched.tasks.sort((a, b) => (a.index > b.index ? 1 : -1));
  sched.tasks = sched.tasks.map((tas) => {
    tas.plans = tas.plans.sort((a, b) => (a.index > b.index ? 1 : -1)).filter((pla) => !pla.invalid);
    return tas;
  });

  const local = nodeFiles.existsSync(urn) ? JSON.parse(nodeFiles.readFileSync(urn)) : { weeks: [], tasks: [] };
  // const apply = sched.tasks[0].plans.filter((pla) => {});

  console.log(`+ `, `took  ${Math.round((Date.now() - clo) / 1000)} sec`);

  const infor = {
    created: [],
    updated: [],
    removed: [],
  };

  sched.tasks.forEach((sch) => {
    local.tasks;
  });

  // +
  nodeFiles.mkdirSync(urn.slice(0, urn.lastIndexOf('/')), { recursive: true });
  nodeFiles.writeFileSync(urn, JSON.stringify(Object.assign({ ...sched }), null, '\t'));
};

export default { ...fragment };
