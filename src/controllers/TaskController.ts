import { twitchClient } from '@app/twitch-client';
import { readFile, writeFile } from 'fs/promises';

export class TaskController {
    public static async handle(message: string, username: string) {
        if (username === 'thedevdad_') {
            await writeFile('out/currenttask.txt', message);
        } else {
            await twitchClient.say('#thedevdad_', 'current task: ' + (await readFile('out/currenttask.txt', 'utf-8')));
        }
    }
}
