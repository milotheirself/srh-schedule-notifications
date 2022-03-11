import { default as schedulePrint } from './worker-request/request-print.js';
import { default as scheduleQuery } from './worker-request/request-query.js';

const fragment = {};
const internal = {};
const external = globalThis.nodeExternal || (globalThis.nodeExternal = {});

fragment.connectedCallback = () => {
  internal.interval({ cal: fragment.requestUpdate, min: 5 * 60, del: -20 });

  external.emitter.on('worker:request-update', fragment.requestUpdate);
};

fragment.disconnectedCallback = () => {
  external.emitter.detach('worker:request-update', fragment.requestUpdate);
};

/* */

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

/* */

fragment.requestUpdate = async () => {
  console.log(`\ne `, `schedule query`);
  console.log(`? `, `ent  ${new Date().toUTCString()}`);
  const clo = Date.now();

  let state = null;

  try {
    state = await scheduleQuery.requestSchedule();
  } catch (err) {
    console.log('scheduleQuery::requestSchedule faild');
    console.log(err);
  }
  console.log(`? `, `out  ${new Date().toUTCString()}; took  ${Math.round((Date.now() - clo) / 1000)} seconds`);

  // +
  if (!state) return;

  external.emitter.dispatch('worker:request-changed', { request: { state } });
};

export default { ...fragment };
