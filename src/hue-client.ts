import { env } from '@app/env';
import { v3 } from 'node-hue-api';
import type Api from 'node-hue-api/lib/api/Api';

export const hueLights = {
    hueGo: 1,
    huePlayLeft: 5,
    huePlayRight: 4
}

export const hueGroups = {
    desk: 1, // bedroom
    background: 2 // office,
}

export class HueColor {
    hex: string;
    hue: number;
    sat: number;

    constructor(hex: string, hue: number, sat: number) {
        this.hex = hex;
        this.hue = hue;
        this.sat = sat;
    }
}

export const hueColor = {
    blue: new HueColor('#0000FF', 45366, 254),
    purple: new HueColor('#7300ff', 49838, 254),
    red: new HueColor('#FF0000', 540, 254),
    teal: new HueColor('#47f5ff', 41629, 254),
    pink: new HueColor('#db00ff', 57456, 254),
    orange: new HueColor('#ff6200', 2988, 254),
    green: new HueColor('#22ff00', 26490, 254),
    white: new HueColor('#FFFFFF', 41408,82),
    off: new HueColor('#FFFFFF', 41408,82)
}


export const hueAnimations = {
    police: [
        hueColor.red, hueColor.blue,
        hueColor.red, hueColor.blue,
        hueColor.red, hueColor.blue,
        hueColor.red, hueColor.blue,
        hueColor.red, hueColor.blue
    ],
    rgb: [
        hueColor.red, hueColor.green, hueColor.blue,
        hueColor.red, hueColor.green, hueColor.blue,
        hueColor.red, hueColor.green, hueColor.blue
    ],
    flash: [
        hueColor.off, hueColor.white,
        hueColor.off, hueColor.white,
        hueColor.off, hueColor.white,
        hueColor.off, hueColor.white,
        hueColor.off
    ]
}

export function getColorByName(name: string): HueColor | null {
    switch (name.toLowerCase()) {
        case 'blue': return hueColor.blue
        case 'purple': return hueColor.purple
        case 'red': return hueColor.red
        case 'teal': return hueColor.teal
        case 'pink': return hueColor.pink
        case 'orange': return hueColor.orange
        case 'green': return hueColor.green
        default: return null
    }
}

export const hueDefault = hueColor.teal

function getHueApi(): Promise<Api> {
    return v3.api
        .createLocal(env.HUE_BRIDGE_IP)
        .connect(env.HUE_USERNAME)
}

export async function setLightColor(lightId: number, color: HueColor, on: boolean): Promise<void> {
    const lightState = new v3.lightStates.LightState()
        .on(on)
        .hue(color.hue)
        .sat(color.sat)
        .transitionFast()
        .brightness(color === hueColor.off ? 0 : 100)

    const api = await getHueApi();
    await api.lights.setLightState(lightId, lightState)

    console.log(`Light ${lightId} color set successfully.`);
}

export async function setGroupColor(groupId: number, color: HueColor, on: boolean): Promise<void> {

    const lightState = new v3.lightStates.GroupLightState()
        .on(on)
        .hue(color.hue)
        .sat(color.sat)
        .brightness(100)
        .transitionFast()

    const api = await getHueApi();
    await api.groups.setGroupState(groupId, lightState)

    console.log(`Group ${groupId} color set successfully.`);
}

export async function setAnimation(groupId: number, color: HueColor, on: boolean): Promise<void> {

    const lightState = new v3.lightStates.SceneLightState()
        .on(true)
        .hue(color.hue)
        .sat(color.sat)
        .effectColorLoop()
        .brightness(on ? 100 : 0)
        .transitionFast()

    const api = await getHueApi();
    await api.groups.setGroupState(groupId, lightState)

    console.log(`Group ${groupId} color set successfully.`);
}

export async function getLightInfo(): Promise<void> {

    const api = await getHueApi();

    // const hueGo= await api.lights.getLightState(hueLights.hueGo)
    // console.log('Light hueGo', hueGo)

    const huePlayLeft= await api.lights.getLightState(hueLights.huePlayLeft)
    console.log('Light huePlayLeft', huePlayLeft)

    const huePlayRight= await api.lights.getLightState(hueLights.huePlayRight)
    console.log('Light huePlayRight', huePlayRight)

    // const groups = await api.groups.getGroup(hueGroups.background)
    // console.log('Light groups =>', groups);
}
