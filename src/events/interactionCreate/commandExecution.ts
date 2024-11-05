import { commands } from '../ready/clientWake';
import config from '../../../config.json';
export default async (interaction: any) => {
  if (interaction.isCommand()) {
    const commandHandler = commands.find(
      (c: any) => c.name === interaction.commandName
    ).handler;
    if (commandHandler) {
      const botMember = interaction.guild.members.fetch(
        interaction.client.user.id
      );
      const interactionMember = interaction.guild.members.fetch(
        interaction.user.id
      );
      if (
        !commandHandler.permissions.every((permission: string) =>
          interaction.member.permissions.has(permission)
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
        !commandHandler.permissions.every((permission: string) =>
          interaction.guild.members.me.permissions.has(permission)
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
