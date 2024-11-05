// Package imports
import { Client } from "discord.js";
import path from "path";
import "dotenv/config";
import Table from "cli-table3";

// Local imports
import loadEvents from "./utils/handlers/event";

// Local constants
const client = new Client({
  intents: ["Guilds", "GuildMessages", "MessageContent"],
});
const commandsTable = new Table({
  head: ["Command", "Success"],
  style: { head: ["green"] },
  colWidths: [15, 15],
});
const eventsTable = new Table({
  head: ["Events", "Success"],
  style: { head: ["green"] },
  colWidths: [15, 15],
});

client.on("ready", async () => {
  console.log(`Logged in as ${client.user?.displayName}!`);
  const events = await loadEvents(client, path.join(__dirname, "events"));
  eventsTable.push(events);

  console.log(eventsTable.toString());
  console.log(commandsTable.toString());
});

client.login(process.env.TOKEN);
