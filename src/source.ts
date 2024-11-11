// Package imports
import { Client } from 'discord.js';
import path from 'path';
import { AutoPoster } from 'topgg-autoposter';
import 'dotenv/config';

export const startupTime = '968.981ms';
console.time('Startup');

// Local imports
import loadEvents from './utils/handlers/event';

// Local constants
const client = new Client({
  intents: ['Guilds', 'GuildMessages', 'MessageContent'],
});

if (process.env.NODE_ENV === 'production') {
  const ap = AutoPoster(process.env.TOPPGG_TOKEN as string, client);
  ap.on('posted', () => {
    console.log('Posted stats to Top.gg!');
  });
}

(async (): Promise<void> => {
  await loadEvents(client, path.join(__dirname, 'events'));
})();

client.login(process.env.TOKEN);
