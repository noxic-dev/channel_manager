import * as config from '@config';
import {
    ApplicationCommandType,
    MessageFlags,
    type ChatInputCommandInteraction,
    type PermissionsBitField,
} from 'discord.js';

import { commands } from '@/events/ready/clientWake';
import { sql } from '@/utils/connections/postgresDb';
export default async (
    interaction: ChatInputCommandInteraction
): Promise<unknown> => {
    if (interaction.commandType !== ApplicationCommandType.ChatInput) return;
    if (!interaction.inGuild())
        return interaction.reply({
            content: 'This command can only be used within a guild!',
            flags: MessageFlags.Ephemeral,
        });

    let commandShouldBeCancelled = false;

    const localCommand = commands.SlashCommands.find(
        (c) => c.name === interaction.commandName
    );

    if (!localCommand)
        return interaction.reply({
            content: 'Unknown command!',
            flags: MessageFlags.Ephemeral,
        });

    // Check permissions
    if (localCommand.permissions) {
        const hasPermissions = localCommand.permissions.every((p) =>
            (
                interaction.member?.permissions as Readonly<PermissionsBitField>
            ).has(p)
        );
        const botHasPermissions = localCommand.permissions.every((p) =>
            (
                interaction.member?.permissions as Readonly<PermissionsBitField>
            ).has(p)
        );

        if (!hasPermissions)
            return interaction.reply({
                content: `You're missing permissions to run this command! \n-# Permissions: ${localCommand.permissions.join(
                    ', '
                )}\n-# [Join our support server for help!](<https://discord.gg/mhsYUgFDbM>)`,
                flags: MessageFlags.Ephemeral,
            });
        if (!botHasPermissions)
            return interaction.reply({
                content: `I'm missing permissions to run this command! \n-# Permissions: ${localCommand.permissions.join(
                    ', '
                )}\n-# [Join our support server for help!](<https://discord.gg/mhsYUgFDbM>)`,
                flags: MessageFlags.Ephemeral,
            });
    }

    if (localCommand.databaseRequired) {
        const disabled = true;

        if (!disabled) {
            console.log(
                'Database is required for this command, Checking database...',
                interaction.guild!.id
            );
            await sql
                .query('SELECT * FROM features WHERE serverid = $1', [
                    interaction.guild!.id,
                ])
                .then((result) => {
                    if (!result.rows[0])
                        sql.query(
                            'INSERT INTO features (serverid) VALUES ($1)',
                            [interaction.guild!.id]
                        );

                    const featureKey = `allow_${localCommand.name.replace(
                        '-',
                        '_'
                    )}`;
                    if (!result.rows[0][featureKey]) {
                        interaction.reply({
                            content:
                                'This command is disabled by the server administrators.\n-# **To enable this command, Run `/config` and click enable.** \n-# [Join our support server for help!](<https://discord.gg/mhsYUgFDbM>)',
                            flags: MessageFlags.Ephemeral,
                        });
                        commandShouldBeCancelled = true;

                        return;
                    }

                    return;
                });
        } else {
            /*       interaction.followUp({
        content:
          "This command requires database, but the owner is too lazy to even consider fixing this. so we will just ignore this for now.",
      }); */
        }
    }
    // Execute command
    if (commandShouldBeCancelled) return;
    Promise.resolve()
        .then(() => localCommand.callback(interaction, config))
        .catch(async (err: Error) => {
            interaction.reply({
                content: `**Command execution cancelled,** \`${err.message}\`\n-# [Join our support server for help!](<https://discord.gg/mhsYUgFDbM>)`,
                flags: MessageFlags.Ephemeral,
            });
        });

    return;
};
