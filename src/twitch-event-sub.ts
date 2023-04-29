import { StaticAuthProvider } from '@twurple/auth'
import { ApiClient } from '@twurple/api'
import { ChatClient } from '@twurple/chat'
import type { PubSubBitsMessage, PubSubRedemptionMessage, PubSubSubscriptionMessage } from '@twurple/pubsub'
import { PubSubClient } from '@twurple/pubsub'
import { env } from '@app/env'

// const authProvider = new AppTokenAuthProvider(clientId, clientSecret)
const authProvider = new StaticAuthProvider(env.TWITCH_CLIENT_ID, env.TWITCH_ACCESS_TOKEN)
const apiClient = new ApiClient({ authProvider })

export class TwitchEventSub {

    chatClient: ChatClient | undefined
    pubSubClient: PubSubClient | undefined

    private async getUserId(userName: string): Promise<string> {
        const user = await apiClient.users.getUserByName(userName)
        if (user?.id != null) {
            return user.id
        }
        throw Error('twitch user id not found')
    }

    public async startEventSub() {
        const userName = env.TWITCH_USERNAME
        const userId = await this.getUserId(userName)
        await this.startChat(userName)
        this.startPubSubClient(`#${userName}`, userId)
    }

    public async startChat(userName: string) {
        this.chatClient = new ChatClient({ authProvider, channels: [ userName ] })

        await this.chatClient?.connect()

        this.chatClient.onMessage((channel: string, user: string, message: string) => {
            console.log(channel, message)
            if (message === '!ping') {
                this?.chatClient?.say(channel, `pong @${user}`)
                    .catch(e => console.error('failed to send message', e))
            }
        })

        console.log('Twitch Chat client connected')
    }

    public startPubSubClient(channel: string, userId: string) {
        this.pubSubClient = new PubSubClient({ authProvider })

        this.pubSubClient?.onSubscription(userId, (message: PubSubSubscriptionMessage) => {
            console.log(message)
        })

        this.pubSubClient?.onBits(userId, (message: PubSubBitsMessage) => {
            console.log(message)
        })

        this.pubSubClient?.onRedemption(userId, (message: PubSubRedemptionMessage) => {
            console.log('Redeemed:', message.rewardTitle)

            this?.chatClient?.say(channel, 'incoming lightshow')
                .catch(e => console.error('failed to send message', e))
        })

        console.log('Twitch PubSub client connected')
    }
}