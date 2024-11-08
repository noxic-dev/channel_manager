// Package imports
import { Client } from 'discord.js';
import path from 'path';
import 'dotenv/config';

export const startupTime = '968.981ms';
console.time('Startup');

// Local imports
import loadEvents from './utils/handlers/event';
import loadCommands from './utils/handlers/command';

// Local constants
const client = new Client({
  intents: ['Guilds', 'GuildMessages', 'MessageContent'],
});

(async () => {
  const events = await loadEvents(client, path.join(__dirname, 'events'));
})();

client.login(process.env.TOKEN);
