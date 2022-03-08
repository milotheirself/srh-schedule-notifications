import { default as nodeFiles } from 'fs';

import { default as schedulePrint } from '../schedule-print.js';
import { default as scheduleQuery } from '../schedule-query.js';

const fragment = {};
const internal = {};

internal.urn = {
  outputs: (fil) => `lib/result/${fil}`,
};

fragment.connectedCallback = () => {
  internal.interval({ cal: fragment.requestUpdate, min: 10 * 60, del: -20 });
};

fragment.disconnectedCallback = () => {
  // [...]
};

internal.interval = ({ cal, min, del }) => {
  const tim = new Date();
  const pas = tim.getMinutes() * 60 + tim.getSeconds() - del;
  cal();

  setTimeout(() => {
    internal.interval({ cal, min, del });
  }, (min - (pas - Math.floor(pas / min) * min)) * 1000);
};

fragment.requestUpdate = async () => {
  console.log(`\ne `, `schedule query`);
  const clo = Date.now();
  const urn = internal.urn.outputs('schedule-query.json');

  const sched = await scheduleQuery.requestSchedule({
    outputs: internal.urn.outputs,
  });

  sched.tasks = sched.tasks.sort((a, b) => (a.index > b.index ? 1 : -1));
  sched.tasks = sched.tasks.map((tas) => {
    tas.plans = tas.plans.sort((a, b) => (a.index > b.index ? 1 : -1)).filter((pla) => !pla.invalid);
    return tas;
  });

  const local = nodeFiles.existsSync(urn) ? JSON.parse(nodeFiles.readFileSync(urn)) : { weeks: [], tasks: [] };

  console.log(`+ `, `took  ${Math.round((Date.now() - clo) / 1000)} seconds`);
  internal.applyUpdate({ sched, local });

  // +
  nodeFiles.mkdirSync(urn.slice(0, urn.lastIndexOf('/')), { recursive: true });
  nodeFiles.writeFileSync(urn, JSON.stringify(Object.assign({ ...sched }), null, '\t'));
};

internal.applyUpdate = ({ sched, local }) => {
  // console.log('sched', sched);
  // console.log('local', local);

  const infor = {
    created: [],
    updated: [],
    removed: [],
  };

  sched.weeks.forEach((sch) => {
    const loc = local.weeks.filter((loc) => loc.title == sch.title)[0];

    // + created
    if (!loc) infor.created.push(sch);

    // + updated
    if (loc && loc.changed != sch.changed) infor.updated.push(sch);
  });

  local.weeks.forEach((loc) => {
    const sch = sched.weeks.filter((sch) => sch.title == loc.title)[0];

    // + removed
    if (!sch) infor.created.push(sch);
  });

  console.log(infor);
};

export default { ...fragment };
