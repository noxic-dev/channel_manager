import { ActionRowBuilder, ButtonBuilder } from '@discordjs/builders';
import {
  ActionRowComponentData,
  ActionRowData,
  ApplicationCommandType,
  ButtonComponentData,
  ButtonStyle,
  Component,
  ComponentType,
  ContextMenuCommandInteraction,
  EmbedBuilder,
  Message,
  TextChannel
} from 'discord.js';
import eventBus from '@/utils/connections/eventBus';

export default {
  type: ApplicationCommandType.Message,
  // databaseRequired: true,
  callback: async (
    interaction: ContextMenuCommandInteraction
  ): Promise<unknown> => {
    if (!interaction.isMessageContextMenuCommand()) return;

    const targetMessage = interaction.targetMessage as Message;

    if (targetMessage.member?.permissions.has('ManageMessages'))
      throw new Error(
        "You can't vote to delete a message sent by a privileged user."
      );

    if (!interaction.channel || !(interaction.channel instanceof TextChannel)) {
      throw new Error(
        "'This command can only be used in a text-based channel.'"
      );
    }
    const buttons = new ActionRowBuilder<ButtonBuilder>().addComponents(
      new ButtonBuilder()
        .setStyle(ButtonStyle.Secondary)
        .setLabel('Yes')
        .setCustomId(`VoteMessageDelete:${targetMessage.id}:yes`),
      new ButtonBuilder()
        .setStyle(ButtonStyle.Secondary)
        .setLabel('No')
        .setCustomId(`VoteMessageDelete:${targetMessage.id}:no`)
    );
    const voteMessage = await targetMessage.reply({
      content: '**Initializing vote...**',
      allowedMentions: { repliedUser: false },
      components: [buttons]
    });
    eventBus.emit('voteMessageInitiated', {
      messageId: targetMessage.id,
      interaction,
      voteMessage
    });

    await interaction.reply({ content: 'Vote started!', ephemeral: true });
  }
};
