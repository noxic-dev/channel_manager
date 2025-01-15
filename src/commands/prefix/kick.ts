import type { Message } from 'discord.js';

import { PrefixCommandsOptions } from '@/enums/prefixCommandsOptionsEnums';
export default {
    permissions: ['KickMembers'],
    description: 'Kick a guild member',
    usage: 'cm kick <@username> / <userId>',
    commandOptions: [
        {
            name: 'Target User',
            description: 'The user to target',
            required: true,
            type: PrefixCommandsOptions.userMentionable,
            placement: 1,
        },
    ],
    callback: (message: Message, config: void, args: string[]): unknown => {
        let mentionType = 0; // 0 = none, 1 = ID, 2 = mention

        if (args[2].includes('<@')) mentionType = 2;
        else mentionType = 1;

        let member = message.mentions.members?.first();

        if (mentionType === 1) {
            const user = message.guild?.members.cache.get(args[2]);
            if (!user)
                return message
                    .reply('User not found.')
                    .then(
                        (msg) =>
                            new Promise(() =>
                                setTimeout(() => msg.delete(), 5000)
                            )
                    );
            if (!member) member = user;
        }
        if (!member) return;
        if (
            member.roles.highest.position >
            message.member!.roles.highest.position
        )
            throw new Error(
                'You cannot kick someone with a higher role than you.'
            );
        if (member.user.id === message.author.id)
            throw new Error('You cannot kick yourself');

        member.kick(args.slice(3).join(' ') || 'No reason provided');
    },
};
