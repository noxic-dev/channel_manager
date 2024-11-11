import type {
  Interaction,
  ApplicationCommandOptionData,
  PermissionResolvable,
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
    interaction: Interaction,
    config: Record<string, unknown>
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
}
export type { Command, CommandCallback, Feature }
