import { MessageFlags, type ButtonInteraction } from 'discord.js';

export default {
  customId: 'DeleteResponse:',
  callback: async (
    interaction: ButtonInteraction<'cached'>
  ): Promise<unknown> => {
    const messageOwnerId = interaction.customId.split(':')[2];

    if (
      interaction.user.id !== messageOwnerId &&
      !interaction.member.permissions.has('ManageMessages')
    )
      return interaction.reply({
        content: 'You do not have permission to delete this message.',
        flags: MessageFlags.Ephemeral
      });

    await interaction.message.delete();
  }
};
