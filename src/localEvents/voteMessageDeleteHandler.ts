import eventBus from '@/utils/connections/eventBus';
import redis from '@/utils/connections/redis';
import {
  ButtonInteraction,
  ColorResolvable,
  EmbedBuilder,
  TextChannel,
  ContextMenuCommandInteraction,
  Message
} from 'discord.js';

const timeouts = new Map<string, NodeJS.Timeout>(); // Store timeout IDs for each messageId
const cooldowns = new Map<string, NodeJS.Timeout>(); // Store cooldowns for each user
const animationFrames = ['.', '..', '...', '....', '...', '..', '.'];

// Store vote details (votes, started time, and color) for each messageId
const voteDetails = new Map<
  string,
  {
    yes: number;
    no: number;
    startedAt: number;
    color: string;
    baseMessage?: unknown;
  }
>();

export default function voteMessageDeleteHandler(): void {
  eventBus.on('voteMessageInitiated', async (data) => {
    console.debug('voteMessageInitiated event received', { data });
    if (!data.messageId || !data.interaction) return;
    const interaction = data.interaction as
      | ButtonInteraction<'cached'>
      | ContextMenuCommandInteraction;
    if (!interaction.channel) return;

    const messageId = data.messageId;
    const voteKey = `voteMessage:${messageId}`;

    // Fetch existing vote data or initialize if not present
    let voteData;
    try {
      voteData = await redis.get(voteKey);
    } catch (error) {
      console.error(
        `Failed to fetch vote data from Redis for messageId: ${messageId}`,
        { error }
      );
      return;
    }

    let [yes, no, startedAt, color] = voteData
      ?.split(':')
      .map((val, idx) => (idx < 3 ? parseFloat(val) : val)) || [
      0,
      0,
      Date.now().toString(),
      '#2f3136'
    ];

    yes = typeof yes === 'number' && !isNaN(yes) ? yes : 0;
    no = typeof no === 'number' && !isNaN(no) ? no : 0;
    startedAt =
      typeof startedAt === 'string' && startedAt
        ? parseInt(startedAt)
        : Date.now();
    color = typeof color === 'string' ? color : '#2f3136';

    // Store the vote details in the collection
    voteDetails.set(messageId, {
      yes,
      no,
      startedAt,
      color,
      baseMessage: data.voteMessage
    });

    // Set TTL for 120 seconds from the initiation time
    const ttl = Math.max(0, 120000 - (Date.now() - startedAt));
    try {
      updateVoteMessage(
        messageId,
        interaction,
        true,
        animationFrames[0],
        data.voteMessage
      );
      await redis.set(voteKey, `${yes}:${no}:${startedAt}:${color}`, {
        EX: ttl
      });
      console.debug('Vote initiation details saved to Redis', {
        messageId,
        yes,
        no,
        startedAt,
        color,
        ttl
      });
    } catch (error) {
      console.error(
        `Failed to save vote initiation details to Redis for messageId: ${messageId}`,
        { error }
      );
    }

    // Cancel any existing timeout for this messageId
    if (timeouts.has(messageId)) {
      clearTimeout(timeouts.get(messageId)!);
      console.debug(`Cleared existing timeout for messageId: ${messageId}`);
    }

    // Schedule an event to run after the remaining TTL
    const timeout = setTimeout(() => {
      console.debug(
        `Timeout reached for messageId: ${messageId}, emitting voteExpired event`
      );
      eventBus.emit('voteExpired', { messageId, interaction });
      timeouts.delete(messageId);
    }, ttl);

    timeouts.set(messageId, timeout);
    console.debug(
      `Timeout set for messageId: ${messageId} with TTL of ${
        ttl / 1000
      } seconds.`
    );

    // Update the vote message embed for initiation and set content to ""
    await updateVoteMessage(messageId, interaction, true, animationFrames[0]);
  });

  eventBus.on('voteMessageUpdate', async (data) => {
    console.debug('voteMessageUpdate event received', { data });
    if (!data.messageId || !data.type || !data.interaction) return;
    const interaction = data.interaction as ButtonInteraction<'cached'>;
    if (!interaction.channel) return;

    const userId = interaction.user.id;
    if (cooldowns.has(userId)) {
      console.debug(`User ${userId} is on cooldown.`);
      await interaction.reply({
        content: 'You can only vote once every 5 seconds.',
        ephemeral: true
      });
      return;
    }

    // Set a 5-second cooldown for the user
    const cooldown = setTimeout(() => {
      cooldowns.delete(userId);
      console.debug(`Cooldown expired for user ${userId}`);
    }, 5000);
    cooldowns.set(userId, cooldown);

    await interaction.deferUpdate();

    const messageId = data.messageId;
    const voteType = data.type;

    // Fetch existing vote details from the collection
    const voteDetail = voteDetails.get(messageId);
    if (!voteDetail) {
      console.debug(
        `Vote details not found in collection for messageId: ${messageId}`
      );
      return;
    }

    // eslint-disable-next-line prefer-const
    let { yes, no, startedAt, color } = voteDetail;

    if (voteType === 'vote') {
      const currentVote = interaction.customId.split(':')[2];
      const userVoteKeyYes = `voteMessage:${messageId}:users:yes`;
      const userVoteKeyNo = `voteMessage:${messageId}:users:no`;

      // Remove previous vote if exists
      if (await redis.sIsMember(userVoteKeyYes, userId)) {
        yes = Math.max(0, yes - 1);
        await redis.sRem(userVoteKeyYes, userId);
        console.debug(
          `User ${userId} removed from yes votes for messageId: ${messageId}`
        );
      } else if (await redis.sIsMember(userVoteKeyNo, userId)) {
        no = Math.max(0, no - 1);
        await redis.sRem(userVoteKeyNo, userId);
        console.debug(
          `User ${userId} removed from no votes for messageId: ${messageId}`
        );
      }

      // Add the new vote
      if (currentVote === 'yes') {
        yes++;
        await redis.sAdd(userVoteKeyYes, userId);
        console.debug(
          `User ${userId} added to yes votes for messageId: ${messageId}`
        );
      } else if (currentVote === 'no') {
        no++;
        await redis.sAdd(userVoteKeyNo, userId);
        console.debug(
          `User ${userId} added to no votes for messageId: ${messageId}`
        );
      }

      // Determine embed color based on votes
      if (yes > no) {
        color = '#57F287'; // Green if yes votes lead
      } else if (no > yes) {
        color = '#FF0000'; // Red if no votes lead
      } else {
        color = '#2f3136'; // Default to gray if tied or no votes
      }

      // Update the vote details in the collection and Redis
      voteDetails.set(messageId, {
        yes,
        no,
        startedAt,
        color,
        baseMessage: voteDetail.baseMessage
      });

      // Update the vote data with the new color and TTL in Redis
      const ttl = Math.max(0, 120000 - (Date.now() - startedAt));
      try {
        await redis.set(
          `voteMessage:${messageId}`,
          `${yes}:${no}:${startedAt}:${color}`,
          { EX: ttl }
        );
        console.debug('Updated vote details in Redis and collection', {
          messageId,
          yes,
          no,
          color,
          ttl
        });
      } catch (error) {
        console.error(
          `Failed to update vote details in Redis for messageId: ${messageId}`,
          { error }
        );
      }

      // Update the vote message embed only if a new vote has been cast
      await updateVoteMessage(
        messageId,
        interaction,
        false,
        animationFrames[0]
      );
    }
  });

  eventBus.on('voteExpired', async (data) => {
    console.debug('voteExpired event received', { data });
    const messageId = data.messageId;
    const interaction = data.interaction as
      | ButtonInteraction<'cached'>
      | ContextMenuCommandInteraction;

    const votes = await redis.get(`voteMessage:${messageId}`);
    if (!votes) {
      console.debug(
        `No vote data found for messageId: ${messageId}, exiting expiration handler.`
      );
      return;
    }

    const [yes, no] = votes.split(':').map((val) => parseFloat(val) || 0);
    const total = yes + no;

    if (total === 0) {
      console.debug(
        `No votes received for messageId: ${messageId}, deleting data.`
      );
      await redis.del(`voteMessage:${messageId}`);
      voteDetails.delete(messageId);
      return;
    }
    const baseMessage = voteDetails.get(messageId)?.baseMessage as Message;
    if (yes > no && total >= 3) {
      const message = await fetchMessageById(messageId, interaction);
      if (message) {
        console.debug(
          `Deleting messageId: ${messageId} due to vote expiration with Yes votes leading.`
        );
        await message.delete();
        await redis.del(`voteMessage:${messageId}`);
        baseMessage.edit({
          embeds: [],
          components: [],
          content: "Vote ended, 'No' votes lead. Cancelling deletion..."
        });
        new Promise((resolve) => setTimeout(resolve, 12000)).then(() =>
          baseMessage.delete()
        );
      }
    } else {
      console.debug(
        `Not enough votes or no majority for deletion for messageId: ${messageId}.`
      );
      await redis.del(`voteMessage:${messageId}`);
      baseMessage.edit({
        embeds: [],
        components: [],
        content:
          "Vote ended, Not enough votes or 'No' votes lead. Cancelling deletion..."
      });
      new Promise((resolve) => setTimeout(resolve, 12000)).then(() =>
        baseMessage.delete()
      );
    }

    //1312817023507496961
    //1312817023507496961

    // Clear timeout entries as the event is now complete
    timeouts.delete(messageId);
    voteDetails.delete(messageId);
    console.debug(
      `Cleared timeout and interval entries for messageId: ${messageId}`
    );
  });
}

