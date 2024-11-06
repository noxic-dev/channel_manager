import { EmbedBuilder } from 'discord.js';
import * as config from '@config';
export default async (message: any) => {
  const ownerId = config.ownerId;
  const owner = await message.guild.members.fetch(ownerId);
  const args = message.content.split(' ');
  if (!message.content.toLowerCase().startsWith('.cm')) return;
  if (!args[1]) return;
  if (message.author.id !== ownerId) return message.react('❌');

  switch (args[1].toLowerCase()) {
    case 'ping':
      return message.channel.send('Pong!');

    case 'eval': {
      if (!args[2]) return message.channel.send('No code provided.');

      let code = args.slice(2).join(' ');
      if (code.startsWith('```') && code.endsWith('```')) {
        code = code.slice(3, -3).trim();
      }

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
          consoleOutput.trim() || 'No logs during EVAL';

        const embed = new EmbedBuilder()
          .setTitle('Eval Success')
          .setDescription(`\`\`\`js\n${code}\n\`\`\``)
          .addFields({
            name: 'Console Output',
            value: `\`\`\`js\n${finalConsoleOutput.slice(0, 2000)}\n\`\`\``,
          })
          .setColor('Green');
        botResponse = await message.channel.send({ embeds: [embed] });
        setTimeout(() => {
          message.delete();
        }, 500);
      } catch (error: any) {
        console.log = originalConsoleLog;
        message.react('❌');

        const errorEmbed = new EmbedBuilder()
          .setTitle('Eval Failed')
          .setDescription(
            `\`\`\`js\n${error.toString().slice(0, 2000)}\n\`\`\``
          )
          .setColor('Red');
        botResponse = await message.channel.send({
          embeds: [errorEmbed],
        });
        setTimeout(() => {
          message.delete();
        }, 500);
      }
      setTimeout(() => {
        botResponse?.delete();
      }, 5000);
      break;
    }

    default:
      return message.channel.send('Invalid command.');
  }
};
