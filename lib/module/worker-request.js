import { default as scheduleQuery } from './schedule-query/index.js';

const fragment = {};
const internal = {};
const external = globalThis.nodeExternal || (globalThis.nodeExternal = {});

fragment.connectedCallback = () => {
  internal.requestUpdate();
};

fragment.disconnectedCallback = () => {};

internal.requestUpdate = async () => {
  console.log(`? `, `ent  ${new Date().toUTCString()}`);
  const clo = Date.now();

  const state = await scheduleQuery.requestSchedule();
  console.log(`? `, `out  ${new Date().toUTCString()}; took  ${Math.round((Date.now() - clo) / 1000)} seconds`);

  // ? skip; when schedule query faild
  if (!state) return;

  // ?
  external.emitter.dispatch('worker:request-changed', { state });
};

// internal.interval = ({ cal, min, del, sle }) => {
//   const tim = new Date();
//   const pas = tim.getMinutes() * 60 + tim.getSeconds() - del;

//   if (tim.getHours() < sle[0] && tim.getHours() > sle[1]) cal();

//   setTimeout(() => {
//     internal.interval({ cal, min, del, sle });
//   }, (min - (pas - Math.floor(pas / min) * min)) * 1000);
// };

export default { ...fragment };
