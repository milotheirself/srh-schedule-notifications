import { default as nodeFiles } from 'fs/promises';

const fragment = {};
const internal = {};
const external = globalThis.nodeExternal || (globalThis.nodeExternal = {});

fragment.connectedCallback = () => {
  external.emitter.on('worker:request-changed', internal.whenUpdate);
};

fragment.disconnectedCallback = () => {
  external.emitter.detach('worker:request-changed', internal.whenUpdate);
};

internal.whenUpdate = async ({ state }) => {
  const current = await internal.readStorage();

  const created = {};
  const updated = {};

  // ? created
  for (const wee in state) {
    if (!(wee in current)) {
      if (!(wee in created)) created[wee] = {};
      for (const tas in state[wee]) created[wee][tas] = state[wee][tas];

      continue;
    }
  }

  // ? updated

  console.log({ created, updated });
  // console.log({ state });
};

internal.writeStorage = async ({ state }) => {
  await nodeFiles.writeFile('result/storage.json', JSON.stringify(state));
};

internal.readStorage = async () => {
  const sta = await nodeFiles
    .access('result/storage.json')
    .then(() => true)
    .catch(() => false);

  return sta ? JSON.parse(await nodeFiles.readFile('result/storage.json')) : {};
};

export default { ...fragment };
