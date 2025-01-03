// Package imports
import 'dotenv/config';

import { Client } from 'discord.js';
import path from 'path';
import { AutoPoster } from 'topgg-autoposter';

export const startupTime = '968.981ms';
console.time('Startup');

// Local imports
import handleError from '@/utils/handlers/error';
import loadEvents from '@/utils/handlers/event';
import handleInteraction from '@/utils/handlers/interactionHandler';
import handleOwnEvents from './localEvents/voteMessageDeleteHandler';

handleOwnEvents();

// Local constants
const client = new Client({
  intents: ['Guilds', 'GuildMessages', 'MessageContent']
});

if (process.env.NODE_ENV === 'production') {
  setInterval(() => {
    const ap = AutoPoster(process.env.TOPPGG_TOKEN as string, client);
    ap.on('posted', () => {
      console.log('Posted stats to Top.gg!');
    });
  }, 1000 * 60 * 1);
}

// Load events
loadEvents(client, path.join(__dirname, 'events'));
handleInteraction(path.join(__dirname, 'interactionHandlers'), client);

// Handle errors
process.on('unhandledRejection', (err: unknown) => {
  if (err instanceof Error) {
    handleError(err);
  } else {
    console.error('Unhandled Rejection:', err);
  }
});
process.on('uncaughtException', (err: Error) => {
  handleError(err);
});
process.on('warning', (warning: Error) => {
  console.warn('Warning detected:', warning.message);
  handleError(warning);
});

// login
client.login(process.env.TOKEN);
