import type {
  ApplicationCommandOptionData,
  ApplicationCommandType,
  Interaction,
  Message,
  PermissionResolvable
} from 'discord.js';

// Make sure to import necessary types
declare global {
  type Command = {
    name: string;
    handler: CommandObject;
    permissions?: PermissionResolvable[];
    description: string;
    options?: ApplicationCommandOptionData[];
  };
  // src/types/CommandCallback.ts

  type CommandCallback = (
    Interaction: Interaction | Message,
    config: Record<string, unknown>,
    args?: string[]
  ) => Promise<void>;

  type CommandObject = {
    options: ApplicationCommandOptionData[];
    permissions: PermissionResolvable[];
    callback: CommandCallback;
  };

  type Feature = {
    name: string;
    machineName: string;
    description: string;
    permissions: string;
    currentState: 'Enabled' | 'Disabled';
  };
  type CommandFile = {
    name: string;
    description: string;
    /**
     * Represents the type of local operation or state.
     *
     * `localType` can have one of the following values:
     * - `1`: Slashcommand.
     * - `2`: Contextmenu command.
     * - `3`: Prefix command.
     */
    localType: 1 | 2 | 3;
    contextType?: 1 | 2;
    options?: ApplicationCommandOptionData[];
    permissions?: PermissionResolvable[];
    ownerOnly?: boolean;
    callback: CommandCallback;
    commandType:
      | ApplicationCommandType.ChatInput
      | ApplicationCommandType.Message
      | ApplicationCommandType.User
      | undefined;
    databaseRequired?: boolean;
    commandOptions?: LocalCommandOption[];
  };
  type CommandArray = {
    SlashCommands: CommandFile[];
    ContextCommands: CommandFile[];
    PrefixCommands: CommandFile[];
  };
  type InteractionFileArray = {
    type: string;
    path: string;
  };
  type InteractionFile = {
    customId: string;
    callback: InteractionCallback;
  };
  type InteractionCallback = (
    Interaction: Interaction | Message
  ) => Promise<void>;

  type LocalCommandOption = {
    name: string;
    description: string;
    required: boolean;
    type: string;
    placement: number;
  };
}
export type {
  Command,
  CommandArray,
  CommandCallback,
  CommandFile,
  Feature,
  InteractionFile,
  InteractionFileArray,
  LocalCommandOption
};
