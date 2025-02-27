import { type Message } from 'discord.js';

import { PrefixCommandsOptions } from '@/enums/prefixCommandsOptionsEnums';

export default {
    permissions: ['BanMembers'],
    description: 'Ban a guild member',
    usage: 'cm ban <@username> / <userId> <number, hours of chatlog to delete>',
    commandOptions: [
        {
            name: 'Target User',
            description: 'The user to target',
            required: true,
            type: PrefixCommandsOptions.userMentionable,
            placement: 1,
        },
        {
            name: 'Hours of chatlogs to delete',
            description: 'How many messages to clear ( 0 = none )',
            required: true,
            type: PrefixCommandsOptions.integer,
            placement: 2,
        },
    ],
    callback: (message: Message, config: void, args: string[]): unknown => {
        let mentionType = 0; // 0 = none, 1 = ID, 2 = mention
        if (args[2].includes('<@')) mentionType = 2;
        else mentionType = 1;

        let member = message.mentions.members?.first();

        // transfer ID to user.
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

        let hoursProvided;
        if (!isNaN(parseInt(args[3])))
            hoursProvided = parseInt(args[3]) * 60 * 60;
        if (member.bannable)
            member.ban({
                reason: args.slice(4).join(' ') || 'No reason provided',
                deleteMessageSeconds: hoursProvided ? hoursProvided : 0,
            });
        else message.reply('I cannot ban this user.');
    },
};
