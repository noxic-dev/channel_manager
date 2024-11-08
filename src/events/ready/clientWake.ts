import loadCommands from '@/utils/handlers/command';
import { Client } from 'discord.js';
import path from 'path';
import Table from 'cli-table3';
let commands: any = [];

const commandsTable = new Table({
  head: ['Command', 'Success'],
  style: { head: ['green'] },
  colWidths: [15, 15],
});

export default async (client: Client) => {
  commands = await loadCommands(
    client,
    path.join(__dirname, '../../', 'commands')
  );
  commands.forEach((command: any) => {
    commandsTable.push([command.name, '✅']);
  });
  console.log(commandsTable.toString());
  console.timeEnd('Startup');
};
export { commands };
