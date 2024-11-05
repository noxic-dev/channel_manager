import { startupTime } from '@/types/../source';
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
  // @ts-ignore
  callback: async (interaction, guild, channel, config): Promise<void> => {
    return interaction.reply({ content: startupTime, ephemeral: true });
  },
};
