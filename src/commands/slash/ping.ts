import { startupTime } from '@/types/../source';
import {
  ApplicationCommandOptionType,
  type ChatInputCommandInteraction
} from 'discord.js';
export default {
  options: [
    {
      name: 'user',
      description: 'The user to ping',
      type: ApplicationCommandOptionType.String,
      required: false
    }
  ],
  permissions: ['SendMessages'],

  callback: (interaction: ChatInputCommandInteraction): unknown => {
    return interaction.reply({ content: startupTime, ephemeral: true });
  }
};
