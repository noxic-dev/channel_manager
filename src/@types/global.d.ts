import type {
  Interaction,
  ApplicationCommandOptionData,
  PermissionResolvable,
  ApplicationCommandType,
  Message,
} from 'discord.js'

// Make sure to import necessary types
declare global {
  type Command = {
    name: string
    handler: CommandObject
    permissions?: PermissionResolvable[]
    description: string
    options?: ApplicationCommandOptionData[]
  }
  // src/types/CommandCallback.ts

  type CommandCallback = (
    Interaction: Interaction | Message,
    config: Record<string, unknown>,
    args?: string[]
  ) => Promise<void>

  type CommandObject = {
    options: ApplicationCommandOptionData[]
    permissions: PermissionResolvable[]
    callback: CommandCallback
  }

  type Feature = {
    name: string
    machineName: string
    description: string
    permissions: string
    currentState: 'Enabled' | 'Disabled'
  }
  type CommandFile = {
    name: string
    description: string
    /**
     * Represents the type of local operation or state.
     *
     * `localType` can have one of the following values:
     * - `1`: Slashcommand.
     * - `2`: Contextmenu command.
     * - `3`: Prefix command.
     */
    localType: 1 | 2 | 3
    contextType?: 1 | 2
    options?: ApplicationCommandOptionData[]
    permissions?: PermissionResolvable[]
    ownerOnly?: boolean
    callback: CommandCallback
    commandType:
      | ApplicationCommandType.ChatInput
      | ApplicationCommandType.Message
      | ApplicationCommandType.User
      | undefined
  }
  type CommandArray = {
    SlashCommands: CommandFile[]
    ContextCommands: CommandFile[]
    PrefixCommands: CommandFile[]
  }
}
export type { Command, CommandCallback, Feature, CommandArray, CommandFile }
