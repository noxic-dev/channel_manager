import {
    MessageFlags,
    PermissionFlagsBits,
    type ChatInputCommandInteraction,
} from 'discord.js';
export default {
    permissions: [PermissionFlagsBits.SendMessages],

    callback: (interaction: ChatInputCommandInteraction): unknown => {
        return interaction.reply({
            content: interaction.client.ws.ping.toString(),
            flags: MessageFlags.Ephemeral,
        });
    },
};
