import type { Channel, Guild, Interaction } from 'discord.js';

// Make sure to import necessary types
declare global {
  interface Command {
    name: string;
    handler: unknown;
    permissions?: string[];
    description: string;
    options?: object[];
  }
  // src/types/CommandCallback.ts

  type CommandCallback = (ctx: {
    interaction: Interaction;
    guild: Guild | null;
    channel: Channel | null;
    config: Record<string, unknown>;
  }) => Promise<void>;
}

interface Feature {
  name: string;
  machineName: string;
  description: string;
  permissions: string;
  currentState: 'Enabled' | 'Disabled';
}

export type { Command, CommandCallback, Feature };
