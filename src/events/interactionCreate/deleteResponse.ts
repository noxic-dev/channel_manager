import { MessageFlags, type ButtonInteraction } from 'discord.js';

export default async (
  interaction: ButtonInteraction<'cached'>
): Promise<unknown> => {
  if (!interaction.isButton()) return;
  if (!interaction.customId.startsWith('DeleteResponse:')) return;

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
};
