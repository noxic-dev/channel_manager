import {
  ApplicationCommandType,
  ChatInputCommandInteraction,
  PermissionsBitField,
} from 'discord.js';
import { commands } from '@/events/ready/clientWake';
import * as config from '@config';
export default (interaction: ChatInputCommandInteraction): unknown => {
  if (interaction.commandType !== ApplicationCommandType.ChatInput) return;
  if (!interaction.inGuild()) return;
  if (interaction.user.bot) return;

  const localCommand = commands.SlashCommands.find(
    (c) => c.name === interaction.commandName
  );

  if (!localCommand)
    return interaction.reply({ content: 'Unknown command!', ephemeral: true });

  // Check permissions
  if (localCommand.permissions) {
    const hasPermissions = localCommand.permissions.every((p) =>
      (interaction.member?.permissions as Readonly<PermissionsBitField>).has(p)
    );
    const botHasPermissions = localCommand.permissions.every((p) =>
      (interaction.member?.permissions as Readonly<PermissionsBitField>).has(p)
    );

    if (!hasPermissions)
      return interaction.reply({
        content: `You're missing permissions to run this command! \n-# Permissions: ${localCommand.permissions.join(
          ', '
        )}\n-# [Join our support server for help!](<https://discord.gg/mhsYUgFDbM>)`,
        ephemeral: true,
      });
    if (!botHasPermissions)
      return interaction.reply({
        content: `I'm missing permissions to run this command! \n-# Permissions: ${localCommand.permissions.join(
          ', '
        )}\n-# [Join our support server for help!](<https://discord.gg/mhsYUgFDbM>)`,
        ephemeral: true,
      });
  }

  // Execute command
  localCommand.callback(interaction, config).catch((err: Error) => {
    interaction.reply({
      content: `**Error :x:**\n\`\`\`js\n${err.message}\`\`\``,
      ephemeral: true,
    });
  });

  return;
};
