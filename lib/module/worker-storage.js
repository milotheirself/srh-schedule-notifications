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
  if (request.invalid) {
    external.emitter.dispatch('worker:storage-invalid');
    return;
  }

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

  // + element created by week created
  for (const sta in state) {
    if (locate(state[sta], stora, 'caption')) continue;

    for (const ele in state[sta].element) {
      const node = state[sta].element[ele];
      result.created[ele] = { ...node };
    }
  }

  for (const sta in state) {
    const sto = locate(state[sta], stora, 'caption');

    // + element removed
    if (!sto) continue;

    for (const staEle in state[sta].element) {
      const node = state[sta].element[staEle];
      const stoEle = locate(node, stora[sto].element, 'caption');

      // + element created
      if (!stoEle) {
        result.created[staEle] = { ...node };
        continue;
      }

      // + element updated
      if (node.contentHash != stora[sto].element[stoEle].contentHash) {
        result.updated[staEle] = { ...node };
        continue;
      }

      // + contents do not need to be stored
      delete node.content;
    }
  }

  return result;
};

internal.filter = ({ state }) => {
  const match = external.options.element.match;

  Object.keys(state).forEach((sta) => {
    if (sta == 'invalid') return;

    Object.keys(state[sta].element).forEach((ele) => {
      const cap = state[sta].element[ele].caption;
      const del = match.map((m) => cap.indexOf(m) != -1).indexOf(true) == -1;

      if (del) delete state[sta].element[ele];
    });
  });
};

export default { ...fragment };
