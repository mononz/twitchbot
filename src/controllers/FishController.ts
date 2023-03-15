import { clamp } from '@app/common/clamp';
import { setTimeout } from 'timers/promises';
import { SceneController } from '@app/controllers/SceneController';

export class FishController {
    /**
     * Handles the fish cam command
     * @param message the message to handle
     */
    public static async handle(message: string) {
        if (message.toLocaleLowerCase() === '!fishcam') {
            await FishController.runFishCam(10_000);
            return;
        }

        if (message.split(' ').length === 2) {
            if (message.split(' ')[0] === '!fishcam') {
                const requestedDuration = Number(message.split(' ')[1] ?? '0') * 1_000;
                const duration = clamp(requestedDuration, 1000, 30_000);

                await FishController.runFishCam(duration);
            }
        }
    }

    /**
     * Runs the fish cam for the specified duration
     * @param duration in milliseconds
     */
    public static async runFishCam(duration: number) {
        SceneController.changeToFishCamScene();
        await setTimeout(duration);
        SceneController.changeToPrimaryScene();
    }
}
