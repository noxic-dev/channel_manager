import type { Message } from 'discord.js';

let messageArray: {
  messageId: string;
  content: string;
  attachments: string[];
  authorId: string;
  channelId: string;
  timestamp: number;
  embeds: object[];
}[] = [];

export default (message: Message): unknown => {
  const messageObject = {
    messageId: message.id,
    content: message.content,
    attachments: message.attachments.map((attachment) => attachment.url),
    authorId: message.author.id,
    channelId: message.channel.id,
    timestamp: Date.now(),
    embeds: message.embeds.map((embed) => embed.toJSON())
  };

  // Push message to the array
  messageArray.push(messageObject);

  // Schedule deletion of the message from the array after 1 or 1:30 minutes
  setTimeout(() => {
    messageArray = messageArray.filter((msg) => msg.messageId !== message.id);
  }, 60 * 1000); // Change to 90 * 1000 for 1:30 minutes

  return;
};

export { messageArray };
