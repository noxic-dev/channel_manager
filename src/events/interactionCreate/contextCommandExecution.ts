import * as config from "@config";
import {
  ApplicationCommandType,
  type MessageContextMenuCommandInteraction,
  type PermissionsBitField,
  type UserContextMenuCommandInteraction,
} from "discord.js";
import { sql } from "@/utils/connections/postgresDb";
import { commands } from "@/events/ready/clientWake";

export default async (
  interaction:
    | UserContextMenuCommandInteraction
    | MessageContextMenuCommandInteraction
): Promise<unknown> => {
  let commandShouldBeCancelled = false;
  if (
    interaction.commandType !== ApplicationCommandType.Message &&
    interaction.commandType !== ApplicationCommandType.User
  )
    return;

  const localCommand = commands.ContextCommands.find(
    (c) => c.name === interaction.commandName
  );

  if (!localCommand)
    return interaction.reply({
      content: "Unknown command! (context)",
      ephemeral: true,
    });

  // Check permissions
  if (localCommand.permissions) {
    const hasPermissions = localCommand.permissions.every((p) =>
      (interaction.member?.permissions as Readonly<PermissionsBitField>).has(p)
    );
    const botHasPermissions = localCommand.permissions.every((p) =>
      (interaction.member?.permissions as Readonly<PermissionsBitField>).has(p)
    );

    if (!hasPermissions)
      return interaction.reply({
        content: `You're missing permissions to run this command! \n-# Permissions: ${localCommand.permissions.join(
          ", "
        )}\n-# [Join our support server for help!](<https://discord.gg/mhsYUgFDbM>)`,
        ephemeral: true,
      });
    if (!botHasPermissions)
      return interaction.reply({
        content: `I'm missing permissions to run this command! \n-# Permissions: ${localCommand.permissions.join(
          ", "
        )}\n-# [Join our support server for help!](<https://discord.gg/mhsYUgFDbM>)`,
        ephemeral: true,
      });
  }

  if (localCommand.databaseRequired) {
    const disabled = true;

    if (!disabled) {
      console.log(
        "Database is required for this command, Checking database...",
        interaction.guild!.id
      );
      await sql
        .query("SELECT * FROM features WHERE serverid = $1", [
          interaction.guild!.id,
        ])
        .then((result) => {
          if (!result.rows[0])
            sql.query("INSERT INTO features (serverid) VALUES ($1)", [
              interaction.guild!.id,
            ]);

          const featureKey = `allow_${localCommand.name.replace("-", "_")}`;
          if (!result.rows[0][featureKey]) {
            interaction.reply({
              content:
                "This command is disabled by the server administrators.\n-# **To enable this command, Run `/config` and click enable.** \n-# [Join our support server for help!](<https://discord.gg/mhsYUgFDbM>)",
              ephemeral: true,
            });
            commandShouldBeCancelled = true;

            return;
          }

          return;
        });
    } else {
      interaction.followUp({
        content:
          "This command requires database, but the owner is too lazy to even consider fixing this. so we will just ignore this for now.",
      });
    }
  }

  // Execute command
  if (commandShouldBeCancelled) return;
  localCommand.callback(interaction, config).catch((err: Error) => {
    interaction.reply({
      content: `**Command execution cancelled,** \`${err.message}\`\n-# [Join our support server for help!](<https://discord.gg/mhsYUgFDbM>)`,

      ephemeral: true,
    });
  });

  return;
};
