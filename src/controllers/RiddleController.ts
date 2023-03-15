import { readFile, writeFile } from 'fs/promises';
import { SceneController } from '@app/controllers/SceneController';
import { setTimeout } from 'timers/promises';
import { twitchClient } from '@app/twitch-client';

export class RiddleController {
    public static handle(message: string, username: string) {
        const riddle = 'There is a 3-digit number. The second digit is four times as big as the third digit, while the first digit is three less than the second digit. What is the number?';
        const answer = '141';

        // Start a new riddle
        if (RiddleController.isRiddleRequest(message)) return RiddleController.handleRiddleRequest(riddle);

        // User attempting to answer the riddle
        return RiddleController.handleRiddleAnswerAttempt(username, message, answer);
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

    public static async handleRiddleAnswerAttempt(username: string, message: string, answer: string) {
        if (answer.toLowerCase() === message.toLowerCase()) {
            await RiddleController.handleCorrectAnswer(username);
        }
    }

    public static async handleCorrectAnswer(username: string) {
        await twitchClient.say('#thedevdad_', `${username}, you got the riddle correct!`);

        RiddleController.changeSceneToWinner();

        const someoneHasWon = await this.someoneHasWon();
        if (someoneHasWon) {
            await this.writeUserToWinnerFile(username);
        }
    }

    public static changeSceneToWinner() {
        SceneController.changeToWinnerScene();
        void setTimeout(10_000).then(() => {
            SceneController.changeToPrimaryScene();
        });
    }

    public static async someoneHasWon() {
        const text = await readFile('out/winner.txt', 'utf-8');
        return text !== 'unsolved!';
    }

    public static async writeUserToWinnerFile(username: string) {
        await writeFile('out/winner.txt', username);
    }
}
