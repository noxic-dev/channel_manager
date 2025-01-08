import { MessageFlags, type ButtonInteraction } from 'discord.js';

import { sql } from '@/utils/connections/postgresDb';

export default async (
  interaction: ButtonInteraction<'cached'>
): Promise<unknown> => {
  if (!interaction.isButton() || !interaction.customId.startsWith('config:'))
    return;

  const configType = interaction.customId.split(':')[2];
  if (configType !== 'feature') return;

  const action = interaction.customId.split(':')[1];
  const featureName = interaction.customId.split(':')[3];
  const guildId = interaction.guild.id;

  const enableValue = action === 'enable';
  console.log(enableValue, guildId, featureName);

  const query = `UPDATE config SET ${featureName} = $1 WHERE guild_id = $2`;
  const values = [enableValue, guildId];

  await sql.query(query, values);

  interaction.reply({
    content: `Feature ${featureName} has been ${action}d.`,
    flags: MessageFlags.Ephemeral,
    components: [],
    embeds: []
  });
};
