import {
  EmbedBuilder,
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  CommandInteraction,
} from 'discord.js';

interface Feature {
  name: string;
  machineName: string;
  description: string;
  permissions: string;
  currentState: 'Enabled' | 'Disabled';
}

const features: Feature[] = [
  {
    name: 'Prune channel',
    machineName: 'nuke',
    description: 'Clears every message in a channel.',
    permissions: 'ManageChannels',
    currentState: 'Enabled',
  },
  {
    name: 'Archive channel',
    machineName: 'vcr',
    description:
      'Archives a channel sssssssssssssssssssssssssssssssto free up space.',
    permissions: 'ManageChannels',
    currentState: 'Disabled',
  },
  // Add more features as needed
];

// Helper function to add dynamic padding based on embed content length and label length
function createPaddedLabel(
  label: string,
  embedLength: number,
  maxLabelLength: number
) {
  const basePadding = 4; // base padding amount
  const paddingAmount = Math.max(
    basePadding,
    Math.floor(embedLength / 50),
    Math.ceil(maxLabelLength / 10)
  ); // Adjust padding based on length
  const padding = ' '.repeat(paddingAmount); // Create padding with regular spaces
  return `.${padding}${label}${padding}.`;
}

export default {
  options: [
    {
      name: 'type',
      description: 'What type of config to edit',
      type: 3, // STRING type for Discord API
      required: true,
      choices: [
        {
          name: 'Features',
          value: 'features',
        },
      ],
    },
  ],
  permissions: ['ManageGuild'],
  callback: async (interaction: any) => {
    const type = interaction.options.getString('type');
    if (type !== 'features') {
      return interaction.reply({
        content: 'Feature not implemented yet.',
        ephemeral: true,
      });
    }

    const itemsPerPage = 1;
    let currentPage = 0;

    // Helper function to generate the embed for the current page
    const generateEmbed = (page: number) => {
      const start = page * itemsPerPage;
      const end = start + itemsPerPage;
      const currentFeatures = features.slice(start, end);

      const embed = new EmbedBuilder()
        .setColor('Blurple')
        .setTitle('Config: Features')
        .setFooter({
          text: `Page ${page + 1} of ${Math.ceil(
            features.length / itemsPerPage
          )}`,
        });

      // Add each feature's details to the embed
      currentFeatures.forEach((feature) => {
        embed.addFields({
          name: `● **${feature.name}**`,
          value: `
          **━━━━━━━━━━━━━━━━━**
           ○ **Description:** ${feature.description}
           ○ **Permissions:** ${feature.permissions}
           ○ **Current State:** ${feature.currentState}
                    `,
          inline: false,
        });
      });

      return embed;
    };

    // Initial calculation of embed content length and label length for dynamic button padding
    let embedContentLength = 0;
    let maxLabelLength = 0;
    const updateEmbedContentLength = () => {
      const embed = generateEmbed(currentPage);
      embedContentLength =
        embed.data?.fields?.reduce(
          (acc, field) => acc + field.name.length + field.value.length,
          0
        ) || 0;
      maxLabelLength = Math.max(
        ...features.map((feature) => feature.name.length)
      );
    };

    updateEmbedContentLength();

    // Button rows with dynamically padded labels
    const currentFeature = features[currentPage];

    const buttonRow1 = new ActionRowBuilder<ButtonBuilder>().addComponents(
      new ButtonBuilder()
        .setCustomId(`config:enable:feature:${currentFeature.machineName}`)
        .setLabel(
          createPaddedLabel('Enable', embedContentLength, maxLabelLength)
        )
        .setStyle(ButtonStyle.Success),
      new ButtonBuilder()
        .setCustomId(`config:disable:feature:${currentFeature.machineName}`)
        .setLabel(
          createPaddedLabel('Disable', embedContentLength, maxLabelLength)
        )
        .setStyle(ButtonStyle.Danger)
    );

    const buttonRow2 = new ActionRowBuilder<ButtonBuilder>().addComponents(
      new ButtonBuilder()
        .setCustomId('previous')
        .setLabel('Previous')
        .setStyle(ButtonStyle.Primary)
        .setDisabled(currentPage === 0),
      new ButtonBuilder()
        .setCustomId('next')
        .setLabel('Next')
        .setStyle(ButtonStyle.Primary)
        .setDisabled(
          currentPage === Math.ceil(features.length / itemsPerPage) - 1
        )
    );

    // Initial message with the first embed
    const embedMessage = await interaction.reply({
      embeds: [generateEmbed(currentPage)],
      components: [buttonRow1, buttonRow2],
      fetchReply: true,
      ephemeral: true,
    });

    // Collector for button interactions
    const collector = embedMessage.createMessageComponentCollector({
      filter: (i: any) => i.user.id === interaction.user.id,
      time: 1000 * 60 * 5, // 5-minute timeout
    });

    collector.on('collect', async (btnInteraction: any) => {
      // Handle button interactions
      if (
        btnInteraction.customId === 'next' &&
        currentPage < Math.ceil(features.length / itemsPerPage) - 1
      ) {
        currentPage++;
      } else if (btnInteraction.customId === 'previous' && currentPage > 0) {
        currentPage--;
      }

      // Update embed content length and label length
      updateEmbedContentLength();

      // Update current feature
      const currentFeature = features[currentPage];

      // Update buttons' disabled states and labels with new padding
      buttonRow1.components[0]
        .setCustomId(`config:enable:feature:${currentFeature.machineName}`)
        .setLabel(
          createPaddedLabel('Enable', embedContentLength, maxLabelLength)
        );
      buttonRow1.components[1]
        .setCustomId(`config:disable:feature:${currentFeature.machineName}`)
        .setLabel(
          createPaddedLabel('Disable', embedContentLength, maxLabelLength)
        );
      buttonRow2.components[0].setDisabled(currentPage === 0);
      buttonRow2.components[1].setDisabled(
        currentPage === Math.ceil(features.length / itemsPerPage) - 1
      );

      if (!btnInteraction.customId.startsWith('config:')) {
        await btnInteraction.update({
          embeds: [generateEmbed(currentPage)],
          components: [buttonRow1, buttonRow2],
        });
      }
    });

    collector.on('end', async () => {
      // Disable all buttons after timeout
      buttonRow1.components.forEach((button) => button.setDisabled(true));
      buttonRow2.components.forEach((button) => button.setDisabled(true));
      await embedMessage.delete();
    });
  },
};
