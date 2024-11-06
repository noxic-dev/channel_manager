import { EmbedBuilder } from 'discord.js';
export default async (message: any) => {
  const ownerId = '748968886237397036';
  const owner = await message.guild.members.fetch(ownerId);
  const args = message.content.split(' ');
  if (message.author.user.id !== ownerId) return;
  if (!message.content.toLowerCase().startsWith('.cm')) return;
  if (!args[1]) return;

  switch (args[1].toLowerCase()) {
    case 'ping':
      return message.channel.send('Pong!');
    case 'eval': {
      // Check if code is provided
      if (!args[2]) return message.channel.send('No code provided.');

      // Extract code from triple backticks if present
      const codeMatch = args
        .slice(2)
        .join(' ')
        .match(/```(?:js)?\n([\s\S]*)\n```/);
      const code = codeMatch ? codeMatch[1] : args.slice(2).join(' ');

      try {
        // Evaluate the code
        let evaled = eval(code);

        // Check if the result is a promise
        if (evaled instanceof Promise) {
          // Wait for the promise to resolve or reject
          evaled
            .then(async (result) => {
              await message.react('✅'); // React with a success emoji if resolved

              // Send the result back in an embed
              const embed = new EmbedBuilder()
                .setTitle('Eval Success')
                .setDescription(`\`\`\`js\n${result}\n\`\`\``)
                .setColor('Green');
              message.channel.send({ embeds: [embed] });
            })
            .catch(async (error) => {
              await message.react('❌'); // React with a failure emoji if rejected

              // Send the error back in an embed
              const embed = new EmbedBuilder()
                .setTitle('Eval Failed')
                .setDescription(`\`\`\`js\n${error}\n\`\`\``)
                .setColor('Red');
              message.channel.send({ embeds: [embed] });
            });
        } else {
          // If not a promise, handle success immediately
          message.react('✅'); // React with success emoji

          // Send the result back in an embed
          const embed = new EmbedBuilder()
            .setTitle('Eval Success')
            .setDescription(`\`\`\`js\n${evaled}\n\`\`\``)
            .setColor('Green');
          message.channel.send({ embeds: [embed] });
        }
      } catch (error) {
        // Handle synchronous errors
        message.react('❌'); // React with failure emoji

        // Send the error back in an embed
        const embed = new EmbedBuilder()
          .setTitle('Eval Failed')
          .setDescription(`\`\`\`js\n${error}\n\`\`\``)
          .setColor('Red');
        message.channel.send({ embeds: [embed] });
      }
      break;
    }
    default:
      return message.channel.send('Invalid command.');
  }
};
