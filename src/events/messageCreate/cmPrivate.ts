import * as config from '@config';
import {
  ActionRowBuilder,
  ButtonBuilder,
  type ButtonInteraction,
  ButtonStyle,
  EmbedBuilder,
  type Message,
  TextChannel,
} from 'discord.js';

export default async (message: Message) => {
  if (!(message.channel instanceof TextChannel)) return;
  if (!message.guild) return;

  const ownerId = config.ownerId;
  const allowedIds = [ownerId];
  const args = message.content.split(' ');
  let prefix;
  if (message.client.user.id !== '1303334967949922396') prefix = '.cm';
  else prefix = '.cm-dev';
  if (!args[0] || args[0] !== prefix) return;
  if (!args[1]) return;
  if (!allowedIds.includes(message.author.id)) return message.react('❌');

  switch (args[1].toLowerCase()) {
    case 'ping':
      return message.channel.send('Pong!');

    case 'eval': {
      if (!args[2]) return message.channel.send('No code provided.');

      let code = args.slice(2).join(' ');
      let originalCode = code;
      if (
        (code.startsWith('```js') && code.endsWith('```')) ||
        (code.startsWith('```') && code.endsWith('```'))
      ) {
        code = code.replace(/^```js|^```/, '');
        code = code.slice(0, -3).trim();
        originalCode = code;
        code = `(async () => {${code}})()`;
      }
      console.log(code);
      if (code.includes('await'))
        await message.react('<:soonTM:1303726162668949554>');

      let consoleOutput = '';
      const originalConsoleLog = console.log;

      console.log = (...args) => {
        const log = args.join(' ');
        consoleOutput += log + '\n';
        originalConsoleLog(...args);
      };

      let botResponse;
      try {
        const asyncEval = async () => eval(code);
        let evaled = await asyncEval();

        console.log = originalConsoleLog;

        if (evaled instanceof Promise) {
          evaled = await evaled;
          await message.react('✅');
        }

        const finalConsoleOutput =
          consoleOutput.trim() || 'No logs during eval.';

        const embed = new EmbedBuilder()
          .setTitle('Eval Success')
          .setDescription(`\`\`\`js\n${originalCode}\n\`\`\``)
          .addFields({
            name: 'Console Output',
            value: `\`\`\`js\n${finalConsoleOutput.slice(0, 2_000)}\n\`\`\``,
          })
          .setColor('Green');
        botResponse = await message.channel.send({ embeds: [embed] });
        setTimeout(() => {
          message.delete();
        }, 500);
      } catch (error: unknown) {
        console.log = originalConsoleLog;
        message.react('❌');

        const errorEmbed = new EmbedBuilder()
          .setTitle('Eval Failed')
          .setDescription(`\`\`\`js\n${`${error}`.slice(0, 2_000)}\n\`\`\``)
          .setColor('Red');
        botResponse = await message.channel.send({
          embeds: [errorEmbed],
        });
        setTimeout(() => {
          message.delete();
        }, 500);
      }
      setTimeout(() => {
        if (!(message.channel instanceof TextChannel)) return;
        const actionRow1 = new ActionRowBuilder<ButtonBuilder>().addComponents(
          new ButtonBuilder()
            .setStyle(ButtonStyle.Secondary)
            .setEmoji('<:TrashBin_red:1303739433408794696>')
            .setCustomId(
              `DeleteResponse:${botResponse.id}:${message.author.id}`
            )
        );

        botResponse?.edit({ components: [actionRow1] });

        const collector = message.createMessageComponentCollector({
          filter: (i) => i.customId.startsWith('DeleteEval-'),
          time: 60_000,
        });

        collector.on('collect', async (i: ButtonInteraction<'cached'>) => {
          if (i.customId.split('-')[1] !== botResponse.id) return;
          if (i.user.id !== message.author.id) return;
          await botResponse.delete();
        });
      }, 50);
      break;
    }

    default:
      return message.channel.send('Invalid command.');
  }
};
