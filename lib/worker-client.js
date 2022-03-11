import { Client, Intents, MessageEmbed } from 'discord.js';

import { default as dateLocalization } from './module-utils/date-localization.js';

const fragment = {};
const internal = {};
const external = globalThis.nodeExternal || (globalThis.nodeExternal = {});

fragment.connectedCallback = () => {
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

  internal.tasus.client.on('ready', () => {
    // fragment.postSchedule();
  });

  internal.tasus.client.login(internal.tasus.config.secret);
};

fragment.disconnectedCallback = () => {
  internal.tasus.client.destroy();
};

/* client action */

internal.postSchedule = async () => {
  const { client, config } = internal.tasus;

  let fro = dateLocalization.create({ tim: new Date('3/7/2022 0:0').getTime(), typ: 0 }).full;
  let unt = dateLocalization.create({ tim: new Date('3/13/2022 0:0').getTime(), typ: 0 }).full;
  let cha = dateLocalization.create({ tim: new Date().getTime(), typ: 1 }).full;

  const channel = await client.channels.fetch(config.output);
  const channelEmbed = [
    new MessageEmbed() //
      .setColor('#2f3136')
      .setImage('attachment://preview.png')
      .setDescription(`Aktualisierung des Zeitplans für ${fro} bis ${unt}`)
      .setFooter({ text: `Changed on ${cha}` }),
  ];

  await channel.send({
    embeds: channelEmbed,
    files: ['./lib/assets/transparent.png'],
  });
};

export default { ...fragment };
