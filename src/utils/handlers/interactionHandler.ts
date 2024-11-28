import {
  type ButtonInteraction,
  type Client,
  Events,
  type Interaction,
  type ModalSubmitInteraction,
  type SelectMenuInteraction
} from 'discord.js';
import fs from 'fs';
import path from 'path';

import { CommandFolderType } from '@/enums/interactionEnums';
import type { InteractionFile, InteractionFileArray } from '@/types/global';

export default (baseDir: string, client: Client): void => {
  const validFolders = ['button', 'modal', 'select'];
  const interactions: InteractionFileArray[] = [];
  const baseFolders = fs.readdirSync(baseDir);

  for (const folder of baseFolders) {
    const folderPath = path.join(baseDir, folder);
    if (!validFolders.includes(folder)) continue;

    const files = fs.readdirSync(folderPath);

    for (const file of files) {
      if (!file.endsWith('.js') && !file.endsWith('.ts')) continue;

      interactions.push({
        type: folder as CommandFolderType,
        path: path.resolve(folderPath, file)
      });
    }
  }

  interactions.forEach((int) => {
    let interactionFile: InteractionFile;

    try {
      interactionFile = require(int.path).default;
    } catch (err) {
      console.error(`Failed to load interaction file at ${int.path}:`, err);

      return;
    }

    if (!interactionFile.callback || !interactionFile.customId) {
      console.warn('Found an invalid interaction file:', int.path);

      return;
    }

    client.on(Events.InteractionCreate, async (interaction: Interaction) => {
      if (
        interaction.isChatInputCommand() ||
        interaction.isMessageContextMenuCommand() ||
        interaction.isUserContextMenuCommand()
      )
        return;

      if (int.type === CommandFolderType.button && interaction.isButton()) {
        const buttonInteraction = interaction as ButtonInteraction;
        if (buttonInteraction.customId.startsWith(interactionFile.customId)) {
          await interactionFile.callback(buttonInteraction);
        }
      } else if (
        int.type === CommandFolderType.dropdownMenu &&
        interaction.isAnySelectMenu()
      ) {
        const selectMenuInteraction = interaction as SelectMenuInteraction;
        if (
          selectMenuInteraction.customId.startsWith(interactionFile.customId)
        ) {
          await interactionFile.callback(selectMenuInteraction);
        }
      } else if (
        int.type === CommandFolderType.modal &&
        interaction.isModalSubmit()
      ) {
        const modalInteraction = interaction as ModalSubmitInteraction;
        if (modalInteraction.customId.startsWith(interactionFile.customId)) {
          await interactionFile.callback(modalInteraction);
        }
      }
    });
  });
};
