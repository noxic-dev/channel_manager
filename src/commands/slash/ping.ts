import { MessageFlags, type ChatInputCommandInteraction } from 'discord.js';
export default {
    callback: (interaction: ChatInputCommandInteraction): unknown => {
        return interaction.reply({
            content: interaction.client.ws.ping.toString(),
            flags: MessageFlags.Ephemeral,
        });
    },
};
