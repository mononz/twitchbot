import { lights, setLightColor } from './../hue-client'
import { CameraController } from '@app/controllers/CameraController'
import { delay } from '@d-fischer/shared-utils'

const colors: Record<string, string> = {
    // primary
    red: '#FF0000',
    yellow: '#FFFF00',
    blue: '#0033CC',
    // secondary
    orange: '#FF9900',
    green: '#00CC00',
    purple: '#660099',
    // other
    teal: '#008080',
    cyan: '#00FFFF',
    pink: '#FF00FF',
    white: '#FFFFFF',
}

const minimumLightDurationSecs = 10
let currentColor = colors.teal

function colorToHex(color: string): string | null {
    return colors[color.toLowerCase()] || null
}

function waitSec(sec: number) {
    return new Promise(resolve => setTimeout(resolve, sec * 1000));
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

const queue = new JobQueue()

export class ChannelPointsController {

    public async handleRedeem(redeem: string, message: string) {
        if (redeem === 'Dogcam') {
            await CameraController.handleDogCam('!dogcam')
            return
        }
        if (redeem === 'Fishcam') {
            await CameraController.handleFishCam('!fishcam')
            return
        }
        if (redeem.startsWith('Lights - ')) {
            const color = redeem.split(' - ')[1] ?? '?'
            this.handleLights(color, message)
        }
    }

    private handleLights(color: string, message: string) {
        switch (color) {
            case 'Color':
                const hex = colorToHex(message)
                this.queueItUp('Color', hex)
                break
            case 'Hex':
                const regex = new RegExp(/^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/)
                if (regex.test(message)) {
                    this.queueItUp('Hex', message)
                } else {
                    console.error(`Bad hex: ${message}`)
                }
                break
            case 'Police':
                this.lightsPolice()
                break
            case 'RGB':
                this.lightsRGB()
                break
            case 'Flash':
                this.lightsFlash()
                break
            default:
                const hexFallback = colorToHex(color)
                if (hexFallback) {
                    this.queueItUp('Color', hexFallback)
                } else {
                    console.error(`What is this command? '${color}-${message}`)
                }
                break
        }
    }

    queueItUp(name: string, hex: string | null) {
        if (hex) {
            queue.enqueue(async () => {
                console.log(`Job started - ${name}`)
                currentColor = hex
                await setLightColor(lights.hueGo, hex)
                await waitSec(minimumLightDurationSecs);
            })
        }
    }

    public lightsPolice() {
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
            await this.runLightAnimation(animation, delay)
        });
    }

    lightsRGB() {
        const delay = 500
        const animation: (string | undefined)[] = [
            colors.red, colors.green, colors.blue,
            colors.red, colors.green, colors.blue,
            colors.red, colors.green, colors.blue,
            currentColor  // go back to the previous color set
        ]
        queue.enqueue(async () => {
            console.log('Job started - RGB')
            await this.runLightAnimation(animation, delay)
        })
    }

    lightsFlash() {
        const delay = 500
        const black = '#000000' // black turns off light
        const animation: (string | undefined)[] = [
            black, colors.white,
            black, colors.white,
            black, colors.white,
            black, colors.white,
            currentColor  // go back to the previous color set
        ]
        queue.enqueue(async () => {
            console.log('Job started - RGB')
            await this.runLightAnimation(animation, delay)
        })
    }

    async runLightAnimation(animation: (string | undefined)[], delayMs: number | null = null) {
        const sequence = animation.filter((x): x is string => x !== null)
        console.log(sequence)
        for (const color of sequence) {
            setLightColor(lights.hueGo, color).catch(e => console.error(e))
            if (delayMs) {
                await delay(delayMs)
            }
        }
    }
}