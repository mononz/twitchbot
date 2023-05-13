import type { HueColor} from './../hue-client';
import { setGroupColor, hueGroups,
    hueDefault,
    hueColor,
    getColorByName,
    hueAnimations,
    setLightColor, hueLights,
} from './../hue-client';
import { CameraController } from '@app/controllers/CameraController'
import { delay } from '@d-fischer/shared-utils'

const minimumLightDurationSecs = 2
let currentColor = hueDefault

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

    public async handleRedeem(redeem: string) {
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
            this.handleLights(color)
        }
    }

    private handleLights(name: string) {
        switch (name) {
            case 'Police':
                this.queueAnimation(hueAnimations.police, 800)
                break
            case 'RGB':
                this.queueAnimation(hueAnimations.rgb, 800)
                break
            case 'Flash':
                this.queueAnimation(hueAnimations.flash, 800)
                break
            default:
                const color = getColorByName(name)
                if (color) {
                    this.queueColor('Color', color)
                } else {
                    console.error(`I don't know the color -> ${name}`)
                }
                break
        }
    }

    queueColor(name: string, color: HueColor | null) {
        if (color) {
            queue.enqueue(async () => {
                console.log(`Job started - ${name}`)
                currentColor = color
                await setGroupColor(hueGroups.background, color, true).catch(e => console.error(e))
                await waitSec(minimumLightDurationSecs);
            })
        }
    }

    queueAnimation(animation: (HueColor)[], delay: number) {
        queue.enqueue(async () => {
            console.log('Job started - Police')
            await this.runLightAnimation(animation, delay)
        });
    }

    async runLightAnimation(animation: (HueColor)[], delayMs: number | null = null) {
        console.log(animation)

        setLightColor(hueLights.huePlayLeft, currentColor, false).catch(e => console.error(e))

        for (const color of animation) {
            if (color === hueColor.off) {
                setLightColor(hueLights.huePlayRight, color, false).catch(e => console.error(e))
            } else {
                setLightColor(hueLights.huePlayRight, color, true).catch(e => console.error(e))
            }
            if (delayMs) {
                await delay(delayMs)
            }
        }
        await setGroupColor(hueGroups.background, currentColor, true).catch(e => console.error(e))
    }
}