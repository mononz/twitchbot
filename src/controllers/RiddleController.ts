import { readFile, writeFile } from 'fs/promises';
import { SceneController } from '@app/controllers/SceneController';
import { setTimeout } from 'timers/promises';
import { twitchClient } from '@app/twitch-client';

export class RiddleController {
    public static handle(message: string, username: string) {
        const riddle = 'What do you call a web designer who gets happy when they find a bug?';
        const answers = ['a spider', 'spider'];

        // Start a new riddle
        if (RiddleController.isRiddleRequest(message)) return RiddleController.handleRiddleRequest(riddle);

        // User attempting to answer the riddle
        return RiddleController.handleRiddleAnswerAttempt(username, message, answers);
    }

    public static isRiddleRequest(message: string) {
        return message.toLowerCase() === '!riddle';
    }

    public static isRiddleAnswerAttempt(message: string) {
        return message.toLowerCase().startsWith('!riddle ');
    }

    public static async handleRiddleRequest(riddle: string) {
        await twitchClient.say('#thedevdad_', `daily riddle: ${riddle}`);
    }

    public static async handleRiddleAnswerAttempt(username: string, message: string, answers: string[]) {
        for (const answer of answers) {
            if (answer.toLowerCase() === message.toLowerCase()) {
                await RiddleController.handleCorrectAnswer(username);
                return;
            }
        }
    }

    public static async handleCorrectAnswer(username: string) {
        await twitchClient.say('#thedevdad_', `${username}, you got the riddle correct!`);

        RiddleController.changeSceneToWinner();

        const isUnsolved = await this.isUnsolved();
        if (isUnsolved) {
            await this.writeUserToWinnerFile(username);
        }
    }

    public static changeSceneToWinner() {
        SceneController.changeToWinnerScene();
        void setTimeout(10_000).then(() => {
            SceneController.changeToPrimaryScene();
        });
    }

    public static async isUnsolved() {
        const text = await readFile('out/winner.txt', 'utf-8');
        return text.includes('unsolved!');
    }

    public static async writeUserToWinnerFile(username: string) {
        await writeFile('out/winner.txt', username);
    }
}
