import { twitchClient } from '@app/twitch-client';

export class CommandsController {
    public static async handle() {
        const commands = ['!task', '!project', '!embtr', '!beta', '!roadmap', '!backlog', '!discord', '!commands', '!dogcam', '!fishcam', '!riddle', '!specs'];
        const cleanCommandsString = commands.join(', ');
        await twitchClient.say('#thedevdad_', `Available commands: ${cleanCommandsString}`);
    }
}
