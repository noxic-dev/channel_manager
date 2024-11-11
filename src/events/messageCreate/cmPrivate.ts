import * as config from '@config'
import {
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  EmbedBuilder,
  type Message,
  TextChannel,
} from 'discord.js'

export default async (message: Message): Promise<unknown> => {
  if (!(message.channel instanceof TextChannel)) return
  if (!message.guild) return

  const ownerId = config.ownerId
  const allowedIds = [ownerId, '1254870182032310455']
  const args = message.content.split(' ')
  let prefix
  if (message.client.user.id !== '1303334967949922396') prefix = '.cm'
  else prefix = '.cm-dev'
  if (!args[0] || args[0] !== prefix) return
  if (!args[1]) return
  if (!allowedIds.includes(message.author.id)) return message.react('❌')

  const addDeleteButton = async (msg: Message): Promise<void> => {
    const actionRow = new ActionRowBuilder<ButtonBuilder>().addComponents(
      new ButtonBuilder()
        .setStyle(ButtonStyle.Secondary)
        .setEmoji('<:TrashBin_red:1303739433408794696>')
        .setCustomId(`DeleteResponse:${msg.id}:${message.author.id}`),
    )
    await msg.edit({ components: [actionRow] })
  }

  switch (args[1].toLowerCase()) {
    case 'ping': {
      const pingMessage = await message.channel.send('Pong!')
      addDeleteButton(pingMessage)
      await message.delete().catch(console.error)

      return
    }

    case 'eval': {
      if (!args[2]) return message.channel.send('No code provided.')

      let code = args.slice(2).join(' ')
      let originalCode = code
      if (
        (code.startsWith('```js') && code.endsWith('```'))
        || (code.startsWith('```') && code.endsWith('```'))
      ) {
        code = code.replace(/^```js|^```/, '')
        code = code.slice(0, -3).trim()
        originalCode = code
        code = `(async () => {${code}})()`
      }
      console.log(code)
      if (code.includes('await'))
        await message.react('<:soonTM:1303726162668949554>')

      let consoleOutput = ''
      const originalConsoleLog = console.log

      console.log = (...args): void => {
        const log = args.join(' ')
        consoleOutput += `${log}\n`
        originalConsoleLog(...args)
      }

      let botResponse
      try {
        const asyncEval = async (): Promise<unknown> => await eval(code)
        let evaled = await asyncEval()

        console.log = originalConsoleLog

        if (evaled instanceof Promise) {
          evaled = await evaled
          await message.react('✅')
        }

        const finalConsoleOutput
          = consoleOutput.trim() || 'No logs during eval.'

        const embed = new EmbedBuilder()
          .setTitle('Eval Success')
          .setDescription(`\`\`\`js\n${originalCode}\n\`\`\``)
          .addFields({
            name: 'Console Output',
            value: `\`\`\`js\n${finalConsoleOutput.slice(0, 2_000)}\n\`\`\``,
          })
          .setColor('Green')
        botResponse = await message.channel.send({ embeds: [embed] })
        addDeleteButton(botResponse)
      }
      catch (error: unknown) {
        console.log = originalConsoleLog
        message.react('❌')

        const errorEmbed = new EmbedBuilder()
          .setTitle('Eval Failed')
          .setDescription(`\`\`\`js\n${`${error}`.slice(0, 2_000)}\n\`\`\``)
          .setColor('Red')
        botResponse = await message.channel.send({ embeds: [errorEmbed] })
        addDeleteButton(botResponse)
      }
      await message.delete().catch(console.error)
      break
    }

    case 'execute': {
      const { exec } = require('child_process')
      const { promisify } = require('util')

      // Promisify exec for async/await support
      const execAsync = promisify(exec)

      // Ensure the user provided a command
      if (!args[2]) {
        const noCommandMessage = await message.channel.send(
          'No code provided.',
        )
        addDeleteButton(noCommandMessage)
        await message.delete().catch(console.error)
        break
      }

      // Combine the provided arguments into a single command
      const command = args.slice(2).join(' ')

      // Function to validate the command to prevent unsafe operations
      const isUnsafeCommand = (cmd: string): boolean => {
        const unsafePatterns = [
          /rm -rf/,
          /shutdown/,
          /:(){:|:&};:/,
          /mkfs/,
          /dd if=/,
        ] // Add more patterns as needed

        return unsafePatterns.some(pattern => pattern.test(cmd))
      }

      // Check if the command is unsafe
      if (isUnsafeCommand(command)) {
        const unsafeMessage = await message.channel.send(
          'The command you tried to run is considered unsafe.',
        )
        addDeleteButton(unsafeMessage)
        await message.delete().catch(console.error)
        break
      }

      try {
        // Execute the command and wait for the result
        const { stdout, stderr } = await execAsync(command)

        let embed
        if (stderr) {
          console.error('Command Error:', stderr)
          embed = new EmbedBuilder()
            .setTitle('Command Execution Failed')
            .setDescription(`\`\`\`sh\n${command}\n\`\`\``)
            .addFields({
              name: 'Error Output',
              value: `\`\`\`sh\n${stderr.slice(0, 2_000)}\n\`\`\``,
            })
            .setColor('Red')
        }
        else {
          console.log('Command Output:', stdout)
          embed = new EmbedBuilder()
            .setTitle('Command Execution Success')
            .setDescription(`\`\`\`sh\n${command}\n\`\`\``)
            .addFields({
              name: 'Standard Output',
              value: `\`\`\`sh\n${stdout.slice(0, 2_000)}\n\`\`\``,
            })
            .setColor('Green')
        }

        const botResponse = await message.channel.send({ embeds: [embed] })
        addDeleteButton(botResponse)
      }
      catch (error: Error | unknown) {
        if (!(error instanceof Error)) return
        // Handle execution errors
        console.error('Execution Failed:', error.message || error)

        const failEmbed = new EmbedBuilder()
          .setTitle('Command Execution Failed')
          .setDescription(`\`\`\`sh\n${command}\n\`\`\``)
          .addFields({
            name: 'Error Message',
            value: `\`\`\`sh\n${error.message || error}\n\`\`\``,
          })
          .setColor('Red')
        const failMessage = await message.channel.send({ embeds: [failEmbed] })
        addDeleteButton(failMessage)
      }
      await message.delete().catch(console.error)
      break
    }

    default: {
      const invalidMessage = await message.channel.send('Invalid command.')
      addDeleteButton(invalidMessage)
      await message.delete().catch(console.error)
    }
  }
}
