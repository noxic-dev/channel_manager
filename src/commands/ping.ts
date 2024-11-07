import { startupTime } from '@/types/../source';
import { ChatInputCommandInteraction, Guild, TextChannel } from 'discord.js';
export default {
  options: [
    {
      name: 'user',
      description: 'The user to ping',
      type: 3,
      required: false,
    },
  ],
  permissions: ['SendMessages'],

  callback: async (
    interaction: ChatInputCommandInteraction,
    guild: Guild,
    channel: TextChannel,
    config: any
  ) => {
    return interaction.reply({ content: startupTime, ephemeral: true });
  },
};
