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
  let dis = 10 * 60 * 1000;
  let cur = Date.now();
  let del = cur % dis;

  setTimeout(() => {
    const hou = new Date().getHours();
    if (hou > 4 && hou < 22) cal();

    internal.interval({ cal });
  }, dis - del);
};

export default { ...fragment };
