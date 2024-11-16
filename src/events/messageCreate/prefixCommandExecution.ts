import { Message, PermissionsBitField } from 'discord.js';
import { commands } from '@/events/ready/clientWake';
import * as config from '@config';
import util from 'util';

export default (interaction: Message): unknown => {
  let prefix = '';
  const args = interaction.content.split(' ');
  if (interaction.author.bot) return;
  if (interaction.client.user.id !== '1303334967949922396') prefix = 'cm';
  else prefix = 'cm-dev';
  if (args[0] !== prefix) return;

  const localCommand = commands.PrefixCommands.find((c) => c.name === args[1]);

  if (!localCommand) return console.log('No local command');

  // Handle permissions
  if (localCommand.permissions) {
    const hasPermissions = localCommand.permissions.every((p) =>
      (interaction.member?.permissions as Readonly<PermissionsBitField>).has(p)
    );
    const botHasPermissions = localCommand.permissions.every((p) =>
      (interaction.member?.permissions as Readonly<PermissionsBitField>).has(p)
    );

    if (!hasPermissions) return interaction.react('❌');
    if (!botHasPermissions) return interaction.react('❌');
  }
  // Execute the command
  localCommand.callback = util.promisify(localCommand.callback);
  localCommand.callback(interaction, config, args).catch((err: Error) =>
    interaction.reply({
      content: `**Error :x:**\n\`\`\`js\n${err.message}\`\`\``,
    })
  );
};
