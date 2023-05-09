import { logger } from './logger'
import { twitchChatClient, twitchPubSubClient, getTwitchUserId, twitchSay } from './twitch-client'
import { getLightInfo } from './hue-client'
import { TaskController } from './controllers/TaskController'
import { ChannelPointsController } from './controllers/ChannelPointsController'
import { PubSubBitsMessage, PubSubRedemptionMessage, PubSubSubscriptionMessage } from '@twurple/pubsub';
import { env } from '@app/env';

startTwitch().catch(e => console.error(e))

async function startTwitch() {

    const username = env.TWITCH_USERNAME
    const twitchUserId = await getTwitchUserId(username)

    const controller = new ChannelPointsController()

    twitchChatClient.connect()
        .then(() => console.log(`Twitch clients connected for - ${twitchUserId}`))
        .catch(e => console.error(e))

    twitchChatClient.onMessage((channel: string, user: string, message: string) => {
        handleTwitchMessage(channel, user, message).catch(e => console.error(e))
    })

    twitchPubSubClient.onSubscription(twitchUserId, (message: PubSubSubscriptionMessage) => {
        twitchSay(`What the deuce! Thanks for the the sub @${message.userName}!`)
        controller.lightsPolice()
    })

    twitchPubSubClient.onBits(twitchUserId, (message: PubSubBitsMessage) => {
        const user = message.userName
        twitchSay(`You're a bit of a legend ${user ? `@${user}` : ''}}, Thanks!`)
        controller.lightsPolice()
    })

    twitchPubSubClient.onRedemption(twitchUserId, (message: PubSubRedemptionMessage) => {
        if (message.rewardTitle) {
            console.log('Redeem:', `${message.userName ?? '?'} is redeeming ${message.rewardTitle}`)
            controller.handleRedeem(message.rewardTitle, message.message).catch(e => console.error(e))
        }
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

console.log('twitch bot starting')
