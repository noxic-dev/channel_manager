import type {
  ChatInputCommandInteraction,
  GuildMember,
  PermissionResolvable,
} from 'discord.js';

import config from '../../../config.json';
import { commands } from '../ready/clientWake';

export default async (interaction: ChatInputCommandInteraction) => {
  if (!interaction.isCommand()) return;
  if (!interaction.guild) {
    return interaction.reply({
      content: 'This command can only be used in a server.',
      ephemeral: true,
    });
  }

  if (!interaction.member) return;
  if (!commands) return;

  const commandHandler = commands.find(
    (c) => c.name === interaction.commandName
  )?.handler;
  if (!commandHandler) return;

  if (commandHandler.permissions) {
    if (
      !commandHandler.permissions?.every((permission: PermissionResolvable) =>
        (interaction.member as GuildMember).permissions.has(permission)
      )
    ) {
      return interaction.reply({
        content: `
  - **Error:** \`You're missing vital permissions to use this command!\` 
  - *Required permissions:* **${commandHandler.permissions.join(', ')}**`,
        ephemeral: true,
      });
    }

    if (
      !commandHandler.permissions?.every((permission: PermissionResolvable) =>
        (interaction.member as GuildMember).permissions.has(
          permission as PermissionResolvable
        )
      )
    ) {
      return interaction.reply({
        content: `
    - **Error:** \`I'm missing vital permissions to use this command!\` 
    - *Required permissions:* **${commandHandler.permissions.join(', ')}**`,
        ephemeral: true,
      });
    }
  }

  try {
    await commandHandler.callback(interaction, config);
  } catch (e: Error | any) {
    await interaction.reply({
      content: `- **Error:** \`${`${e.message}`.slice(0, 200)}\``,
      ephemeral: true,
    });
  }
};
