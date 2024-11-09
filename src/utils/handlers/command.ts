import type {
  ApplicationCommand,
  ApplicationCommandDataResolvable,
  ApplicationCommandOption,
  ApplicationCommandOptionData,
  Client,
  ClientApplication
} from 'discord.js';
import fs from 'fs';
import path from 'path';

import type { Command } from '../../@types/global';

const commands: Command[] = [];
const applicationCommandsArray: object[] = [];
export default async (
  client: Client,
  commandDir: string
): Promise<Command[]> => {
  const fetchedCommands = await (
    client.application as ClientApplication
  ).commands.fetch();
  let hasChanges = false;

  for (const file of fs.readdirSync(commandDir)) {
    if (file.endsWith('.ts') || file.endsWith('.js')) {
      const commandHandler = (await import(path.join(commandDir, file)))
        .default;
      console.log(path.join(commandDir, file));
      console.log(commandHandler.permissions);

      const commandName = file.split('.')[0];
      const commandDescription =
        `A command with perms: ${commandHandler.permissions
          .toString()
          .replace('[', '')
          .replace(']', '')
          .replace('"', '')
          .replace(',', ', ')}` || 'No perms';

      commands.push({
        name: commandName,
        handler: commandHandler,
        description: commandDescription,
        options: commandHandler.options || []
      });

      applicationCommandsArray.push({
        name: commandName,
        description: commandDescription,
        options: commandHandler.options || []
      });

      const fetchedCommand = fetchedCommands.find(
        (cmd: ApplicationCommand) => cmd.name === commandName
      );

      if (!fetchedCommand) {
        console.log(
          `Changes in command: ${commandName} has been detected, reloading commands now.`
        );
        hasChanges = true;
      } else {
        let changeDetected = false;

        if (fetchedCommand.description !== commandDescription) {
          console.log(
            `Change detected in command "${commandName}":\n` +
              `  Previous Description: ${fetchedCommand.description}\n` +
              `  New Description: ${commandDescription}`
          );
          changeDetected = true;
        }

        const fetchedOptions = fetchedCommand.options || [];
        const newOptions = commandHandler.options || [];

        const normalizeOptions = (options: ApplicationCommandOption[]) => {
          return (
            options
            // Filter out only options that have a 'required' property, excluding ApplicationCommandSubGroup
              .filter((option): option is ApplicationCommandOptionData => {
                return (
                  'required' in option && typeof option.required === 'boolean'
                );
              })
              .map((option: ApplicationCommandOptionData) => ({
                name: option.name,
                description: option.description,
                type: option.type,
                required: 'required' in option ? option.required : false
              }))
              .sort((a, b) => a.name.localeCompare(b.name))
          );
        };

        if (
          JSON.stringify(normalizeOptions(fetchedOptions)) !==
          JSON.stringify(normalizeOptions(newOptions))
        ) {
          console.log(
            `Change detected in command "${commandName}":\n` +
              `  Previous Options: ${JSON.stringify(fetchedOptions)}\n` +
              `  New Options: ${JSON.stringify(newOptions)}`
          );
          changeDetected = true;
        }

        if (changeDetected) {
          console.log(
            `Changes in command: ${commandName} has been detected, reloading commands now.`
          );
          hasChanges = true;
        }
      }
    }
  }

  if (hasChanges) {
    console.log('Setting commands to Discord...');
    await (client.application as ClientApplication).commands.set(
      applicationCommandsArray as ApplicationCommandDataResolvable[]
    );
  } else {
    console.log('No changes detected in commands.');
  }
  return commands;
};