import loadCommands from '@/utils/handlers/command';
import Table from 'cli-table3';
import type { Client } from 'discord.js';
import path from 'path';

let commands: Command[] = [];

const commandsTable = new Table({
  head: ['Command', 'Success'],
  style: { head: ['green'] },
  colWidths: [15, 15]
});

export default async (client: Client) => {
  commands = await loadCommands(
    client,
    path.join(__dirname, '../../', 'commands')
  );
  commands.forEach((command) => {
    commandsTable.push([command.name, '✅']);
  });
  console.log(commandsTable.toString());
  console.timeEnd('Startup');
};
export { commands };