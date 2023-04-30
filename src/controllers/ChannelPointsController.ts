import { CameraController } from '@app/controllers/CameraController';

export class ChannelPointsController {

    public static async handle(rewardTitle: string) {
        const reward = rewardTitle.toLowerCase()

        if (reward === 'dogcam') {
            await CameraController.handleDogCam('!dogcam')

        } else if (reward === 'fishcam') {
            await CameraController.handleFishCam('!fishcam')

        } else if (reward.startsWith('lights -')) {
            const color = reward.split(' - ')[1] ?? 'blue'
            console.log(`ToDo - Light change ${color}`)

        }
    }
}
