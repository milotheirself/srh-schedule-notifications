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

internal.whenUpdate = async ({ request }) => {
  const current = await internal.readStorage();

  const created = {};
  const updated = {};

  // ? created
  for (const wee in request) {
    if (!(wee in current)) {
      if (!(wee in created)) created[wee] = {};

      for (const tas in request[wee]) //
        created[wee][tas] = request[wee][tas];

      continue;
    }
  }

  // ? updated
  for (const wee in request) {
    for (const tas in request[wee]) {
      if (wee in created && tas in created[wee]) continue;

      if (request[wee][tas].hash != current[wee][tas].hash) {
        if (!(wee in updated)) updated[wee] = {};
        updated[wee][tas] = request[wee][tas];
      }
    }
  }

  internal.writeStorage({ request });
  external.emitter.dispatch('worker:storage-changed', { created, updated });
};

internal.writeStorage = async ({ request }) => {
  await nodeFiles.writeFile('result/storage.json', JSON.stringify(request));
};

internal.readStorage = async () => {
  const sta = await nodeFiles
    .access('result/storage.json')
    .then(() => true)
    .catch(() => false);

  return sta ? JSON.parse(await nodeFiles.readFile('result/storage.json')) : {};
};

export default { ...fragment };
