import type { Message } from 'discord.js';

export default {
  permissions: ['SendMessages'],
  callback: (message: Message): unknown => {
    message.reply('Pong!');

    return;
  }
};
