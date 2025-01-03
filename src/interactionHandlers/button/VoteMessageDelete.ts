import { ButtonInteraction, EmbedBuilder, Message } from 'discord.js';
import eventBus from '@/utils/connections/eventBus';
export default {
  customId: 'VoteMessageDelete:',
  callback: async (interaction: ButtonInteraction<'cached'>) => {
    if (!interaction.channel) return;
    const targetMessage = await interaction.channel.messages.fetch(
      interaction.customId.split(':')[1]
    );
    if (!targetMessage) return interaction.message.delete();
    const embed = new EmbedBuilder()
      .setTitle('Vote to Delete Message')
      .setDescription(
        `Do you want to delete this message?\n\`\`\`${targetMessage.content}\`\`\`\n\n**Yes Votes**: 0\n**No Votes**: 0\n\n**Status:** Voting in progress...`
      )
      .setColor('#5865F2');
    console.log('Emitting');
    eventBus.emit('voteMessageUpdate', {
      messageId: targetMessage.id,
      interaction: interaction,
      type: 'vote'
    });
  }
};
