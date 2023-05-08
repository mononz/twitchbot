import { lights, setLightColor } from './../hue-client'
import { CameraController } from '@app/controllers/CameraController';

export class ChannelPointsController {

    public static async handle(rewardTitle: string, message: string) {
        const title = rewardTitle.toLowerCase()

        if (title === 'dogcam') {
            await CameraController.handleDogCam('!dogcam')

        } else if (title === 'fishcam') {
            await CameraController.handleFishCam('!fishcam')

        } else if (title === 'lights - color') {
            const hex = colorToHex(message)
            if (hex) {
                await Promise.all([
                    setLightColor(lights.hueGo, hex),
                    // setLightColor(lights.huePlayLeft, hex),
                    // setLightColor(lights.huePlayRight, hex)
                ])
            }
        } else if (title === 'lights - hex') {
            let hex: string | null = null
            if (message.startsWith('#') && message.length === 7) {
                hex = message
            } else {
                console.error(`Bad hex: ${message}`)
            }
            if (hex) {
                await Promise.all([
                    setLightColor(lights.hueGo, hex),
                    // setLightColor(lights.huePlayLeft, hex),
                    // setLightColor(lights.huePlayRight, hex)
                ])
            }
        } else if (title.startsWith('lights - ')) {
            const color = title.split(' - ')[1] ?? '?'
            const hex = colorToHex(color)
            if (hex) {
                await Promise.all([
                    setLightColor(lights.hueGo, hex),
                    // setLightColor(lights.huePlayLeft, hex),
                    // setLightColor(lights.huePlayRight, hex)
                ])
            }
        }
    }
}

function colorToHex(color: string): string | null {
    switch (color.toLowerCase()) {
        case 'red':
            return '#FF0000'
        case 'green':
            return '#00FF00'
        case 'blue':
            return '#0000FF'
        case 'teal':
            return '#008080'
        case 'pink':
            return '#FF00FF'
        case 'white':
            return '#FFFFFF'
        case 'orange':
            return '#FF7F50'
        case 'yellow':
            return '#DFFF00'
        default:
            return null
    }
}
