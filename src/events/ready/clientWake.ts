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
};
export { commands };
