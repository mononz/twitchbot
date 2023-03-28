import { exec } from 'child_process';

export class SceneController {
    public static changeToPrimaryScene() {
        SceneController.runCommand('touch ./scenes/primary');
    }

    public static changeToDogCamScene() {
        SceneController.runCommand('touch ./scenes/dog');
    }

    public static changeToFishCamScene() {
        SceneController.runCommand('touch ./scenes/fish');
    }

    public static changeToWinnerScene() {
        SceneController.runCommand('touch ./scenes/winner');
    }

    private static runCommand(command: string) {
        exec(command);
    }
}
