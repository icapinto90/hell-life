import * as PIXI from 'pixi.js';


export class Player {
    constructor(){
        this.container = new PIXI.Container();
        this.container.interactive = true;
        this.chargePlayer();

    }

    async chargePlayer() {
        const characterAsset = await PIXI.Assets.load('src/Assets/Character/Hero/PNG/PNG Sequences/Running/0_Fallen_Angels_Running_000.png');
        const character = new PIXI.Sprite(characterAsset);
        character.width = 150;
        character.height = 150;
        character.x = 20;
        character.y = 370;

        this.container.addChild(character);
        }
}