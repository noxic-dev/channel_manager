<<<<<<< Updated upstream
import { commandsTable, eventsTable } from "../../source";
import loadCommands from "@/utils/handlers/command";
import path from "path";
let commands: any = [];
export default async (client: any) => {
  commands = await loadCommands(
    client,
    path.join(__dirname, "../../", "commands")
  );
  commands.forEach((command: any) => {
    commandsTable.push([command.name, "✅"]);
  });
  //   console.log(eventsTable.toString());
  //   console.log(commandsTable.toString());
  console.timeEnd("Startup");
=======
import Table from 'cli-table3';
import { ActivityType, type Client } from 'discord.js';
import path from 'path';

import type { CommandArray } from '@/types/global';
import loadCommands from '@/utils/handlers/command';

let commands: CommandArray = {
  ContextCommands: [],
  PrefixCommands: [],
  SlashCommands: []
};

const commandsTable = new Table({
  head: ['Command', 'Success', 'Type'],
  style: { head: ['green'] },
  colWidths: [15, 15]
});

export default async (client: Client): Promise<void> => {
  commands = await loadCommands(
    path.join(__dirname, '../../', 'commands'),
    client
  );

  const { ContextCommands, PrefixCommands, SlashCommands } = commands;

  ContextCommands.forEach((command) => {
    commandsTable.push([command.name, command ? '✅' : '❌', 'Context Menu']);
  });

  PrefixCommands.forEach((command) => {
    commandsTable.push([command.name, command ? '✅' : '❌', 'Prefix Command']);
  });

  SlashCommands.forEach((command) => {
    commandsTable.push([command.name, command ? '✅' : '❌', 'Slash Command']);
  });

  console.log(commandsTable.toString());

  client.user?.setPresence({
    activities: [
      {
        name: '/info',
        type: ActivityType.Watching
      }
    ],
    afk: true
  });
>>>>>>> Stashed changes
};
export { commands };
