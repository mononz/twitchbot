import { readFile, writeFile } from 'fs/promises';
import { SceneController } from '@app/controllers/SceneController';
import { setTimeout } from 'timers/promises';
import { twitchSay } from '@app/twitch-client';

const riddle = 'You can see me in water, but I never get wet. What am I?';
const answers = ['reflection'];

export class RiddleController {

    public static handleRiddleRequest() {
        twitchSay(`daily riddle: ${riddle} (Type your answer as '!riddle answer')`);
    }

    public static async handleRiddleAnswerAttempt(username: string, message: string) {

        for (const answer of answers) {
            if (answer.toLowerCase() === message.toLowerCase()) {
                const isUnsolved = await this.isUnsolved()
                if (isUnsolved) {
                    await RiddleController.handleCorrectAnswer(username);
                } else {
                    const winner = await this.riddleWinner()
                    twitchSay(`Correct @${username}! However ${winner} bet you to it!`);
                }
                return;
            }
        }
    }

    public static async handleCorrectAnswer(username: string) {
        twitchSay(`${username}, you got the riddle correct!`);

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

    public static async riddleWinner() {
        return await readFile('out/winner.txt', 'utf-8');
    }

    public static async writeUserToWinnerFile(username: string) {
        await writeFile('out/winner.txt', username);
    }
}
