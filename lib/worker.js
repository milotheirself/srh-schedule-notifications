const fragment = {};
const internal = {};
const external = (globalThis.nodeExternal = {});

import { default as dotenv } from 'dotenv';

import { default as workerClient } from './worker-client.js';
import { default as workerRequest } from './module/worker-request.js';
import { default as workerStorage } from './module/worker-storage.js';

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

/* worker initialise */

(() => {
  workerClient.connectedCallback({ host: fragment });
  workerRequest.connectedCallback({ host: fragment });
  workerStorage.connectedCallback({ host: fragment });
})();

/* worker clen-up */

process.stdin.resume();

fragment.requestClose = () => {
  internal.whenClose({ clean: true, force: true });
};

internal.whenClose = ({ clean, force }) => {
  if (clean) {
    try {
      workerClient.disconnectedCallback({ host: fragment });
    } catch (err) {}
    try {
      workerRequest.disconnectedCallback({ host: fragment });
    } catch (err) {}
    try {
      workerStorage.disconnectedCallback({ host: fragment });
    } catch (err) {}
  }

  if (force) setTimeout(process.exit, 1000);
};

process.on('exit', internal.whenClose.bind(null, { clean: true }));
process.on('SIGINT', internal.whenClose.bind(null, { force: true }));
process.on('SIGUSR1', internal.whenClose.bind(null, { force: true }));
process.on('SIGUSR2', internal.whenClose.bind(null, { force: true }));
// process.on('uncaughtException', internal.whenClose.bind(null, { force: true }));
