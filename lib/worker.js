const fragment = {};
const internal = {};
const external = (globalThis.nodeExternal = {});

import { default as dotenv } from 'dotenv';

import { default as workerActor } from './module/worker/worker-actor.js';
import { default as workerFiles } from './module/worker/worker-files.js';
import { default as workerState } from './module/worker/worker-state.js';

/**
 * .env
 *
 * @example
 * DISCORD_SECRET="00000000000000000000000000000000000000000000000000000000000"
 * DISCORD_OUTPUT="000000000000000000"
 * DISCORD_AUDITS="000000000000000000"
 * DSB_ID="000000000000000000"
 * DSB_PA="000000000000000000"
 */

dotenv.config();

/* worker initialise */

(() => {
  workerActor.connectedCallback({ host: fragment });
  workerFiles.connectedCallback({ host: fragment });
  workerState.connectedCallback({ host: fragment });
})();

/* worker clen-up */

process.stdin.resume();

fragment.requestClose = () => {
  internal.whenClose({ clean: true, force: true });
};

internal.whenClose = ({ clean, force }) => {
  if (clean)
    try {
      workerActor.disconnectedCallback({ host: fragment });
    } catch (error) {}

  try {
    workerFiles.disconnectedCallback({ host: fragment });
  } catch (error) {}

  try {
    workerState.disconnectedCallback({ host: fragment });
  } catch (error) {}

  if (force) setTimeout(process.exit, 1000);
};

process.on('exit', internal.whenClose.bind(null, { clean: true }));
process.on('SIGINT', internal.whenClose.bind(null, { force: true }));
process.on('SIGUSR1', internal.whenClose.bind(null, { force: true }));
process.on('SIGUSR2', internal.whenClose.bind(null, { force: true }));
// process.on('uncaughtException', internal.whenClose.bind(null, { force: true }));
