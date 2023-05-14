import type { HueColor} from './../hue-client';
import { setGroupColor, hueGroups, hueDefault, hueColor, getColorByName, hueAnimations, setLightColor, hueLights } from './../hue-client';
import { CameraController } from '@app/controllers/CameraController'
import { delay } from '@d-fischer/shared-utils'
import { EventSubChannelRedemptionAddEvent } from '@twurple/eventsub-base';

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

    public async handleRedeem(redeem: string): Promise<boolean> {
        if (redeem === 'Dogcam') {
            await CameraController.handleDogCam('!dogcam')
            return true
        } else if (redeem === 'Fishcam') {
            await CameraController.handleFishCam('!fishcam')
            return true
        } else if (redeem.startsWith('Lights - ')) {
            const color = redeem.split(' - ')[1] ?? '?'
            return this.handleLights(color)
        } else {
            return false
        }
    }

    private handleLights(name: string): boolean {
        switch (name) {
            case 'Police':
                return this.queueAnimation(hueAnimations.police, 800)
            case 'RGB':
                return this.queueAnimation(hueAnimations.rgb, 800)
            case 'Flash':
                return this.queueAnimation(hueAnimations.flash, 800)
            default:
                const color = getColorByName(name)
                if (color) {
                    return this.queueColor('Color', color)
                } else {
                    console.error(`I don't know the color -> ${name}`)
                    return false
                }
        }
    }

    queueColor(name: string, color: HueColor | null): boolean {
        if (color) {
            queue.enqueue(async () => {
                console.log(`Job started - ${name}`)
                currentColor = color
                await setGroupColor(hueGroups.background, color, true).catch(e => console.error(e))
                await waitSec(minimumLightDurationSecs);
            })
            return true
        } else {
            return false
        }
    }

    queueAnimation(animation: (HueColor)[], delay: number): boolean {
        queue.enqueue(async () => {
            console.log('Job started - Police')
            await this.runLightAnimation(animation, delay)
        });
        return true
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