import { Client } from "discord.js";
import fs from "fs";
import path from "path";
import type { Command } from "../../@types/global.js";

const commands: Command[] = [];
const applicationCommandsArray: object[] = [];
export default async (client: any, commandDir: string): Promise<Command[]> => {
  const fetchedCommands = await client.application.commands.fetch();
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
    console.log("Setting commands to Discord...");
    await client.application.commands.set(applicationCommandsArray);
  } else {
    console.log("No changes detected in commands.");
  }
  return commands;
};
