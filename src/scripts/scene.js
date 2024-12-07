import * as PIXI from 'pixi.js';
import { App } from './app.js';
import { EnemyBasic } from './enemyBasic.js';

export class Scene {
  constructor() {
    this.container = new PIXI.Container();
    this.container.interactive = true;
    this.scene = null;
    this.showScene();
    this.loadEnnemy();
    App.app.stage.addChild(this.container);
  }

  async loadEnnemy() {
    const ennemy = new EnemyBasic(
      (App.app.renderer.width / 2, App.app.renderer.height / 2)
    );
    this.container.addChild(ennemy.container);
  }

  async showScene() {
    //ajout du background
    const background = await PIXI.Assets.load(
      'src/Assets/Background/PNG/Postapocalypce1/Bright/clouds1.png'
    );
    const nuages = new PIXI.Sprite(background);
    nuages.width = App.app.renderer.width;
    nuages.height = App.app.renderer.height;
    nuages.x = 0;
    nuages.y = 0;
    this.container.addChild(nuages);

    //ajout de la route
    const roadSprite = await PIXI.Assets.load(
      'src/Assets/Background/PNG/Postapocalypce1/Bright/road.png'
    );
    const road = new PIXI.Sprite(roadSprite);
    road.width = App.app.renderer.width;
    road.height = App.app.renderer.height;
    road.y = App.app.renderer.height - road.height;

    this.container.addChild(road);
    this.road = road;
  }

  getRoadHeight() {
    if (this.road) {
      return this.road.getLocalBounds().height;
    }
    return 0;
  }
}
