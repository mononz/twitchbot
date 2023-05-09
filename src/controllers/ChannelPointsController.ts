import { lights, setLightColor } from './../hue-client'
import { CameraController } from '@app/controllers/CameraController'
import { delay } from '@d-fischer/shared-utils'

class JobQueue {
    private queue: (() => Promise<void>)[] = [];
    private isProcessing = false;

    enqueue(job: () => Promise<void>) {
        this.queue.push(job);
        if (!this.isProcessing) {
            this.processQueue();
        }
    }

    private async processQueue() {
        this.isProcessing = true;
        while (this.queue.length > 0) {
            const job = this.queue.shift();
            if (job) {
                await job();
                await this.wait(10000);
            }
        }
        this.isProcessing = false;
    }

    private wait(ms: number) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }
}

const queue = new JobQueue()

// Utility function for delaying execution
function sleep(milliseconds: number): Promise<void> {
    return new Promise<void>((resolve) => {
        setTimeout(resolve, milliseconds)
    });
}

export class ChannelPointsController {

    public static async handle(redeem: string, message: string) {

        if (redeem === 'Dogcam') {
            await CameraController.handleDogCam('!dogcam')

        } else if (redeem === 'Fishcam') {
            await CameraController.handleFishCam('!fishcam')

        } else if (redeem === 'Lights - Color') {
            const hex = colorToHex(message)
            if (hex) {
                queue.enqueue(async () => {
                    console.log(`Job started - ${hex}`);
                    setLightColor(lights.hueGo, hex).catch(e => console.error(e))
                    await sleep(10000) // 10 sec
                    console.log('Job completed - ${hex}');
                });
            }
        } else if (redeem === 'Lights - Hex') {
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
        } else if (redeem === 'Lights - Police') {
            await lightsPolice()
        } else if (redeem === 'Lights - RGB') {
            await lightsRGB()
        } else if (redeem.startsWith('Lights - ')) {
            const color = redeem.split(' - ')[1] ?? '?'
            const hex = colorToHex(color)
            if (hex) {
                queue.enqueue(async () => {
                    console.log(`Job started - ${color}`)
                    await setLightColor(lights.hueGo, hex)
                    // await sleep(10000)  // 10 sec
                    console.log(`Job completed - ${color}`)
                })
            }
        }
    }
}

async function lightsPolice() {
    const delay = 500
    const animation: (string | undefined)[] = [
        colors.red, colors.blue,
        colors.red, colors.blue,
        colors.red, colors.blue,
        colors.red, colors.blue,
        colors.red, colors.blue
    ]
    await runLightAnimation(animation, delay)
    await resetLights()
}

async function lightsRGB() {
    const delay = 500
    const animation: (string | undefined)[] = [
        colors.red, colors.green, colors.blue,
        colors.red, colors.green, colors.blue,
        colors.red, colors.green, colors.blue,
    ]
    await runLightAnimation(animation, delay)
    await resetLights()
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

async function resetLights() {
    const color = '#008080'
    await setLightColor(lights.hueGo, color)
}

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

function colorToHex(color: string): string | null {
    return colors[color.toLowerCase()] || null
}