import { startupTime } from '@/types/../source';
import type { ChatInputCommandInteraction } from 'discord.js';

export default {
  options: [
    {
      name: 'user',
      description: 'The user to ping',
      type: 3,
      required: false
    }
  ],
  permissions: ['SendMessages'],

  callback: async (
    interaction: ChatInputCommandInteraction
  ) => {
    return interaction.reply({ content: startupTime, ephemeral: true });
  }
};