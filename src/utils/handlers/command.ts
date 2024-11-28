<<<<<<< Updated upstream
import { Client } from "discord.js";
import fs from "fs";
import path from "path";
import type { Command } from "../../@types/global.js";

const commands: Command[] = [];
const applicationCommandsArray: object[] = [];
export default async (client: any, commandDir: string): Promise<Command[]> => {
  const fetchedCommands = await client.application.commands.fetch();
=======
import {
  type ApplicationCommandData,
  type ApplicationCommandDataResolvable,
  type ApplicationCommandOption,
  ApplicationCommandType,
  type Client,
  type ClientApplication
} from 'discord.js';
import fs from 'fs';
import path from 'path';

import type { CommandArray, CommandFile } from '@/types/global';
import { CommandFolderType } from '@/utils/enums/commandEnums';

type CustomCommandData = ApplicationCommandData & {
  localType?: number;
};

export default async function loadCommands(
  directory: string,
  client: Client
): Promise<CommandArray> {
  const commandFolder = fs.readdirSync(directory);
  const validFolders = ['slash', 'context', 'prefix'];
  const commands: CommandArray = {
    ContextCommands: [],
    PrefixCommands: [],
    SlashCommands: []
  };
  const commandsForRegistration: CustomCommandData[] = [];
  const fetchedCommands = await (
    client.application as ClientApplication
  ).commands.fetch();
>>>>>>> Stashed changes
  let hasChanges = false;

  for (const file of fs.readdirSync(commandDir)) {
    if (file.endsWith(".ts") || file.endsWith(".js")) {
      const commandHandler = (await import(path.join(commandDir, file)))
        .default;
      console.log(path.join(commandDir, file));
      console.log(commandHandler.permissions);

      const commandName = file.split(".")[0];
      const commandDescription =
        `A command with perms: ${commandHandler.permissions
          .toString()
          .replace("[", "")
          .replace("]", "")
          .replace('"', "")
          .replace(",", ", ")}` || "No perms";

      commands.push({
        name: commandName,
        handler: commandHandler,
        description: commandDescription,
        options: commandHandler.options || [],
      });

      applicationCommandsArray.push({
        name: commandName,
        description: commandDescription,
        options: commandHandler.options || [],
      });

<<<<<<< Updated upstream
      const fetchedCommand = fetchedCommands.find(
        (cmd: any) => cmd.name === commandName
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
=======
          // Extract command properties
          let commandName = file.split('.')[0];
          const commandDescription = `A ${folder} command with the permissions ${
            command.permissions?.join(', ') || 'none'
          }`;

          commandName =
            folder === 'context'
              ? commandName
                  .replace(/[-=]/g, ' ')
                  .replace(/\b\w/g, (char) => char.toUpperCase())
              : commandName;
          // Create a CommandFile object
          const commandFile: CommandFile = {
            name: commandName,
            description: folder === 'slash' ? commandDescription : '',
            localType: folder === 'slash' ? 1 : folder === 'context' ? 2 : 3,
            options: command.options || [],
            permissions: command.permissions || [],
            ownerOnly: command.ownerOnly || false,
            callback: command.callback,
            commandType:
              folder === 'slash'
                ? ApplicationCommandType.ChatInput
                : folder === 'context'
                ? command.type
                : undefined,
            databaseRequired: command.databaseRequired || false,
            commandOptions: command.commandOptions || null
          };

          // Determine where to add the command based on the folder type
          if (folder === CommandFolderType.Slashcommand) {
            commands.SlashCommands.push(commandFile);
            commandsForRegistration.push({
              name: commandFile.name,
              description: commandFile.description,
              options: commandFile.options || [],
              type: commandFile.commandType,
              localType: command.localType
            });
          } else if (folder === CommandFolderType.Contextcommand) {
            commands.ContextCommands.push(commandFile);
            commandsForRegistration.push({
              name: commandFile.name,
              description: '',
              options: commandFile.options,
              type: commandFile.commandType,
              localType: command.localType
            });
          } else if (folder === CommandFolderType.Prefixcommand) {
            commands.PrefixCommands.push(commandFile);
          }

          // Check for changes
          if (commandFile.localType !== 3) {
            const fetchedCommand = fetchedCommands.find(
              (cmd) =>
                cmd.name.replace(' ', '-').toLowerCase() ===
                  commandName.replace(' ', '-').toLowerCase() &&
                cmd.type === commandFile.commandType
            );
>>>>>>> Stashed changes

        const normalizeOptions = (options: any) => {
          return options
            .map((option: any) => ({
              name: option.name,
              description: option.description,
              type: option.type,
              required: option.required,
            }))
            .sort((a: any, b: any) => a.name.localeCompare(b.name));
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

<<<<<<< Updated upstream
        if (changeDetected) {
          console.log(
            `Changes in command: ${commandName} has been detected, reloading commands now.`
          );
          hasChanges = true;
=======
              const fetchedOptions = Array.isArray(fetchedCommand.options)
                ? fetchedCommand.options
                : [];
              const newOptions = Array.isArray(command.options)
                ? command.options
                : [];

              const normalizeOptions = (
                options: ApplicationCommandOption[]
              ): object[] => {
                return (
                  options
                    // Filter out only options that have a 'required' property, excluding ApplicationCommandSubGroup
                    .filter((option) => {
                      return (
                        option &&
                        'required' in option &&
                        typeof option.required === 'boolean'
                      );
                    })
                    .map((option) => ({
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
                  `Changes in command: ${commandName} have been detected, reloading commands now.`
                );
                hasChanges = true;
              }
            }
          }
        } catch (error) {
          console.error(`Error loading command ${file}:`, error);
>>>>>>> Stashed changes
        }
      }
    }
  }

  if (hasChanges) {
<<<<<<< Updated upstream
    console.log("Setting commands to Discord...");
    await client.application.commands.set(applicationCommandsArray);
  } else {
    console.log("No changes detected in commands.");
=======
    client.application?.commands.set(
      commandsForRegistration as ApplicationCommandDataResolvable[]
    );
    console.log('Reloaded commands successfully!');
>>>>>>> Stashed changes
  }
  return commands;
};
