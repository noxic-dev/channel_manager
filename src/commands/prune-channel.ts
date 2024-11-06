import {
  ActionRowBuilder,
  EmbedBuilder,
  ButtonBuilder,
  ButtonStyle,
} from 'discord.js';

export default {
  permissions: ['ManageChannels'],
  // @ts-ignore
  callback: async (interaction, guild, channel, config) => {
    const isEnabledInGuild = true;
    if (isEnabledInGuild) {
      const channelPosition = channel.position;
      console.log(channelPosition);
      if (isNaN(channelPosition))
        throw new Error(
          'This channel does not have a position in the category!'
        );
      const pruneEmbed = new EmbedBuilder()
        .setColor('Blurple') // Blurple color
        .setTitle('Warning: Pruning Channel')
        .setDescription(
          'Pruning this channel will result in **deletion of the existing channel** and creation of a **duplicate channel**. This process will:'
        )
        .addFields({
          name: 'Effects:',
          value:
            '• **Delete all webhooks** associated with the current channel\n• **Change the Channel ID**, affecting any references to the original ID\n-# We are not liable for any actions that may or may not happen by using this command!',
        })
        .setFooter({
          text: 'Consider these changes before proceeding with channel pruning.',
        });

      const buttonRow = new ActionRowBuilder().addComponents(
        new ButtonBuilder()
          .setStyle(ButtonStyle.Success)
          .setLabel('Cancel')
          .setCustomId('cancel_prune'),
        new ButtonBuilder()
          .setStyle(ButtonStyle.Danger)
          .setLabel('Confirm')
          .setCustomId('confirm_prune')
      );

      interaction.reply({
        embeds: [pruneEmbed],
        components: [buttonRow],
        ephemeral: true,
      });

      const filter = (i: any) => i.user.id === interaction.user.id;
      const collector = interaction.channel.createMessageComponentCollector({
        filter,
        time: 15000,
      });
      collector.on('collect', async (i: any) => {
        if (i.customId === 'cancel_prune') {
          await i.update({
            content: 'Canceled!',
            embeds: [],
            components: [],
            ephemeral: true,
          });
          collector.stop();
        } else if (i.customId === 'confirm_prune') {
          const channelPrunedEmbed = new EmbedBuilder()
            .setColor('DarkButNotBlack')
            .setDescription('Channel has been successfully nuked!')
            .setImage('https://c.tenor.com/oikhN7oqj3kAAAAC/tenor.gif')
            .addFields(
              {
                name: 'Add ChannelManager to Your Server',
                value:
                  '[Click here to add ChannelManager](https://top.gg/bot/1211346964554186842)',
                inline: true,
              },
              {
                name: 'Vote for ChannelManager',
                value:
                  '[Click here to vote](https://top.gg/bot/1211346964554186842/vote)',
                inline: true,
              }
            )
            .setFooter({ text: 'ChannelManager' })
            .setTimestamp(new Date());
          const newChannel = await i.channel.clone();
          newChannel.setPosition(channelPosition);
          newChannel.send({
            embeds: [channelPrunedEmbed],
          });
          i.channel.delete();
        }
      });
    } else throw new Error('This command is disabled in this guild.');
  },
};
