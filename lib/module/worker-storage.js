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

  // ? filter out created
  for (const wee in request) {
    if (!(wee in current)) {
      if (!(wee in created)) created[wee] = {};

      for (const tas in request[wee]) //
        created[wee][tas] = request[wee][tas];

      continue;
    }
  }

  // ? filter out updated
  for (const wee in request) {
    for (const tas in request[wee]) {
      if (wee in created && tas in created[wee]) continue;

      if (!current[wee][tas] || request[wee][tas].hash != current[wee][tas].hash) {
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

internal.geWeekFromDate = ({ date }) => {
  const ref = new Date(date.getFullYear(), 0, 1);
  const day = Math.floor((date - ref) / (24 * 60 * 60 * 1000));

  return Math.ceil((date.getDay() + 1 + day) / 7);
};

export default { ...fragment };
