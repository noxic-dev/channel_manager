import { Message, PermissionsBitField } from 'discord.js'
import { commands } from '@/events/ready/clientWake'
import * as config from '@config'

export default (interaction: Message): unknown => {
  let prefix
  if (interaction.author.bot) return
  if (interaction.client.user.id !== '1303334967949922396') prefix = 'cm'
  else prefix = 'cm-dev'
  if (!interaction.content.startsWith(prefix)) return

  const args = interaction.content.split(' ')

  const localCommand = commands.PrefixCommands.find(c => c.name === args[1])

  if (!localCommand) return console.log('No local command')

  // Handle permissions
  if (localCommand.permissions) {
    const hasPermissions = localCommand.permissions.every(p =>
      (interaction.member?.permissions as Readonly<PermissionsBitField>).has(p),
    )
    const botHasPermissions = localCommand.permissions.every(p =>
      (interaction.member?.permissions as Readonly<PermissionsBitField>).has(p),
    )

    if (!hasPermissions) return interaction.react('❌')
    if (!botHasPermissions) return interaction.react('❌')
  }

  const { callback } = localCommand
  callback(interaction, config, args)
}
