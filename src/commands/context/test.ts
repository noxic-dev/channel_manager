import { ContextMenuCommandInteraction } from 'discord.js'

export default {
  type: 'User',

  callback: (interaction: ContextMenuCommandInteraction): unknown => {
    return interaction.reply({ content: 'test', ephemeral: true })
  },
}
