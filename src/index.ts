import { logger } from './logger'
import { twitchChatClient, getTwitchUserId, twitchSay, twitchWsClient } from './twitch-client';
import { getLightInfo, hueAnimations } from './hue-client';
import { TaskController } from './controllers/TaskController'
import { ChannelPointsController } from './controllers/ChannelPointsController'
import { env } from '@app/env';
import type { EventSubChannelFollowEvent } from '@twurple/eventsub-base';
import type { EventSubChannelRedemptionAddEvent, EventSubChannelSubscriptionEvent } from '@twurple/eventsub-base';
import type { EventSubExtensionBitsTransactionCreateEvent} from '@twurple/eventsub-base/lib/events/EventSubExtensionBitsTransactionCreateEvent';
import { EventSubChannelCheerEvent } from '@twurple/eventsub-base';
import { HelixCustomRewardRedemptionTargetStatus } from '@twurple/api';

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

    twitchWsClient.onChannelSubscription(twitchUserId, (event: EventSubChannelSubscriptionEvent) => {
        twitchSay(`What the deuce! Thanks for the the sub @${event.userDisplayName}! mononzShipit`)
        controller.runLightAnimation(hueAnimations.police).catch(e => console.error(e))
    })

    twitchWsClient.onChannelFollow(twitchUserId, twitchUserId, (event: EventSubChannelFollowEvent) => {
        twitchSay(`Ayyyy, thanks for the follow ${event.userDisplayName}`)
        controller.runLightAnimation(hueAnimations.flash).catch(e => console.error(e))
    })

    twitchWsClient.onChannelCheer(twitchUserId, (event: EventSubChannelCheerEvent) => {
        const user = event.userDisplayName
        twitchSay(`You're a bit of a legend ${user ? `@${user}` : 'anon'}, Thanks!`)
        controller.runLightAnimation(hueAnimations.police).catch(e => console.error(e))
    })

    twitchWsClient.onChannelRedemptionAdd(twitchUserId, (event: EventSubChannelRedemptionAddEvent) => {
        if (event.rewardTitle) {
            console.log('Redeem:', `${event.userName ?? '?'} is redeeming ${event.rewardTitle}`)
            controller.handleRedeem(event.rewardTitle)
                .then(result => {
                    if (result) {
                        const redemptionStatus: HelixCustomRewardRedemptionTargetStatus = result
                            ? 'FULFILLED'
                            : 'CANCELED'
                        //event.updateStatus(redemptionStatus).catch(e => console.error(e))
                    }
                })
                .catch(e => console.error(e))
        }
    })

    twitchWsClient.start()

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
