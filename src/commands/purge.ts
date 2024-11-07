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
    if (clearAmount > 100)
      throw new Error("You can't delete more than 100 messages");

    if (clearAmount <= 0)
      throw new Error("You can't delete less than 1 message");

    await channel.bulkDelete(clearAmount);

    return interaction.reply({
      content: `Deleted ${clearAmount} messages`,
      ephemeral: true,
    });
  },
};
