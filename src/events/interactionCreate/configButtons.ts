import { sql } from '@/utils/connections/postgresDb';
import { ButtonInteraction } from 'discord.js';
import { QueryResult } from 'pg';
export default async (interaction: ButtonInteraction<'cached'>) => {
  if (interaction.isButton() && interaction.customId.startsWith('config:')) {
    const configType = interaction.customId.split(':')[2];

    if (configType === 'feature') {
      const action = interaction.customId.split(':')[1];
      const featureName = interaction.customId.split(':')[3];
      const guildId = interaction.guild.id;

      const enableValue = action === 'enable';
      console.log(enableValue, guildId, featureName);

      const query = `UPDATE config SET ${featureName} = $1 WHERE guild_id = $2`;
      const values = [enableValue, guildId];

      sql.query(query, values).then((result: QueryResult) => {
        interaction.reply({
          content: `Feature ${featureName} has been ${action}d.`,
          ephemeral: true,
          components: [],
          embeds: [],
        });
      });
    }
  }
};
