import { ButtonInteraction } from 'discord.js';
import eventBus from '@/utils/connections/eventBus';
export default {
  customId: 'VoteMessageDelete:',
  callback: async (interaction: ButtonInteraction<'cached'>) => {
    if (!interaction.channel) return;
    const targetMessage = await interaction.channel.messages.fetch(
      interaction.customId.split(':')[1]
    );
    if (!targetMessage) return interaction.message.delete();
    eventBus.emit('voteMessageUpdate', {
      messageId: targetMessage.id,
      interaction: interaction,
      type: 'vote'
    });
  }
};
