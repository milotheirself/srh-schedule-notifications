import { Client, Intents, MessageEmbed, MessageAttachment } from 'discord.js';

const fragment = {};
const internal = {};
const external = globalThis.nodeExternal || (globalThis.nodeExternal = {});

fragment.connectedCallback = () => {
  internal.config = {
    audits: external.options.publish.audits, //
    output: external.options.publish.output,
    target: external.options.publish.target,
  };

  internal.client = new Client({ intents: [Intents.FLAGS.GUILDS] });
  internal.client.on('ready', () => {
    const { client, config } = internal;

    internal.postEmbed({
      cha: config.audits,
      des: `Connected – <t:${internal.fetchTime()}:f>`,
    });
  });

  internal.client.login(external.options.publish.secret);

  external.emitter.on('worker:storage-changed', internal.whenUpdate);
};

fragment.disconnectedCallback = () => {
  internal.client.destroy();
  external.emitter.detach('worker:storage-changed', internal.whenUpdate);
};

internal.whenUpdate = async ({ created, updated }) => {
  for (const wee in created)
    for (const tas in created[wee]) //
      await internal.publisch({ typ: 0, tas: created[wee][tas] });

  for (const wee in updated)
    for (const tas in updated[wee]) //
      await internal.publisch({ typ: 1, tas: updated[wee][tas] });
};

internal.publisch = async ({ typ, tas }) => {
  const { output, target } = internal.config;

  if (!(tas.task in target)) return;

  const dat = [
    Math.floor((internal.getDateFromWeek({ week: tas.week }).getTime() + 1 * 86400000) / 1000), //
    Math.floor((internal.getDateFromWeek({ week: tas.week }).getTime() + 5 * 86400000) / 1000),
  ];

  const cha = tas.task in target ? target[tas.task] : output;
  const fil = tas.result.urn;
  const des = [
    `[WK ${tas.week}](${tas.source.urn}) · ${tas.task} · <t:${dat[0]}:D> – <t:${dat[1]}:D>`, //
    `[WK ${tas.week}](${tas.source.urn}) · ${tas.task} · <t:${dat[0]}:D> – <t:${dat[1]}:D> (updated)`,
  ][typ];

  await internal.postEmbed({ cha, des, fil });
  // await internal.postImage({ cha, fil });
};

internal.fetchTime = () => {
  return Math.floor(Date.now() / 1000);
};

internal.postEmbed = async ({ cha, des, foo, fil }) => {
  const { client, config } = internal;

  const channel = await client.channels.fetch(cha || config.output);
  const channelEmbed = new MessageEmbed().setColor('#2f3136');

  if (des) channelEmbed.setDescription(des);
  if (foo) channelEmbed.setFooter({ text: foo });

  if (fil) {
    const att = new MessageAttachment(fil, 'preview.png');
    channelEmbed.setImage('attachment://preview.png');

    await channel.send({ embeds: [channelEmbed], files: [att] });
    return;
  }

  await channel.send({ embeds: [channelEmbed] });
};

// internal.postImage = async ({ cha, fil }) => {
//   const { client, config } = internal;

//   const channel = await client.channels.fetch(cha || config.output);
//   await channel.send({ files: [fil] }); //
// };

internal.getDateFromWeek = ({ week }) => {
  const year = new Date().getFullYear();
  const ref = new Date(year, 0, 1 + parseInt(week) * 7);

  while (ref.getDay() !== 0) ref.setDate(ref.getDate() - 1);

  return ref;
};

export default { ...fragment };
