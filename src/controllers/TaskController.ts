import { twitchClient } from '@app/twitch-client';
import { readFile, writeFile } from 'fs/promises';

export class TaskController {
    public static async handle(message: string, username: string) {
        //if message starts with !task
        if (message.toLowerCase().startsWith('!task')) {
            this.handleTaskCommand(message, username);
        } else if (message.toLowerCase().startsWith('!project')) {
            this.handleProjectCommand(message, username);
        } else if (message.toLowerCase().startsWith('!embtr')) {
            this.handleEmbtrCommand(message, username);
        } else if (message.toLowerCase().startsWith('!beta')) {
            this.handleBetaCommand(message, username);
        } else if (message.toLowerCase().startsWith('!roadmap')) {
            this.handleRoadmapCommand(message, username);
        } else if (message.toLowerCase().startsWith('!backlog')) {
            this.handleBacklogCommand(message, username);
        } else if (message.toLowerCase().startsWith('!discord')) {
            this.handleDiscordCommand(message, username);
        }
    }

    private static async handleTaskCommand(message: string, username: string) {
        if (message.startsWith('!task ') && username === 'thedevdad_') {
            message = message.replace('!task ', '');
            await writeFile('out/currenttask.txt', message);
        } else {
            await twitchClient.say('#thedevdad_', 'current task: ' + (await readFile('out/currenttask.txt', 'utf-8')));
        }
    }

    private static async handleProjectCommand(message: string, username: string) {
        if (message.startsWith('!project ') && username === 'thedevdad_') {
            message = message.replace('!project ', '');
            await writeFile('out/currentproject.txt', message);
        } else {
            await twitchClient.say('#thedevdad_', 'project: ' + (await readFile('out/currentproject.txt', 'utf-8')));
        }
    }

    private static async handleEmbtrCommand(message: string, username: string) {
        if (message.startsWith('!embtr ') && username === 'thedevdad_') {
            message = message.replace('!beta ', '');
            await writeFile('out/beta.txt', message);
        } else {
            await twitchClient.say('#thedevdad_', await readFile('out/beta.txt', 'utf-8'));
        }
    }

    private static async handleBetaCommand(message: string, username: string) {
        if (message.startsWith('!beta ') && username === 'thedevdad_') {
            message = message.replace('!beta ', '');
            await writeFile('out/beta.txt', message);
        } else {
            await twitchClient.say('#thedevdad_', 'beta: ' + (await readFile('out/beta.txt', 'utf-8')));
        }
    }

    private static async handleRoadmapCommand(message: string, username: string) {
        if (message.startsWith('!roadmap ') && username === 'thedevdad_') {
            message = message.replace('!roadmap ', '');
            await writeFile('out/roadmap.txt', message);
        } else {
            await twitchClient.say('#thedevdad_', 'roadmap: ' + (await readFile('out/roadmap.txt', 'utf-8')));
        }
    }

    private static async handleBacklogCommand(message: string, username: string) {
        if (message.startsWith('!backlog ') && username === 'thedevdad_') {
            message = message.replace('!backlog ', '');
            await writeFile('out/backlog.txt', message);
        } else {
            await twitchClient.say('#thedevdad_', 'backlog: ' + (await readFile('out/backlog.txt', 'utf-8')));
        }
    }

    private static async handleDiscordCommand(message: string, username: string) {
        if (message.startsWith('!discord ') && username === 'thedevdad_') {
            message = message.replace('!discord ', '');
            await writeFile('out/discord.txt', message);
        } else {
            await twitchClient.say('#thedevdad_', 'discord: ' + (await readFile('out/discord.txt', 'utf-8')));
        }
    }
}
