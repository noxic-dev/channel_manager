import {
  ApplicationCommandOptionType,
  type ChatInputCommandInteraction,
  type TextChannel,
} from 'discord.js';

export default {
  options: [
    {
      name: 'amount',
      description: 'The amount of messages to delete',
      type: ApplicationCommandOptionType.Number,
      required: true,
    },
  ],
  permissions: ['ManageMessages'],
  callback: async (interaction: ChatInputCommandInteraction) => {
    const channel = interaction.channel as TextChannel;
    const clearAmount = interaction.options.getNumber('amount');
    if (!clearAmount) throw new Error('You must specify an amount');
    if (clearAmount > 500)
      throw new Error("You can't delete more than 500 messages");

    if (clearAmount <= 0)
      throw new Error("You can't delete less than 1 message");

    const splitChunks = splitNumber(clearAmount, 100);
    interaction.deferReply({ ephemeral: true });
    for await (const chunk of splitChunks) {
      await channel.bulkDelete(chunk);
    }

    const purgedMessage = await interaction.editReply({
      content: `Deleted ${clearAmount} messages`,
    });

    setTimeout(() => {
      purgedMessage.delete().catch();
    }, 5_000);
  },
};

function splitNumber(num: number, chunkSize: number): number[] {
  const chunks = [];
  while (num > 0) {
    const part = Math.min(chunkSize, num);
    chunks.push(part);
    num -= part;
  }

  return chunks;
}
