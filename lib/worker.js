const fragment = {};
const internal = {};
const external = globalThis.nodeExternal || (globalThis.nodeExternal = {});

import { default as dotenv } from 'dotenv';

import { default as workerClients } from './worker-client.js';

import { default as workerRequest } from './module/worker-request.js';
import { default as workerStorage } from './module/worker-storage.js';

import { default as workerEmitter } from './snippet/emitter.js';

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
 *
 * OPT_ELEMENT="%7B%22match%22%3A%5B%<type>%22%2C%<type>%22%5D%7D"
 */

dotenv.config();

/* worker initialise */

(() => {
  external.emitter = workerEmitter.create();
  external.options = {
    element: JSON.parse(unescape(process.env.OPT_ELEMENT)),
  };

  workerClients.connectedCallback({ host: fragment });
  workerRequest.connectedCallback({ host: fragment });
  workerStorage.connectedCallback({ host: fragment });
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
//         // workerStorage.disconnectedCallback({ host: fragment });
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
