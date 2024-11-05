// Package imports
import { Client } from "discord.js";
import path from "path";
import "dotenv/config";
import Table from "cli-table3";

export const startupTime = "968.981ms";
console.time("Startup");

// Local imports
import loadEvents from "./utils/handlers/event";
import loadCommands from "./utils/handlers/command";

// Local constants
const client = new Client({
  intents: ["Guilds", "GuildMessages", "MessageContent"],
});
export const commandsTable = new Table({
  head: ["Command", "Success"],
  style: { head: ["green"] },
  colWidths: [15, 15],
});
export const eventsTable = new Table({
  head: ["Events", "Success"],
  style: { head: ["green"] },
  colWidths: [15, 15],
});

(async () => {
  const events = await loadEvents(client, path.join(__dirname, "events"));
  events.forEach((event) => {
    eventsTable.push([event, "✅"]);
  });
})();

client.login(process.env.TOKEN);
