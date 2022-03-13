import { Client, Intents, MessageEmbed } from 'discord.js';

import { default as dateLocalization } from './module-utils/date-localization.js';

const fragment = {};
const internal = {};
const external = globalThis.nodeExternal || (globalThis.nodeExternal = {});

fragment.connectedCallback = () => {
  external.emitter.on('worker:storage-changed', fragment.whenStorageChanged);
  external.emitter.on('worker:storage-invalid', fragment.whenStorageInvalid);
  internal.connect();
};

fragment.disconnectedCallback = () => {
  external.emitter.detach('worker:storage-changed', fragment.whenStorageChanged);
  external.emitter.detach('worker:storage-invalid', fragment.whenStorageInvalid);
  internal.close();
};

/* client action */

fragment.whenStorageChanged = async ({ storage }) => {
  const { created, updated, removed } = storage;

  if (
    !Object.keys(created).length && //
    !Object.keys(updated).length &&
    !Object.keys(removed).length
  ) {
    internal.postVoid();
  }

  for (const ele in created) {
    await internal.postCreated({ element: created[ele] });
  }

  for (const ele in updated) {
    await internal.postUpdated({ element: updated[ele] });
  }

  for (const ele in removed) {
    await internal.postRemoved({ element: removed[ele] });
  }
};

fragment.whenStorageInvalid = async ({ storage }) => {
  internal.postError();
};

internal.close = () => {
  internal.tasus.client.destroy();
};

internal.connect = () => {
  internal.tasus = {
    config: {
      secret: process.env.DISCORD_SECRET, //
      output: process.env.DISCORD_OUTPUT,
      audits: process.env.DISCORD_AUDITS,
    },
    client: new Client({
      intents: [Intents.FLAGS.GUILDS],
    }),
  };

  // internal.tasus.client.on('debug', (eve) => {
  //   console.log(eve);
  // });
  internal.tasus.client.on('ready', () => {
    internal.postOnline();
  });

  internal.tasus.client.login(internal.tasus.config.secret);
};

internal.postError = async () => {
  let cha = dateLocalization.create({ tim: new Date().getTime(), typ: 1 }).dateFull;

  await internal.postEmbed({
    des: `Audit; internal error`,
    foo: `Checked on ${cha}`,
  });
};

internal.postVoid = async () => {
  let cha = dateLocalization.create({ tim: new Date().getTime(), typ: 1 }).dateFull;

  await internal.postEmbed({
    des: `Audit; no updates found`,
    foo: `Checked on ${cha}`,
  });
};

internal.postOnline = async () => {
  let cha = dateLocalization.create({ tim: new Date().getTime(), typ: 1 }).dateFull;
  let pla =
    process.platform == 'win32' //
      ? 'within a developer environment'
      : 'from raspberry';

  await internal.postEmbed({
    des: `Audit; Running ${pla}`,
    // foo: `Instantiated on ${cha}`,
  });
};

internal.postCreated = async ({ element }) => {
  let cha = dateLocalization.create({ tim: new Date().getTime(), typ: 1 }).dateFull;

  await internal.postEmbed({
    des: `Aktualisierung des Zeitplans __${element.caption}__`,
    foo: `Created on ${cha}`,
  });
};

internal.postUpdated = async ({ element }) => {
  let cha = dateLocalization.create({ tim: new Date().getTime(), typ: 1 }).dateFull;

  await internal.postEmbed({
    des: `Aktualisierung des Zeitplans __${element.caption}__`,
    foo: `Updated on ${cha}`,
  });
};

internal.postRemoved = async ({ element }) => {
  let cha = dateLocalization.create({ tim: new Date().getTime(), typ: 1 }).dateFull;

  await internal.postEmbed({
    des: `Aktualisierung des Zeitplans __${element.caption}__`,
    foo: `Removed on ${cha}`,
  });
};

internal.postEmbed = async ({ des, foo }) => {
  const { client, config } = internal.tasus;

  const channel = await client.channels.fetch(config.output);
  const channelEmbed = new MessageEmbed().setColor('#2f3136');

  if (des) channelEmbed.setDescription(des);
  if (foo) channelEmbed.setFooter({ text: foo });

  await channel.send({
    embeds: [channelEmbed],
    // files: ['./lib/assets/transparent.png'],
  });
};

export default { ...fragment };
