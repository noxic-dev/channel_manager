import { commands } from "../ready/clientWake";
import config from "../../../config.json";
export default async (interaction: any) => {
  if (interaction.isCommand()) {
    const commandHandler = commands.find(
      (c: any) => c.name === interaction.commandName
    );
    if (commandHandler) {
      await commandHandler.handler.callback(
        interaction,
        interaction.guild,
        interaction.channel,
        config
      );
    }
  }
};
