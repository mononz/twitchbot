import { RiddleController } from './controllers/RiddleController';
import { CameraController } from './controllers/FishController';
import { logger } from './logger';
import { twitchClient } from './twitch-client';
import { TwitchEventSub } from './twitch-event-sub';
import { SpecsController } from '@app/controllers/SpecsController';
import { CommandsController } from './controllers/CommandsController';
import { TaskController } from './controllers/TaskController';
import { env } from '@app/env'

export const messageHandlers = {
    '!fishcam': CameraController.handle,
    '!dogcam': CameraController.handle,
    '!riddle': RiddleController.handle,
    '!specs': SpecsController.handle,
    '!commands': CommandsController.handle,
} satisfies Record<string, (message: string, username: string) => Promise<void>>;

const monoHackerModeEnabled = true

if (monoHackerModeEnabled) {
    const eventSub = new TwitchEventSub()
    eventSub.startEventSub()
        .catch(e => {
            console.error(e)
        })

} else {
    twitchClient.connect();

    twitchClient.on('message', (_channel, state, message) => {
        const username = state['display-name'];

        // Ignore messages from the bot
        if (!username || username === 'thedevdadbot' || username === env.TWITCH_USERNAME) return; // todo

        // Log the message and who sent it
        logger.log(username, message);

        // Get the command from the message
        const command = message.split(' ')[0] as keyof typeof messageHandlers;

        // If this is a command we know about, handle it
        if (messageHandlers[command]) {
            messageHandlers[command](message, username);
        } else {
            RiddleController.handle(message, username);
            TaskController.handle(message, username);
        }
    });
}
