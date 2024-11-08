import { commands } from '../ready/clientWake';
import config from '../../../config.json';
import {
  ChatInputCommandInteraction,
  Guild,
  GuildMember,
  PermissionResolvable,
  PermissionsBitField,
  TextChannel,
} from 'discord.js';
export default async (interaction: ChatInputCommandInteraction) => {
  if (interaction.isCommand()) {
    if (!interaction.guild)
      return interaction.reply({
        content: 'This command can only be used in a server.',
        ephemeral: true,
      });
    if (!interaction.member) return;
    const commandHandler = commands.find(
      (c: TextChannel) => c.name === interaction.commandName
    ).handler;
    if (commandHandler) {
      const botMember = interaction.guild.members.fetch(
        interaction.client.user.id
      );
      const interactionMember = interaction.guild.members.fetch(
        interaction.user.id
      );
      if (
        !commandHandler.permissions.every((permission: PermissionResolvable) =>
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
        !commandHandler.permissions.every((permission: PermissionResolvable) =>
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
      try {
        await commandHandler.callback(
          interaction,
          interaction.guild,
          interaction.channel,
          config
        );
      } catch (e: string | any) {
        await interaction.reply({
          content: `Oh no.. An error has occurred. Please try again later! \n\n\`${e
            .toString()
            .slice(0, 50)}\``,
          ephemeral: true,
        });
        console.error('Error executing command:', e); // Log the full error for debugging
      }
    }
  }
};
