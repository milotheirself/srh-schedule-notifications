import { Client, Intents, MessageEmbed } from 'discord.js';

const fragment = {};
const internal = {};

fragment.connectedCallback = () => {
  fragment.tasus = {
    config: {
      secret: process.env.DISCORD_SECRET, //
      output: process.env.DISCORD_OUTPUT,
      audits: process.env.DISCORD_AUDITS,
    },
    client: new Client({
      intents: [Intents.FLAGS.GUILDS],
    }),
  };

  fragment.tasus.client.on('ready', () => {
    // fragment.postSchedule();
  });

  fragment.tasus.client.login(fragment.tasus.config.secret);
};

fragment.disconnectedCallback = () => {
  fragment.tasus.client.destroy();
};

/* client action */

fragment.readDate = ({ tim, typ }) => {
  const today = new Date(tim);

  const month = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
  const week = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

  let d = today.getDate();
  let m = today.getMonth();
  let y = today.getFullYear();
  let hau = today.getHours();
  let min = today.getMinutes();

  let ha = hau > 12 ? 'PM' : 'AM';
  hau -= hau > 12 ? 12 : 0;

  let d2 = (n) => `00${n}`.slice(-2);

  return typ == 0 //
    ? `${d2(d)}/${d2(m + 1)}/${y}`
    : `${week[d]}, ${month[m]} ${d2(d)}, ${y} ${d2(hau)}:${d2(min)} ${ha}`;
};

fragment.postSchedule = async () => {
  const { client, config } = fragment.tasus;

  let fro = fragment.readDate({ tim: new Date('3/7/2022 0:0').getTime(), typ: 0 });
  let unt = fragment.readDate({ tim: new Date('3/13/2022 0:0').getTime(), typ: 0 });
  let cha = fragment.readDate({ tim: new Date().getTime(), typ: 1 });

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
