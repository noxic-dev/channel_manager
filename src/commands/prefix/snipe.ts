import { EmbedBuilder, type Message, TextChannel } from 'discord.js';

import { messageArray } from '@/events/messageDelete/snipeStore';

export default {
  callback: (message: Message): unknown => {
    if (!message.channel.isTextBased() || !message.channel.isSendable()) return;

    const snipedMessages = messageArray.filter(
      (msg) =>
        msg.channelId === message.channel.id &&
        Date.now() - msg.timestamp < 60 * 1000
    );

    if (snipedMessages.length === 0) {
      return message.reply(
        'There are no messages to snipe in this channel from the past minute.'
      );
    }

    snipedMessages.forEach((snipedMessage) => {
      if (!(message.channel instanceof TextChannel)) return;

      const snipeEmbed = new EmbedBuilder()
        .setColor('#2f3136')
        .setAuthor({
          name: `${snipedMessage.authorId}`,
          iconURL:
            message.client.users.cache
              .get(snipedMessage.authorId)
              ?.displayAvatarURL() || ''
        })
        .setDescription(snipedMessage.content || 'No content')
        .setFooter({ text: 'The latest snipes in the last 60 seconds' })
        .setTimestamp(snipedMessage.timestamp);

      if (snipedMessage.attachments.length > 0) {
        snipedMessage.attachments.forEach((attachment) => {
          if (attachment.match(/\.(jpeg|jpg|gif|png|webp|mp4|mov)$/i)) {
            snipeEmbed.addFields({
              name: 'Attachment',
              value: attachment
            });
          } else {
            snipeEmbed.addFields({
              name: 'Other Attachment',
              value: attachment
            });
          }
        });
      }

      if (snipedMessage.embeds.length > 0) {
        snipedMessage.embeds.forEach((embed) => {
          const embedObject = EmbedBuilder.from(embed);
          (message.channel as TextChannel).send({ embeds: [embedObject] });
        });
      }

      message.channel.send({ embeds: [snipeEmbed] });
    });

    return;
  }
};
