import { default as nodeFiles } from 'fs/promises';

const fragment = {};
const internal = {};
const external = globalThis.nodeExternal || (globalThis.nodeExternal = {});

fragment.connectedCallback = () => {
  external.emitter.on('worker:storage-changed', internal.whenUpdate);
};

fragment.disconnectedCallback = () => {
  external.emitter.detach('worker:storage-changed', internal.whenUpdate);
};

internal.whenUpdate = async ({ created, updated }) => {
  console.log({ created, updated });
};

export default { ...fragment };
