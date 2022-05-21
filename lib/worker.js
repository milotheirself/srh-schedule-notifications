const fragment = {};
const internal = {};
const external = globalThis.nodeExternal || (globalThis.nodeExternal = {});

import { default as dotenv } from 'dotenv';
import { default as workerEmitter } from './snippet/emitter.js';

import { default as workerRequest } from './module/worker-request.js';
import { default as workerStorage } from './module/worker-storage.js';
import { default as workerPublish } from './module/worker-publish.js';

/**
 * .env
 *
 * @example
 * DISCORD_SECRET="<client_token>"
 * DISCORD_OUTPUT="<server_channel_id>"
 * DISCORD_AUDITS="<server_channel_id>"
 *
 * DSB_ID="<user_name>"
 * DSB_PA="<user_pass>"
 */

dotenv.config();

(() => {
  external.emitter = workerEmitter.create();
  external.options = {};

  workerRequest.connectedCallback();
  workerStorage.connectedCallback();
  workerPublish.connectedCallback();
})();

/* worker clen-up */

// (() => {
//   process.stdin.resume();

//   fragment.requestClose = () => {
//     internal.whenClose({ clean: true, force: true });
//   };

//   internal.whenClose = ({ clean, force }) => {
//     if (clean)
//       try {
//         workerClients.disconnectedCallback({ host: fragment });
//         // workerRequest.disconnectedCallback({ host: fragment });
//       } catch (err) {
//         console.error(err);
//       }

//     if (force) setTimeout(process.exit, 500);
//   };

//   process.on('exit', internal.whenClose.bind(null, { clean: true }));
//   process.on('SIGINT', internal.whenClose.bind(null, { force: true }));
//   process.on('SIGUSR1', internal.whenClose.bind(null, { force: true }));
//   process.on('SIGUSR2', internal.whenClose.bind(null, { force: true }));
// })();
