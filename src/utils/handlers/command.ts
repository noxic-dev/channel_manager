import { Client } from "discord.js";
import fs from "fs";
import path from "path";

export default async (client: any, commandDir: string) => {
  for (const command of fs.readdirSync(commandDir)) {
    const commandFiles = fs.readdirSync(path.join(commandDir, command));
    for (const file of commandFiles) {
      if (file.endsWith(".ts") || file.endsWith(".js")) {
        const commandHandler = await import(
          `${path.join(commandDir, command)}/${file}`
        );
        client.commands.set(command, commandHandler.default);
      }
    }
  }
};
