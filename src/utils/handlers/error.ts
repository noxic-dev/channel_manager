import { AttachmentBuilder, WebhookClient } from "discord.js";
import fs from "fs";

// Replace with your webhook URL
const WEBHOOK_URL = `https://discord.com/api/webhooks/${process.env.WEBHOOK_SECRET}`;

// Create a WebhookClient
const webhookClient = new WebhookClient({ url: WEBHOOK_URL });

export default async function errorHandler(err: Error): Promise<void> {
    console.error("Caugth an error:", err);

    const textContent = `An error occurred:\n${err.message}\n\nStack trace:\n${err.stack}`;
    const fileName = "error-log.txt";

    try {
    // Write the error log to a file
        fs.writeFileSync(fileName, textContent);

        // Create an attachment for the file
        const file = new AttachmentBuilder(fileName);

        // Send the error details via the webhook
        await webhookClient.send({
            username: "ChannelManager errors",
            content: "An error occurred. Here is the error log:",
            files: [file],
            embeds: [
                {
                    title: "Error Details",
                    description: `\`\`\`\n${err.message}\n\`\`\``,
                    color: 0xff0000, // Red color
                    timestamp: new Date().toISOString()
                }
            ]
        });

        console.log("Error log sent successfully!");
    } catch (sendError) {
        console.error("Failed to send the error log:", sendError);
    } finally {
    // Clean up the file after sending
        if (fs.existsSync(fileName)) {
            fs.accessSync(fileName, fs.constants.R_OK | fs.constants.W_OK);
            fs.unlinkSync(fileName);
        }
    }
}