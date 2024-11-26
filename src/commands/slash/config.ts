import {
    ActionRowBuilder,
    ApplicationCommandOptionType,
    ButtonBuilder,
    ButtonStyle,
    type ChatInputCommandInteraction,
    EmbedBuilder
} from "discord.js";

import type { Feature } from "@/types/global";

const features = [
    {
        name: "Prune channel",
        machineName: "nuke",
        description: "Clears every message in a channel.",
        permissions: "ManageChannels",
        currentState: "Enabled"
    },
    {
        name: "Archive channel",
        machineName: "vcr",
        description:
      "Archives a channel sssssssssssssssssssssssssssssssto free up space.",
        permissions: "ManageChannels",
        currentState: "Disabled"
    }
] satisfies Feature[];

function createPaddedLabel(
    label: string,
    embedLength: number,
    maxLabelLength: number
): string {
    const basePadding = 4;
    const paddingAmount = Math.max(
        basePadding,
        Math.floor(embedLength / 50),
        Math.ceil(maxLabelLength / 10)
    );
    const padding = " ".repeat(paddingAmount);

    return `.${padding}${label}${padding}.`;
}

export default {
    options: [
        {
            name: "type",
            description: "What type of config to edit",
            type: ApplicationCommandOptionType.String,
            required: true,
            choices: [
                {
                    name: "Features",
                    value: "features"
                }
            ]
        }
    ],
    permissions: ["ManageGuild"],
    callback: async (interaction: ChatInputCommandInteraction): Promise<void> => {
        const type = interaction.options.getString("type");
        if (type !== "features") {
            await interaction.reply({
                content: "Feature not implemented yet.",
                ephemeral: true
            });

            return;
        }

        const itemsPerPage = 1;
        let currentPage = 0;

        const generateEmbed = (page: number): EmbedBuilder => {
            const start = page * itemsPerPage;
            const end = start + itemsPerPage;
            const currentFeatures = features.slice(start, end);

            const embed = new EmbedBuilder()
                .setColor("Blurple")
                .setTitle("Config: Features")
                .setFooter({
                    text: `Page ${page + 1} of ${Math.ceil(
                        features.length / itemsPerPage
                    )}`
                });

            currentFeatures.forEach((feature) => {
                embed.addFields({
                    name: `● **${feature.name}**`,
                    value: `
          **━━━━━━━━━━━━━━━━━**
            ○ **Description:** ${feature.description}
            ○ **Permissions:** ${feature.permissions}
            ○ **Current State:** ${feature.currentState}
                    `,
                    inline: false
                });
            });

            return embed;
        };

        let embedContentLength = 0;
        let maxLabelLength = 0;
        const updateEmbedContentLength = (): void => {
            const embed = generateEmbed(currentPage);
            embedContentLength = embed.data.fields
                ? embed.data.fields.reduce(
                    (acc, field) => acc + field.name.length + field.value.length,
                    0
                )
                : 0;
            maxLabelLength
        = features.length > 0
                    ? Math.max(...features.map((feature) => feature.name.length))
                    : 0;

            return;
        };

        updateEmbedContentLength();

        const currentFeature = features[currentPage];

        const buttonRow1 = new ActionRowBuilder<ButtonBuilder>().addComponents(
            new ButtonBuilder()
                .setCustomId(`config:enable:feature:${currentFeature.machineName}`)
                .setLabel(
                    createPaddedLabel("Enable", embedContentLength, maxLabelLength)
                )
                .setStyle(ButtonStyle.Success),
            new ButtonBuilder()
                .setCustomId(`config:disable:feature:${currentFeature.machineName}`)
                .setLabel(
                    createPaddedLabel("Disable", embedContentLength, maxLabelLength)
                )
                .setStyle(ButtonStyle.Danger)
        );

        const buttonRow2 = new ActionRowBuilder<ButtonBuilder>().addComponents(
            new ButtonBuilder()
                .setCustomId("previous")
                .setLabel("Previous")
                .setStyle(ButtonStyle.Primary)
                .setDisabled(currentPage === 0),
            new ButtonBuilder()
                .setCustomId("next")
                .setLabel("Next")
                .setStyle(ButtonStyle.Primary)
                .setDisabled(
                    currentPage === Math.ceil(features.length / itemsPerPage) - 1
                )
        );

        const embedMessage = await interaction.reply({
            embeds: [generateEmbed(currentPage)],
            components: [buttonRow1, buttonRow2],
            fetchReply: true,
            ephemeral: true
        });

        const collector = embedMessage.createMessageComponentCollector({
            filter: (i) => i.user.id === interaction.user.id,
            time: 1_000 * 60 * 5 // 5-minute timeout
        });

        collector.on("collect", async (btnInteraction) => {
            if (
                btnInteraction.customId === "next"
        && currentPage < Math.ceil(features.length / itemsPerPage) - 1
            ) {
                currentPage++;
            } else if (btnInteraction.customId === "previous" && currentPage > 0) {
                currentPage--;
            }

            updateEmbedContentLength();

            const currentFeature = features[currentPage];

            buttonRow1.components[0]
                .setCustomId(`config:enable:feature:${currentFeature.machineName}`)
                .setLabel(
                    createPaddedLabel("Enable", embedContentLength, maxLabelLength)
                );
            buttonRow1.components[1]
                .setCustomId(`config:disable:feature:${currentFeature.machineName}`)
                .setLabel(
                    createPaddedLabel("Disable", embedContentLength, maxLabelLength)
                );
            buttonRow2.components[0].setDisabled(currentPage === 0);
            buttonRow2.components[1].setDisabled(
                currentPage === Math.ceil(features.length / itemsPerPage) - 1
            );

            if (!btnInteraction.customId.startsWith("config:")) {
                await btnInteraction.update({
                    embeds: [generateEmbed(currentPage)],
                    components: [buttonRow1, buttonRow2]
                });
            }
        });

        collector.on("end", async () => {
            buttonRow1.components.forEach((button) => button.setDisabled(true));
            buttonRow2.components.forEach((button) => button.setDisabled(true));
            await embedMessage.delete();
        });
    }
};