import { EmbedBuilder, type Message } from 'discord.js';

import { addDeleteButton } from '@/utils/functions/addDeleteButton';

export default {
  ownerOnly: true,
  callback: async (
    message: Message,
    config: void,
    args: string[]
  ): Promise<unknown> => {
    if (!message.channel.isSendable()) return;
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

    console.log = (...args): void => {
      const log = args.join(' ');
      consoleOutput += `${log}\n`;
      originalConsoleLog(...args);
    };

    let botResponse;
    try {
      const asyncEval = async (): Promise<unknown> => await eval(code);
      let evaled = await asyncEval();

      console.log = originalConsoleLog;

      if (evaled instanceof Promise) {
        evaled = await evaled;
        await message.react('✅');
      }

      const finalConsoleOutput = consoleOutput.trim() || 'No logs during eval.';

      const embed = new EmbedBuilder()
        .setTitle('Eval Success')
        .setDescription(`\`\`\`js\n${originalCode}\n\`\`\``)
        .addFields({
          name: 'Console Output',
          value: `\`\`\`js\n${finalConsoleOutput.slice(0, 2_000)}\n\`\`\``
        })
        .setColor('Green');
      botResponse = await message.channel.send({ embeds: [embed] });
      addDeleteButton(botResponse, message);
    } catch (error: unknown) {
      console.log = originalConsoleLog;
      message.react('❌');

      const errorEmbed = new EmbedBuilder()
        .setTitle('Eval Failed')
        .setDescription(`\`\`\`js\n${`${error}`.slice(0, 2_000)}\n\`\`\``)
        .setColor('Red');
      botResponse = await message.channel.send({ embeds: [errorEmbed] });
      addDeleteButton(botResponse, message);
    }
    await message.delete().catch(console.error);

    return;
  }
};
