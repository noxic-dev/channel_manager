import config from '@config';
import type { Message, PermissionsBitField } from 'discord.js';
import util from 'util';

import { commands } from '@/events/ready/clientWake';
import { PrefixCommandsOptions } from '@/utils/enums/prefixCommandsOptionsEnums';

export default async (interaction: Message): Promise<unknown> => {
  let commandShallNotBeRan = 0;
  let prefix = '';
  const args = interaction.content.split(' ');
  if (interaction.author.bot) return;
  if (interaction.client.user.id !== '1303334967949922396') prefix = 'cm';
  else prefix = 'cm-dev';
  if (args[0].toLowerCase() !== prefix) return;

  const localCommand = commands.PrefixCommands.find((c) => c.name === args[1]);
  console.log(args);

  // Check if localCommand exists
  if (!localCommand) {
    interaction.reply(
      `Unknown command. Use \`${prefix} help\` for a list of commands.`
    );

    return;
  }

  // Handle permissions
  if (localCommand.permissions) {
    const hasPermissions = localCommand.permissions.every((p) =>
      (interaction.member?.permissions as Readonly<PermissionsBitField>).has(p)
    );
    const botMember = interaction.guild?.members.me;
    const botHasPermissions = localCommand.permissions.every((p) =>
      botMember?.permissions.has(p)
    );

    if (!hasPermissions) return interaction.react('❌');
    if (!botHasPermissions) return interaction.react('❌');
  }

  // Execute the command
  if (
    localCommand.ownerOnly &&
    !config.ownerArray.includes(interaction.author.id)
  )
    return interaction.react('❌');

  // Ensure commandOptions exist before iterating
  if (localCommand.commandOptions && localCommand.commandOptions.length > 0) {
    for (const option of localCommand.commandOptions) {
      const argIndex = option.placement + 1; // Adjust placement to match args indexing
      const argValue = args[argIndex];

      switch (option.type) {
        case PrefixCommandsOptions.boolean:
          if (argValue !== 'true' && argValue !== 'false') {
            await interaction.reply(
              `Invalid value for '${option.name}': Expected a boolean at position ${argIndex}.`
            );
            commandShallNotBeRan = 1;

            return;
          }
          break;

        case PrefixCommandsOptions.string:
          if (!argValue || typeof argValue !== 'string') {
            await interaction.reply(
              `Invalid value for '${option.name}': Expected a string at position ${argIndex}.`
            );
            commandShallNotBeRan = 1;

            return;
          }
          break;

        case PrefixCommandsOptions.integer:
          if (!argValue || isNaN(Number(argValue))) {
            await interaction.reply(
              `Invalid value for '${option.name}': Expected a number at position ${argIndex}.`
            );
            commandShallNotBeRan = 1;

            return;
          }
          break;

        case PrefixCommandsOptions.userMentionable:
        case PrefixCommandsOptions.channelMentionable:
        case PrefixCommandsOptions.roleMentionbale:
          if (!isValidOption(argValue, option.type)) {
            // If not a valid mention, try to validate as an ID
            if (option.type === PrefixCommandsOptions.userMentionable) {
              const user = await interaction.client.users
                .fetch(argValue)
                .catch(() => null);
              if (!user && localCommand.commandOptions) {
                await interaction.reply(
                  `Command used wrongly! \`${prefix} ${
                    args[1]
                  } ${generateCommandExample(localCommand.commandOptions)}\``
                );
                commandShallNotBeRan = 1;

                return;
              }
            } else if (
              option.type === PrefixCommandsOptions.channelMentionable
            ) {
              const channel = await interaction.guild?.channels
                .fetch(argValue)
                .catch(() => null);
              if (!channel && localCommand.commandOptions) {
                await interaction.reply(
                  `Command used wrongly! \`${prefix} ${
                    args[1]
                  } ${generateCommandExample(localCommand.commandOptions)}\``
                );
                commandShallNotBeRan = 1;

                return;
              }
            } else if (option.type === PrefixCommandsOptions.roleMentionbale) {
              const role = await interaction.guild?.roles
                .fetch(argValue)
                .catch(() => null);
              if (!role && localCommand.commandOptions) {
                await interaction.reply(
                  `Command used wrongly! \`${prefix} ${
                    args[1]
                  } ${generateCommandExample(localCommand.commandOptions)}\``
                );
                commandShallNotBeRan = 1;

                return;
              }
            }
          }
          break;

        default:
          await interaction.reply(
            `Unknown type '${option.type}' for option '${option.name}'.`
          );
          commandShallNotBeRan = 1;

          return;
      }

      if (option.required && (argValue === null || argValue === undefined)) {
        await interaction.reply(
          `Missing required value for '${option.name}' at position ${argIndex}.`
        );
        commandShallNotBeRan = 1;

        return;
      }
    }
    function isValidOption(value: string, type: string): boolean {
      switch (type) {
        case PrefixCommandsOptions.boolean:
          return value === 'true' || value === 'false';
        case PrefixCommandsOptions.integer:
          return !isNaN(Number(value));
        case PrefixCommandsOptions.string:
          return typeof value === 'string' && value.length > 0;
        case PrefixCommandsOptions.userMentionable:
          return /^<@!?[0-9]+>$/.test(value);
        case PrefixCommandsOptions.channelMentionable:
          return /^<#[0-9]+>$/.test(value);
        case PrefixCommandsOptions.roleMentionbale:
          return /^<@&[0-9]+>$/.test(value);
        default:
          return false;
      }
    }

    function generateCommandExample(options: LocalCommandOption[]): string {
      return options!
        .map((option) => {
          switch (option.type) {
            case PrefixCommandsOptions.userMentionable:
              return '<@user>'; // Example for user
            case PrefixCommandsOptions.channelMentionable:
              return '<#channel>'; // Example for channel
            case PrefixCommandsOptions.roleMentionbale:
              return '<@&role>'; // Example for role
            case PrefixCommandsOptions.boolean:
              return '<true/false>'; // Example for boolean
            case PrefixCommandsOptions.integer:
              return '<number>'; // Example for integer
            case PrefixCommandsOptions.string:
              return '<text>'; // Example for string
            default:
              return '(unknown)';
          }
        })
        .join(' ');
    }
  }
  if (commandShallNotBeRan >= 1) return;
  localCommand.callback = util.promisify(localCommand.callback);
  localCommand.callback(interaction, config, args).catch((err: unknown) => {
    const error = err as Error;
    interaction.reply({
      content: `**Error :x:**\n\`\`\`js\n${error.message}\`\`\``
    });
  });
};
