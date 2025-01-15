import { PrefixCommandsOptions } from '@/utils/enums/prefixCommandsOptionsEnums';
import type { Message } from 'discord.js';

export default {
    description: 'Replies with pong (example command)',
    usage: 'cm ping <number, representing how many pongs>',
    permissions: ['SendMessages'],
    commandOptions: [
        {
            name: 'Pongs',
            description: 'Amount of pongs',
            required: true,
            type: PrefixCommandsOptions.integer,
            placement: 1,
        },
    ],
    callback: (message: Message, config: never, args: string[]): unknown => {
        message.reply(`Pong! *${args[2]} Times*`);

        return;
    },
};
