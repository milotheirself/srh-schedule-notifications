import { default as nodeFiles } from 'fs';

const fragment = {};
const internal = {};
const external = globalThis.nodeExternal || (globalThis.nodeExternal = {});

/* */

fragment.connectedCallback = () => {
  external.emitter.on('worker:request-changed', fragment.whenRequestChanged);
};

fragment.disconnectedCallback = () => {
  external.emitter.detach('worker:request-changed', fragment.whenRequestChanged);
};

/* */

fragment.setStorage = ({ urn, val }) => {
  nodeFiles.mkdirSync(urn.slice(0, urn.lastIndexOf('/')), { recursive: true });
  nodeFiles.writeFileSync(urn, JSON.stringify(Object.assign({ ...val })));
};

fragment.getStorage = ({ urn }) => {
  return nodeFiles.existsSync(urn) //
    ? { stora: JSON.parse(nodeFiles.readFileSync(urn)) }
    : { stora: {} };
};

/* */

fragment.whenRequestChanged = ({ request }) => {
  const urn = `result/storage.json`;

  const { state } = request;
  const { stora } = fragment.getStorage({ urn });

  const result = internal.whenChanged({ state, stora });

  fragment.setStorage({ urn, val: state });
};

internal.whenChanged = ({ state, stora }) => {
  internal.filter({ state });

  console.log('state', state);
  console.log('stora', stora);

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

internal.filter = ({ state }) => {
  const match = external.options.element.match;

  Object.keys(state).forEach((wee) => {
    Object.keys(state[wee].element).forEach((ele) => {
      const del = match.indexOf(state[wee].element[ele].caption) == -1;
      if (del) delete state[wee].element[ele];
    });
  });
};

export default { ...fragment };
