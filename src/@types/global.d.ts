import { Interaction } from "discord.js"; // Make sure to import necessary types
import type { Guild, Channel } from "discord.js"; // Import specific types as needed
declare global {
  interface Command {
    name: string;
    handler: any;
    permissions?: string[];
    description: string;
    options?: object[];
  }
  // src/types/CommandCallback.ts

  interface CommandCallback {
    (
      interaction: Interaction,
      guild: Guild | null,
      channel: Channel | null,
      config: any
    ): Promise<void>;
  }
}

export { Command, CommandCallback };
