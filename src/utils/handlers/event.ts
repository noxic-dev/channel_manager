import { Client } from "discord.js";
import path from "path";
import fs from "fs";

export default async (client: Client, eventDir: string): Promise<string[]> => {
  const eventArray = [];
  const events = await fs.readdirSync(eventDir);
  for (const event of events) {
    console.log(`Loading event: ${event}`);
    const eventFiles = fs.readdirSync(path.join(eventDir, event));
    for (const file of eventFiles) {
      if (file.endsWith(".ts") || file.endsWith(".js")) {
        const eventHandler = await import(
          `${path.join(eventDir, event)}/${file}`
        );
        client.on(event, (...args) => eventHandler.default(...args));
        eventArray.push(event, "✅");
      }
    }
  }
  return eventArray;
};
