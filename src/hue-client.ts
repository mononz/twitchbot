import { env } from '@app/env';
import { v3 } from 'node-hue-api';
import Api from 'node-hue-api/lib/api/Api';

export const lights = {
    hueGo: 1,
    huePlayLeft: 5,
    huePlayRight: 4
}

function getHueApi(): Promise<Api> {
    return v3.api
        .createLocal(env.HUE_BRIDGE_IP)
        .connect(env.HUE_USERNAME)
}

export async function setLightColor(lightId: number, hex: string): Promise<void> {
    const rgb = hexToRgb(hex)
    const lightState = new v3.lightStates.LightState()
        .on(true)
        .rgb(rgb.r, rgb.g, rgb.b)
        .transitionFast()
        .brightness(100)

    const api = await getHueApi();
    await api.lights.setLightState(lightId, lightState)

    console.log(`Light ${lightId} color set successfully.`);
}

export async function getLightInfo(): Promise<void> {

    const api = await getHueApi();

    const hueGo= await api.lights.getLightState(lights.hueGo)
    console.log(`Light hueGo => ${hueGo.toString()}`);

    const huePlayLeft= await api.lights.getLightState(lights.huePlayLeft)
    console.log(`Light huePlayLeft => ${huePlayLeft.toString()}`);

    const huePlayRight= await api.lights.getLightState(lights.huePlayRight)
    console.log(`Light huePlayRight => ${huePlayRight.toString()}`);
}

function hexToRgb(hex: string): { r: number; g: number; b: number } {
    const sanitizedHex = hex.replace(/^#/, '');
    const bigint = parseInt(sanitizedHex, 16);
    const r = (bigint >> 16) & 255;
    const g = (bigint >> 8) & 255;
    const b = bigint & 255;
    return { r, g, b };
}
