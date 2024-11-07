import { Message } from 'discord.js';

export default {
  options: [
    {
      name: 'amount',
      description: 'The amount of messages to delete',
      type: 10,
      required: true,
    },
  ],
  permissions: ['ManageMessages'],
  // @ts-ignore
  callback: async (interaction, guild, channel, config) => {
    const clearAmount = interaction.options.getNumber('amount');
    if (clearAmount > 500)
      throw new Error("You can't delete more than 500 messages");

    if (clearAmount <= 0)
      throw new Error("You can't delete less than 1 message");

    function splitNumber(num: number, chunkSize: number): number[] {
      const chunks = [];
      while (num > 0) {
        const part = Math.min(chunkSize, num);
        chunks.push(part);
        num -= part;
      }
      return chunks;
    }

    const splitChunks = splitNumber(clearAmount, 100);
    for await (const chunk of splitChunks) {
      await channel.bulkDelete(chunk);
    }
    return interaction
      .reply({
        content: `Deleted ${clearAmount} messages`,
      })
      .then((msg: Message) => setTimeout(() => msg.delete(), 5000));
  },
};
