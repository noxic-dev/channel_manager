import * as config from "@config";
import {
    ApplicationCommandType,
    type ChatInputCommandInteraction,
    type PermissionsBitField
} from "discord.js";

import { commands } from "@/events/ready/clientWake";
import { sql } from "@/utils/connections/postgresDb";
export default async (
    interaction: ChatInputCommandInteraction
): Promise<unknown> => {
    if (interaction.commandType !== ApplicationCommandType.ChatInput) return;
    if (!interaction.inGuild())
        return interaction.reply({
            content: "This command can only be used within a guild!",
            ephemeral: true
        });

    let commandShouldBeCancelled = false;

    const localCommand = commands.SlashCommands.find(
        (c) => c.name === interaction.commandName
    );

    if (!localCommand)
        return interaction.reply({ content: "Unknown command!", ephemeral: true });

    // Check permissions
    if (localCommand.permissions) {
        const hasPermissions = localCommand.permissions.every((p) =>
            (interaction.member?.permissions as Readonly<PermissionsBitField>).has(p)
        );
        const botHasPermissions = localCommand.permissions.every((p) =>
            (interaction.member?.permissions as Readonly<PermissionsBitField>).has(p)
        );

        if (!hasPermissions)
            return interaction.reply({
                content: `You're missing permissions to run this command! \n-# Permissions: ${localCommand.permissions.join(
                    ", "
                )}\n-# [Join our support server for help!](<https://discord.gg/mhsYUgFDbM>)`,
                ephemeral: true
            });
        if (!botHasPermissions)
            return interaction.reply({
                content: `I'm missing permissions to run this command! \n-# Permissions: ${localCommand.permissions.join(
                    ", "
                )}\n-# [Join our support server for help!](<https://discord.gg/mhsYUgFDbM>)`,
                ephemeral: true
            });
    }

    if (localCommand.databaseRequired) {
        console.log(
            "Database is required for this command, Checking database...",
            interaction.guild!.id
        );
        await sql
            .query("SELECT * FROM features WHERE serverid = $1", [
                interaction.guild!.id
            ])
            .then((result) => {
                if (!result.rows[0])
                    sql.query("INSERT INTO features (serverid) VALUES ($1)", [
                        interaction.guild!.id
                    ]);

                const featureKey = `allow_${localCommand.name}`;
                if (!result.rows[0][featureKey]) {
                    interaction.reply({
                        content:
              "This command is disabled by the server administrators.\n-# **To enable this command, Run `/config` and click enable.** \n-# [Join our support server for help!](<https://discord.gg/mhsYUgFDbM>)",
                        ephemeral: true
                    });
                    commandShouldBeCancelled = true;

                    return;
                }

                return;
            });
    }
    // Execute command
    if (commandShouldBeCancelled) return;
    localCommand.callback(interaction, config).catch((err: Error) => {
        interaction.reply({
            content: `**Error :x:**\n\`\`\`js\n${err.message}\`\`\``,
            ephemeral: true
        });
    });

    return;
};