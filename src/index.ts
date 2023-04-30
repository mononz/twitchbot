import { logger } from './logger'
import { twitchChatClient, twitchPubSubClient, twitchSay, getTwitchUserId } from './twitch-client'
import { TaskController } from './controllers/TaskController'
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
        console.log(message)
    })

    twitchPubSubClient.onBits(twitchUserId, (message: PubSubBitsMessage) => {
        console.log(message)
    })

    twitchPubSubClient.onRedemption(twitchUserId, (message: PubSubRedemptionMessage) => {
        handleTwitchRedeem(channel, message) // .catch(e => console.error(e))
    })

    console.log('Twitch PubSub client connected')
}

async function handleTwitchMessage(channel: string, user: string, message: string) {
    // Log the message and who sent it
    logger.log(user, message)

    // Ignore messages from the bot
    if (user === 'thedevdadbot') return  // todo, ignore bot messages

    await TaskController.handle(message, user)
}

function handleTwitchRedeem(channel: string, message: PubSubRedemptionMessage) {
    console.log('Redeemed:', message.rewardTitle)
    twitchSay(`@${message.userName ?? '?'} redeemed ${message.rewardTitle ?? '?'}`)
}

console.log('twitch bot starting')
