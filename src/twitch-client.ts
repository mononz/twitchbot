import { env } from '@app/env';
import { ChatClient } from '@twurple/chat';
import { StaticAuthProvider } from '@twurple/auth';
import { ApiClient } from '@twurple/api';
import { PubSubClient } from '@twurple/pubsub';

const authProvider = new StaticAuthProvider(env.TWITCH_CLIENT_ID, env.TWITCH_ACCESS_TOKEN)
const apiClient = new ApiClient({ authProvider })

export const twitchChatClient = new ChatClient({ authProvider, channels: [ env.TWITCH_USERNAME ] })

export function twitchSay(message: string) {
    const channel = `#${env.TWITCH_USERNAME}`
    twitchChatClient.say(channel, message)
        .then(() => console.log('Sent Message', message))
        .catch(e => console.error('failed to send message', e))
}

export const twitchPubSubClient = new PubSubClient({ authProvider })

export async function getTwitchUserId(username: string) {
    const user = await apiClient.users.getUserByName(username)
    if (user?.id == null) {
        throw Error('user id not found')
    }
    return user.id
}