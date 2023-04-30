import os from 'os';
import { outdent } from 'outdent';
import systeminformation from 'systeminformation';

export class SpecsController {
    private static cache: string | null = null;

    public static async generateSpecsResponse() {
        if (!SpecsController.cache) SpecsController.cache = outdent`
            CPU: ${SpecsController.getCpu()}, 
            GPU: ${await SpecsController.getGpu()}, 
            RAM: ${SpecsController.getRam()}, 
            Storage: ${await SpecsController.getStorage()}
        `;

        return SpecsController.cache;
    }

    public static getCpu() {
        return os.cpus()[0]?.model ?? 'Unknown CPU';
    }

    public static async getGpu() {
        const graphics = await systeminformation.graphics();
        return graphics.controllers.map(controller => controller.model).join(', ') ?? 'Unknown GPU';
    }

    public static getRam() {
        return `${Math.floor(os.totalmem() / 1024 / 1024 / 1024)}GB`;
    }

    public static async getStorage() {
        const layout = await systeminformation.diskLayout();
        const totalSize = layout.map(disk => disk.size).reduce((totalSize, diskSize) => totalSize + diskSize, 0);
        return `${Math.floor(totalSize / 1024 / 1024 / 1024)}GB`;
    }
}
