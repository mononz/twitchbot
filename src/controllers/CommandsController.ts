import { twitchClient } from '@app/twitch-client';
import { exec } from 'child_process';
import { messageHandlers } from '..';

export class CommandsController {
    public static async handle() {
        const commands = ['!task', '!project', '!embtr', '!beta', '!roadmap', '!backlog', '!discord', '!commands', '!fishcam', '!riddle', '!specs'];
        const cleanCommandsString = commands.join(', ');
        await twitchClient.say('#thedevdad_', `Available commands: ${cleanCommandsString}`);
    }
}
