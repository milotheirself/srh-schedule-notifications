// const fragment = {};
// const internal = {};
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
 * DISCORD_TARGET="<server_channel_id>:<match>[,<server_channel_id>:<match>,...]"
 *
 * SIGNIN_NAMEs="<user_name>"
 * SIGNIN_PASSs="<user_pass>"
 */

dotenv.config();

(() => {
  external.emitter = workerEmitter.create();
  external.options = {
    publish: {
      secret: process.env.DISCORD_SECRET,
      audits: process.env.DISCORD_AUDITS,
      output: process.env.DISCORD_OUTPUT,
      target: (() => {
        const tar = {};
        const lis = process.env.DISCORD_TARGET.split(',');

        for (const i in lis) //
          tar[lis[i].split(':')[1]] = lis[i].split(':')[0];

        return tar;
      })(),
    },

    request: {
      name: process.env.SIGNIN_NAME,
      pass: process.env.SIGNIN_PASS,
    },
  };

  workerRequest.connectedCallback();
  workerStorage.connectedCallback();
  workerPublish.connectedCallback();
})();
