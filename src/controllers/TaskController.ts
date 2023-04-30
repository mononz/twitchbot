import { twitchSay } from '@app/twitch-client';
import { readFile, writeFile, readdir } from 'fs/promises';
import { env } from '@app/env';
import * as path from 'path';
import { SpecsController } from '@app/controllers/SpecsController';
import { RiddleController } from '@app/controllers/RiddleController';
import { CameraController } from '@app/controllers/FishController';

export class TaskController {

    public static async handle(message: string, username: string) {
        //if message starts with !task
        const isModerator = username === env.TWITCH_USERNAME

        const commands: string [] = []
        const commandList: string [] = []

        const files = await readdir('out')
        files
            .filter(file => {
                return path.extname(file) == '.txt'
            })
            .forEach( file => {
                const name = file.replace('.txt', '')
                commands.push(name)
                commandList.push(`!${name}`)
            })

        const msg = message.toLowerCase()
        const msgSplits = message.split(' ')

        const pingCommand = '!ping'
        const specsCommand = '!specs'
        const riddleCommand = '!riddle'
        const dogcamCommand = '!fishcam'
        const fishcamCommand = '!dogcam'

        commandList.push(dogcamCommand)
        commandList.push(fishcamCommand)
        commandList.push(pingCommand)
        commandList.push(specsCommand)
        commandList.push(riddleCommand)

        if (msg === '!commands') {
            twitchSay(`Command List -> ${commandList.join(', ')}`);

        } else if (msg === pingCommand) {
            twitchSay('pong for you');

        } else if (msg === dogcamCommand) {
            await CameraController.handleDogCam(msg)

        } else if (msg === fishcamCommand) {
            await CameraController.handleFishCam(msg)

        } else if (msg === riddleCommand) {
            await RiddleController.handle(msg, username)

        } else if (msg === specsCommand) {
            const specs = await SpecsController.generateSpecsResponse()
            twitchSay(specs);

        } else if (isModerator && msgSplits.length >= 3 && msgSplits[0] === '!add' && msgSplits[1]?.startsWith('!')) {
            // i.e. !add !hacker some text
            try {
                const fileName = msgSplits[1].replace('!', '')
                const fileContents = msgSplits.splice(2, msgSplits.length).join(' ')
                await writeFile(`out/${fileName}.txt`, fileContents);
                twitchSay(`Created the command !${fileName}`);
            } catch (e) {
                console.error(`Command ${msg} not found`)
            }

        } else if (msg.startsWith('!') && !msg.includes(' ') && commands.includes(msg.replace('!', ''))) {
            // i.e. !project
            // pull any .txt file from the out directory matching the name
            const fileName = msg.replace('!', '')
            try {
                const fileContents = await readFile(`out/${fileName}.txt`, 'utf-8')
                twitchSay(fileContents);
            } catch (e) {
                console.error(`Unexpected error opening ${fileName}`)
            }

        } else if (msg.startsWith('!')) {
            twitchSay('I don\'t know this command');
        }
    }
}
