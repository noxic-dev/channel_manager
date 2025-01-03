import { Client, PermissionsBitField } from "discord.js";
import express, { Request, Response, Application } from "express";
import { sql } from "@/utils/connections/postgresDb";

export default (client: Client) => {
  const web: Application = express();
  web.use(express.json()); // Ensure JSON middleware is added
  // @ts-ignore
  web.use("*", (req, res) => {
    return res
      .status(200)
      .send(
        "Webserver for ChannelManager by Noxic is currently innaccessible."
      );
  });

  // Root route for health check
  web.get("/", (req: Request, res: Response) => {
    res.send("Hello, World! Webserver is running.");
  });

  web.post("/config", async (req: Request, res: Response) => {
    const allowedFeatures = ["prune-channel"];

    const { guildId, feature, value } = req.body;

    if (!guildId || !feature) {
      res.status(400).json({
        error: 'Missing "guildId" or "feature" in request body',
      });
      return;
    }

    const normalizedFeature = feature.replace("_", "-"); // Replace dashes with underscores
    if (!allowedFeatures.includes(normalizedFeature)) {
      res.status(400).json({ error: "Invalid feature name" });
      return;
    }

    try {
      await sql.query(
        `UPDATE features SET allow_${normalizedFeature.replace(
          "-",
          "_"
        )} = $1 WHERE serverid = $2`,
        [value, guildId]
      );

      res.status(200).json({ message: "Feature updated successfully!" });
    } catch (error) {
      console.error("Error updating feature:", error);
      res
        .status(500)
        .json({ error: "An error occurred while updating the feature." });
    }
  });

  // Fetch guilds where the user has "Manage Guild" permissions
  // @ts-ignore
  web.get("/guilds", async (req: Request, res: Response) => {
    const userId = req.query.userId as string;

    if (!userId) {
      return res
        .status(400)
        .json({ error: 'Missing "userId" query parameter' });
    }

    try {
      const guildsWithManageGuild: {
        id: string;
        name: string;
        icon: string | null;
      }[] = [];

      for (const [guildId, guild] of client.guilds.cache) {
        try {
          const member = await guild.members.fetch(userId);
          if (member.permissions.has(PermissionsBitField.Flags.ManageGuild)) {
            guildsWithManageGuild.push({
              id: guild.id,
              name: guild.name,
              icon: guild.iconURL({ size: 1024 }) || null,
            });
          }
        } catch (error) {
          console.error(`Error fetching member in guild "${guild.name}":`);
        }
      }

      return res.status(200).json({ guilds: guildsWithManageGuild });
    } catch (error) {
      console.error("Error processing guilds:", error);
      return res
        .status(500)
        .json({ error: "An error occurred while processing the request." });
    }
  });

  // Fetch features for a specific guild
  // @ts-ignore
  web.get("/features", async (req: Request, res: Response) => {
    const guildId = req.query.guildId as string;

    if (!guildId) {
      return res
        .status(400)
        .json({ error: 'Missing "guildId" query parameter' });
    }

    try {
      const result = await sql.query(
        "SELECT * FROM features WHERE serverid = $1",
        [guildId]
      );

      if (result.rowCount === 0) {
        return res
          .status(404)
          .json({ error: "No features found for this guild" });
      }

      // Remove "allow_" prefix from each feature
      const formattedFeatures = result.rows.map((row: any) => {
        const updatedRow = { ...row };
        for (const key in updatedRow) {
          if (typeof updatedRow[key] === "string" && key.startsWith("allow_")) {
            updatedRow[key.replace("allow_", "")] = updatedRow[key];
            delete updatedRow[key];
          }
        }
        return updatedRow;
      });

      return res.status(200).json({ features: formattedFeatures });
    } catch (error) {
      console.error("Error fetching features from database:", error);
      return res.status(500).json({
        error: "An error occurred while fetching features from the database.",
      });
    }
  });

  // Fetch detailed guild data
  // @ts-ignore
  web.get("/guild", async (req: Request, res: Response) => {
    const guildId = req.query.guildId as string;

    if (!guildId) {
      return res
        .status(400)
        .json({ error: 'Missing "guildId" query parameter' });
    }

    try {
      // Fetch the guild from Discord.js client
      const guild = await client.guilds.fetch(guildId);

      if (!guild) {
        return res.status(404).json({ error: "Guild not found" });
      }

      // Collect guild data
      const guildData = {
        id: guild.id,
        name: guild.name,
        icon: guild.iconURL({ size: 1024 }),
        memberCount: guild.memberCount,
        ownerId: guild.ownerId,
        description: guild.description || "No description available",
        createdAt: guild.createdAt,
      };

      return res.status(200).json(guildData);
    } catch (error) {
      return res
        .status(500)
        .json({ error: "An error occurred while fetching guild data." });
    }
  });

  // Start the web server
  web.listen(3001, () => console.log("Webserver started on port 3001"));
};
