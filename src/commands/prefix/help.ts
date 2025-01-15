import { EmbedBuilder, type Message, type TextChannel } from 'discord.js';
import fs from 'fs';
import path from 'path';

export default {
    description: 'See info about commands',
    usage: 'cm help',
    callback: async (message: Message): Promise<unknown> => {
        const prefixCommands = fs.readdirSync(__dirname);
        const commands: {
            name: string;
            commandOptions: object[];
            permissions: object[];
            usage: string;
            description: string;
        }[] = [];

        console.log(prefixCommands);

        for (const commandFile of prefixCommands) {
            const commandImport = (
                await import(path.resolve(__dirname, commandFile))
            ).default;
            if (!commandImport.ownerOnly)
                commands.push({
                    name: commandFile.split('.')[0],
                    commandOptions: commandImport.commandOptions || null,
                    permissions: commandImport.permissions || null,
                    usage: commandImport.usage || null,
                    description: commandImport.description || null,
                });
        }
        const embed = new EmbedBuilder()
            .setTitle('__ChannelManager Prefix Commands__')
            .setColor('Blurple')
            .addFields(
                commands.map((cmd) => ({
                    name: `\`${cmd.name}\``,
                    value: [
                        `**Description:** ${
                            cmd.description || 'No description provided.'
                        }`,
                        `**Usage:** ${
                            cmd.usage || '`No usage information available.`'
                        }`,
                        `**Permissions:** ${
                            cmd.permissions?.length
                                ? `\`${cmd.permissions[0]}\``
                                : '`None`'
                        }`,
                        `**Options:** Customizable via command options.`,
                    ].join('\n'),
                    inline: false,
                }))
            );

        if (!message.channel.isTextBased()) return;
        (message.channel as TextChannel)?.send({ embeds: [embed] });

        return;
    },
};
