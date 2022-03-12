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

  console.log(result);

  external.emitter.dispatch('worker:storage-changed', { storage: result });
  fragment.setStorage({ urn, val: state });
};

internal.whenChanged = ({ state, stora }) => {
  internal.filter({ state });

  const locate = (ref, obj, key) => {
    for (const i in obj) if (obj[i][key] == ref[key]) return i;
    return null;
  };

  const result = {
    created: {},
    updated: {},
    removed: {},
  };

  // // + element removed by week removed
  // for (const sta in stora) {
  //   if (locate(stora[sta], state, 'caption')) continue;

  //   for (const ele in stora[sta].element) {
  //     const node = stora[sta].element[ele];
  //     result.removed[ele] = node;
  //   }
  // }

  // + element created by week created
  for (const sta in state) {
    if (locate(state[sta], stora, 'caption')) continue;

    for (const ele in state[sta].element) {
      const node = state[sta].element[ele];
      result.created[ele] = node;
    }
  }

  // for (const sto in stora) {
  //   const sta = locate(stora[sto], state, 'caption');

  //   for (const stoEle in stora[sta].element) {
  //     const node = stora[sta].element[stoEle];
  //     const staEle = locate(node, state[sto].element, 'caption');

  //     // + element removed
  //     if (!staEle) {
  //       result.removed[stoEle] = node;
  //     }
  //   }
  // }

  for (const sta in state) {
    const sto = locate(state[sta], stora, 'caption');

    for (const staEle in state[sta].element) {
      const node = state[sta].element[staEle];
      const stoEle = locate(node, stora[sto].element, 'caption');

      // + element created
      if (!stoEle) {
        result.created[staEle] = node;
        continue;
      }

      // + element updated
      if (JSON.stringify(node) != JSON.stringify(stora[sto].element[stoEle])) {
        result.updated[staEle] = node;
        continue;
      }
    }
  }

  return result;
};

internal.filter = ({ state }) => {
  const match = external.options.element.match;

  Object.keys(state).forEach((sta) => {
    Object.keys(state[sta].element).forEach((ele) => {
      const cap = state[sta].element[ele].caption;
      const del = match.map((m) => cap.indexOf(m) != -1).indexOf(true) == -1;

      if (del) delete state[sta].element[ele];
    });
  });
};

export default { ...fragment };
