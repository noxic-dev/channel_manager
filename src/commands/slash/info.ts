import {
    type ChatInputCommandInteraction,
    EmbedBuilder,
    Guild
} from "discord.js";

export default {
    callback: (interaction: ChatInputCommandInteraction): void => {
        if (!(interaction.guild instanceof Guild))
            throw new Error("This command can only be used within a guild!");

        const guild = interaction.guild;

        const embed = new EmbedBuilder()
            .setTitle("General Guild Information")
            .setColor("#5865F2") // Blurple color similar to Discord's theme
            .setThumbnail(guild.iconURL({ forceStatic: false, size: 1024 }))
            .addFields(
                { name: "Guild Name", value: `\`${guild.name}\``, inline: true },
                { name: "Guild ID", value: `\`${guild.id}\``, inline: true },
                {
                    name: "Members Count",
                    value: `\`${guild.memberCount}\``,
                    inline: true
                },
                {
                    name: "Bot Joined Date",
                    value: `\`${new Date(guild.joinedTimestamp).toDateString()}\``,
                    inline: true
                },
                {
                    name: "Days in Guild",
                    value: `\`${Math.floor(
                        (Date.now() - guild.joinedTimestamp) / (1000 * 60 * 60 * 24)
                    )} days\``,
                    inline: true
                },
                {
                    name: "Invite to Add the Bot",
                    value:
            "[Click here to add the bot!](https://your-bot-invite-link.com)"
                }
            )
            .setFooter({ text: "Thanks for having me in your server!" })
            .setTimestamp();

        // Example usage: reply with the embed
        interaction.reply({ embeds: [embed] });
    }
};