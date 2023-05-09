import { logger } from './logger'
import { twitchChatClient, twitchPubSubClient, getTwitchUserId } from './twitch-client'
import { getLightInfo, lights } from './hue-client'
import { TaskController } from './controllers/TaskController'
import { ChannelPointsController } from './controllers/ChannelPointsController'
import { PubSubBitsMessage, PubSubRedemptionMessage, PubSubSubscriptionMessage } from '@twurple/pubsub';
import { env } from '@app/env';

startTwitch().catch(e => console.error(e))

async function startTwitch() {

    const username = env.TWITCH_USERNAME
    const twitchUserId = await getTwitchUserId(username)
    const channel = `#${username}`

    twitchChatClient.connect()
        .then(() => console.log(`Twitch clients connected for - ${twitchUserId}`))
        .catch(e => console.error(e))

    twitchChatClient.onMessage((channel: string, user: string, message: string) => {
        handleTwitchMessage(channel, user, message).catch(e => console.error(e))
    })

    twitchPubSubClient.onSubscription(twitchUserId, (message: PubSubSubscriptionMessage) => {
        handleSubscription().catch(e => console.error(e))
    })

    twitchPubSubClient.onBits(twitchUserId, (message: PubSubBitsMessage) => {
        handleBitsRedeem().catch(e => console.error(e))
    })

    twitchPubSubClient.onRedemption(twitchUserId, (message: PubSubRedemptionMessage) => {
        handleTwitchRedeem(message).catch(e => console.error(e))
    })

    console.log('Twitch PubSub client connected')

    await getLightInfo()
}

async function handleTwitchMessage(channel: string, user: string, message: string) {
    // Log the message and who sent it
    logger.log(user, message)

    // Ignore messages from the bot
    if (user === 'thedevdadbot') return  // todo, ignore bot messages

    await TaskController.handle(message, user)
}

async function handleTwitchRedeem(message: PubSubRedemptionMessage) {
    if (message.rewardTitle) {
        console.log('Redeem:', `${message.userName ?? '?'} is redeeming ${message.rewardTitle}`)
        await ChannelPointsController.handle(message.rewardTitle, message.message)
    }
}

async function handleBitsRedeem() {
    await ChannelPointsController.handle('bits', '')
}

async function handleSubscription() {
    await ChannelPointsController.handle('subscription', '')
}

console.log('twitch bot starting')
