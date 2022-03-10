import { default as nodeFiles } from 'fs';

import { default as schedulePrint } from './worker-request/request-print.js';
import { default as scheduleQuery } from './worker-request/request-query.js';

const fragment = {};
const internal = {};

internal.urn = {
  outputs: (fil) => `lib/result/${fil}`,
};

fragment.connectedCallback = () => {
  internal.interval({ cal: fragment.requestUpdate, min: 5 * 60, del: -20 });
};

fragment.disconnectedCallback = () => {
  // [...]
};

internal.interval = ({ cal, min, del }) => {
  cal();

  // ---
  // FIXME: Not needed rn/
  const tim = new Date();
  const pas = tim.getMinutes() * 60 + tim.getSeconds() - del;

  setTimeout(() => {
    internal.interval({ cal, min, del });
  }, (min - (pas - Math.floor(pas / min) * min)) * 1000);
  // ---
};

fragment.requestUpdate = async () => {
  console.log(`\ne `, `schedule query`);
  console.log(`? `, `ent  ${new Date().toUTCString()}`);
  const clo = Date.now();
  const urn = internal.urn.outputs('schedule-query.json');

  let sched = null;

  try {
    sched = await scheduleQuery.requestSchedule({
      outputs: internal.urn.outputs,
    });
  } catch (err) {
    console.log('scheduleQuery.requestSchedule faild');
    console.log(err);
  }
  console.log(`? `, `out  ${new Date().toUTCString()}; took  ${Math.round((Date.now() - clo) / 1000)} seconds`);

  // +
  if (!sched) return;

  // +
  const local = nodeFiles.existsSync(urn) //
    ? JSON.parse(nodeFiles.readFileSync(urn))
    : { weeks: {}, tasks: {} };

  const result = internal.checkUpdate({ sched, local });
  console.log(result);

  // if (
  //   result.created.length == 0 && //
  //   result.updated.length == 0 &&
  //   result.removed.length == 0
  // )
  //   return;

  // +
  nodeFiles.mkdirSync(urn.slice(0, urn.lastIndexOf('/')), { recursive: true });
  nodeFiles.writeFileSync(urn, JSON.stringify(Object.assign({ ...sched })));
};

internal.checkUpdate = ({ sched, local }) => {
  // console.log('sched', sched);
  // console.log('local', local);

  const result = {
    created: [],
    updated: [],
    removed: [],
  };

  // sched.weeks.forEach((sch) => {
  //   const loc = local.weeks.filter((loc) => loc.title == sch.title)[0];

  //   // + created
  //   if (!loc) result.created.push(sch);

  //   // + updated
  //   if (loc && loc.changed != sch.changed) result.updated.push(sch);
  // });

  // local.weeks.forEach((loc) => {
  //   const sch = sched.weeks.filter((sch) => sch.title == loc.title)[0];

  //   // + removed
  //   if (!sch) result.created.push(sch);
  // });

  return result;
};

export default { ...fragment };
