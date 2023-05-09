import { lights, setLightColor } from './../hue-client'
import { CameraController } from '@app/controllers/CameraController'
import { delay } from '@d-fischer/shared-utils'

const colors: Record<string, string> = {
    red: '#FF0000',
    green: '#00FF00',
    blue: '#0000FF',
    teal: '#008080',
    pink: '#FF00FF',
    white: '#FFFFFF',
    orange: '#FF7F50',
    yellow: '#DFFF00',
}

class JobQueue {
    private queue: (() => Promise<void>)[] = [];
    private isProcessing = false;

    enqueue(job: () => Promise<void>) {
        this.queue.push(job);
        if (!this.isProcessing) {
            this.processQueue().catch(e => console.error(e))
        }
    }

    private async processQueue() {
        this.isProcessing = true;
        while (this.queue.length > 0) {
            const job = this.queue.shift();
            if (job) {
                await job();
                // await wait(10000);
            }
        }
        this.isProcessing = false;
    }
}

function waitSec(sec: number) {
    return new Promise(resolve => setTimeout(resolve, sec * 1000));
}

const queue = new JobQueue()

export class ChannelPointsController {

    public static async handle(redeem: string, message: string) {

        if (redeem === 'Dogcam') {
            await CameraController.handleDogCam('!dogcam')

        } else if (redeem === 'Fishcam') {
            await CameraController.handleFishCam('!fishcam')

        } else if (redeem === 'Lights - Color') {
            const hex = colorToHex(message)
            queueItUp('Color', hex)
        } else if (redeem === 'Lights - Hex') {
            if (message.startsWith('#') && message.length === 7) {
                queueItUp('Hex', message)
            } else {
                console.error(`Bad hex: ${message}`)
            }
        } else if (redeem === 'Lights - Police') {
            lightsPolice()
        } else if (redeem === 'Lights - RGB') {
            lightsRGB()
        } else if (redeem.startsWith('Lights - ')) {
            const color = redeem.split(' - ')[1] ?? '?'
            const hex = colorToHex(color)
            queueItUp(color, hex)
        }
    }
}

const minimumLightDurationSecs = 10
let currentColor = colors.teal

function queueItUp(name: string, hex: string | null) {
    if (hex) {
        queue.enqueue(async () => {
            console.log(`Job started - ${name}`)
            currentColor = hex
            await setLightColor(lights.hueGo, hex)
            await waitSec(minimumLightDurationSecs);
        })
    }
}

function lightsPolice() {
    const delay = 500
    const animation: (string | undefined)[] = [
        colors.red, colors.blue,
        colors.red, colors.blue,
        colors.red, colors.blue,
        colors.red, colors.blue,
        colors.red, colors.blue,
        currentColor  // go back to the previous color set
    ]
    queue.enqueue(async () => {
        console.log('Job started - Police')
        await runLightAnimation(animation, delay)
    });
}

function lightsRGB() {
    const delay = 500
    const animation: (string | undefined)[] = [
        colors.red, colors.green, colors.blue,
        colors.red, colors.green, colors.blue,
        colors.red, colors.green, colors.blue,
        currentColor  // go back to the previous color set
    ]
    queue.enqueue(async () => {
        console.log('Job started - RGB')
        await runLightAnimation(animation, delay)
    })
}

async function runLightAnimation(animation: (string | undefined)[], delayMs: number | null = null) {
    const sequence = animation.filter((x): x is string => x !== null)
    console.log(sequence)
    for (const color of sequence) {
        setLightColor(lights.hueGo, color).catch(e => console.error(e))
        if (delayMs) {
            await delay(delayMs)
        }
    }
}

function colorToHex(color: string): string | null {
    return colors[color.toLowerCase()] || null
}