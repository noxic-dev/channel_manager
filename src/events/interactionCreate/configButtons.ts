import { sql } from '@/utils/connections/postgresDb';
export default async (interaction: any) => {
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

      sql.query(query, values).then((result: any) => {
        interaction.update({
          content: `Feature ${featureName} has been ${action}d.`,
          ephemeral: true,
          components: [],
          embeds: [],
        });
      });
    }
  }
};