async function updateVoteMessage(
  messageId: string,
  interaction: ButtonInteraction<'cached'> | ContextMenuCommandInteraction,
  isInitiation: boolean,
  animationFrame: string,
  voteMessage?: Message
): Promise<void> {
  let message;
  try {
    if ('message' in interaction && interaction.message) {
      message = interaction.message;
    } else {
      message = voteMessage;
    }
  } catch (error) {
    console.debug(`Failed to fetch message with messageId: ${messageId}`, {
      error
    });
    return;
  }
  if (!message) return;

  // Fetch existing vote details from the collection
  const voteDetail = voteDetails.get(messageId);
  if (!voteDetail) {
    console.debug(
      `Vote details not found in collection for messageId: ${messageId}`
    );
    return;
  }

  const { yes, no, startedAt, color } = voteDetail;

  const total = yes + no;
  const percentageYes = total > 0 ? (yes / total) * 100 : 0;
  const percentageNo = 100 - percentageYes;

  const now = Date.now();
  const timeLeft = Math.max(0, 120000 - (now - startedAt));
  const timestamp = `<t:${Math.floor((startedAt + 120000) / 1000)}:R>`;

  const embed = new EmbedBuilder()
    .setTitle('Vote to Delete Message')
    .setDescription(
      `**Delete the message I have replied to**
      
**Yes Votes**: ${yes} (${percentageYes.toFixed(2)}%)
**No Votes**: ${no} (${percentageNo.toFixed(2)}%)
      
**Status:** Voting in progress${animationFrame}, ends ${timestamp}.`
    )
    .setColor(
      typeof color === 'string' && color
        ? (color as ColorResolvable)
        : '#2f3136'
    )
    .setTimestamp();

  console.debug('Updating vote message embed', {
    messageId,
    yes,
    no,
    color,
    timeLeft,
    timestamp
  });
  try {
    await message.edit({ embeds: [embed], content: '' });
  } catch (error) {
    console.debug(`Failed to edit message with messageId: ${messageId}`, {
      error
    });
  }
}

async function fetchMessageById(
  messageId: string,
  interaction: ButtonInteraction<'cached'> | ContextMenuCommandInteraction
) {
  const channel = interaction.channel as TextChannel;
  try {
    return await channel.messages.fetch(messageId);
  } catch (error) {
    console.debug(`Failed to fetch message with messageId: ${messageId}`, {
      error
    });
    return null;
  }
}
