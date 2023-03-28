import { clamp } from '@app/common/clamp';
import { setTimeout } from 'timers/promises';
import { SceneController } from '@app/controllers/SceneController';

export class CameraController {
    /**
     * Handles the fish cam command
     * @param message the message to handle
     */
    public static async handle(message: string) {
        if (message.toLocaleLowerCase().includes('!dogcam')) {
            await CameraController.handleDogCam(message);
        } else if (message.toLocaleLowerCase().includes('!fishcam')) {
            await CameraController.handleFishCam(message);
        }
    }

    private static async handleDogCam(message: string) {
        if (message.toLocaleLowerCase() === '!dogcam') {
            await CameraController.runDogCam(10_000);
            return;
        }

        if (message.split(' ').length === 2) {
            if (message.split(' ')[0] === '!dogcam') {
                const requestedDuration = Number(message.split(' ')[1] ?? '0') * 1_000;
                const duration = clamp(requestedDuration, 1000, 30_000);

                await CameraController.runDogCam(duration);
            }
        }
    }

    private static async handleFishCam(message: string) {
        if (message.toLocaleLowerCase() === '!fishcam') {
            await CameraController.runFishCam(10_000);
            return;
        }

        if (message.split(' ').length === 2) {
            if (message.split(' ')[0] === '!fishcam') {
                const requestedDuration = Number(message.split(' ')[1] ?? '0') * 1_000;
                const duration = clamp(requestedDuration, 1000, 30_000);

                await CameraController.runFishCam(duration);
            }
        }
    }

    public static async runDogCam(duration: number) {
        SceneController.changeToDogCamScene();
        await setTimeout(duration);
        SceneController.changeToPrimaryScene();
    }

    public static async runFishCam(duration: number) {
        SceneController.changeToFishCamScene();
        await setTimeout(duration);
        SceneController.changeToPrimaryScene();
    }
}
