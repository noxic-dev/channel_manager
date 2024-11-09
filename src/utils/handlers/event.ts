import type { Client } from 'discord.js';
import fs from 'fs';
import path from 'path';

export default async (client: Client, eventDir: string): Promise<string[]> => {
  const eventArray = [];
  const events = await fs.readdirSync(eventDir);
  for (const event of events) {
    console.log(`Loading event: ${event}`);
    const eventFiles = fs.readdirSync(path.join(eventDir, event));
    for (const file of eventFiles) {
      if (file.endsWith('.ts') || file.endsWith('.js')) {
        const eventHandler = await import(
          `${path.join(eventDir, event)}/${file}`
        );
        client.on(event, (...args) => {
          console.log(`Running event: ${event}`);
          eventHandler.default(...args);
        });
        eventArray.push(event);
      }
    }
  }
  return eventArray;
};