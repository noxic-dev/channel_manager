import {
  ApplicationCommandType,
  ContextMenuCommandInteraction,
  EmbedBuilder,
  Message,
  TextChannel
} from 'discord.js';

export default {
  type: ApplicationCommandType.Message,
  // databaseRequired: true,
  callback: async (
    interaction: ContextMenuCommandInteraction
  ): Promise<unknown> => {
    // Ensure the interaction is a message context menu command
    if (!interaction.isMessageContextMenuCommand()) return;

    const targetMessage = interaction.targetMessage as Message;

    // Ensure the channel is a text-based channel
    if (!interaction.channel || !(interaction.channel instanceof TextChannel)) {
      await interaction.reply({
        content: 'This command can only be used in a text-based channel.',
        ephemeral: true
      });
      return;
    }

    const channel = interaction.channel;

    // Create the voting embed
    const embed = new EmbedBuilder()
      .setTitle('Vote to Delete Message')
      .setDescription(
        `Do you want to delete this message?\n\`\`\`${targetMessage.content}\`\`\`\n\n👍 **Yes Votes**: 0\n👎 **No Votes**: 0\n\n**Status:** Voting in progress...`
      )
      .setColor('#5865F2');

    // Reply to the targeted message without mentioning the user
    const voteMessage = await targetMessage.reply({
      embeds: [embed],
      allowedMentions: { repliedUser: false }
    });

    // Add reactions for voting
    await voteMessage.react('👍');
    await voteMessage.react('👎');

    // Set up reaction collector
    const filter = (reaction: any, user: any) =>
      ['👍', '👎'].includes(reaction.emoji.name) && !user.bot;

    const collector = voteMessage.createReactionCollector({
      filter,
      time: 30000 // 30 seconds
    });

    let yesVotes = 0;
    let noVotes = 0;

    collector.on('collect', () => {
      // Update vote counts
      yesVotes = voteMessage.reactions.cache.get('👍')?.count ?? 0;
      noVotes = voteMessage.reactions.cache.get('👎')?.count ?? 0;

      const totalVotes = yesVotes + noVotes;
      const percentageYes = totalVotes > 0 ? (yesVotes / totalVotes) * 100 : 0;

      // Update embed with the latest voting stats
      embed.setDescription(
        `Do you want to delete this message?\n\`\`\`${
          targetMessage.content
        }\`\`\`\n\n👍 **Yes Votes**: ${yesVotes}\n👎 **No Votes**: ${noVotes}\n\n**Status:** ${
          percentageYes >= 75
            ? 'The vote passed! The message will be deleted.'
            : 'Voting in progress...'
        }`
      );

      voteMessage.edit({ embeds: [embed] });

      // Stop the collector if 75% of votes are yes
      if (percentageYes >= 75) collector.stop('Vote passed');
    });

    collector.on('end', (_, reason) => {
      if (reason === 'Vote passed') {
        targetMessage.delete().catch(() => {
          channel.send('Failed to delete the message.');
        });

        embed
          .setColor('#57F287')
          .setDescription(
            `Do you want to delete this message?\n\`\`\`${targetMessage.content}\`\`\`\n\n👍 **Yes Votes**: ${yesVotes}\n👎 **No Votes**: ${noVotes}\n\n**Status:** Message deleted successfully!`
          );
      } else {
        embed
          .setColor('#ED4245')
          .setDescription(
            `Do you want to delete this message?\n\`\`\`${targetMessage.content}\`\`\`\n\n👍 **Yes Votes**: ${yesVotes}\n👎 **No Votes**: ${noVotes}\n\n**Status:** The vote failed. The message will not be deleted.`
          );
      }

      voteMessage.edit({ embeds: [embed] });
    });

    await interaction.reply({ content: 'Vote started!', ephemeral: true });
  }
};
