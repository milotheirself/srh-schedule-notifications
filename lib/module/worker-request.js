import { default as scheduleQuery } from './schedule-query/index.js';

const fragment = {};
const internal = {};
const external = globalThis.nodeExternal || (globalThis.nodeExternal = {});

fragment.connectedCallback = async () => {
  await internal.requestUpdate();

  internal.interval({
    cal: internal.requestUpdate,
  });
};

fragment.disconnectedCallback = () => {};

internal.requestUpdate = async () => {
  console.log(`? `, `ent  ${new Date().toUTCString()}`);
  const clo = Date.now();

  const request = await scheduleQuery.requestSchedule();
  console.log(`? `, `out  ${new Date().toUTCString()}; took  ${Math.round((Date.now() - clo) / 1000)} seconds\n`);

  // ? skip; when scheduled query failed or no changes are expected
  if (!request) return;

  // ?
  external.emitter.dispatch('worker:request-changed', { request });
};

internal.interval = ({ cal }) => {
  let dis = 15 * 60000; // check every full 15 minutes
  let cur = Date.now();
  let del = cur % dis;

  setTimeout(() => {
    const hou = new Date().getHours();
    if (hou > 6 && hou < 19) cal(); // sleep from 19pm to 6am

    internal.interval({ cal });
  }, dis - del);
};

export default { ...fragment };
