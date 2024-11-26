import {
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  Message,
} from 'discord.js'

export const addDeleteButton = async (
  msg: Message,
  message: Message,
): Promise<void> => {
  const actionRow = new ActionRowBuilder<ButtonBuilder>().addComponents(
    new ButtonBuilder()
      .setStyle(ButtonStyle.Secondary)
      .setEmoji('<:TrashBin_red:1303739433408794696>')
      .setCustomId(`DeleteResponse:${msg.id}:${message.author.id}`),
  )
  await msg.edit({ components: [actionRow] })
}
