import * as PIXI from "pixi.js";
import { App } from "./app.js";
import { EnemyBasic } from "./enemyBasic.js";
import { EnemyFast } from "./enemyFast.js";
import { EnemyTank } from "./enemyTank.js";
import { getGroundPhysic } from "./utils/getGroundPhysic.js";
import { Player } from "./player.js"; 

export class Scene {
  constructor() {
    this.container = new PIXI.Container();
    this.container.interactive = true;
    this.scene = null;
    this.enemies = [];
    this.showScene();
    this.addEnemy("basic");
    this.addEnemy("fast");
    this.addEnemy("tank");

    App.app.stage.addChild(this.container);
    App.app.ticker.add((delta) => this.update(delta));
  }

  async addEnemy(type = "basic") {
    let enemy;
    switch (type) {
      case "basic":
        enemy = new EnemyBasic(200, 0);
        this.container.addChild(enemy.container);
        this.enemies.push(enemy);
        break;
      case "tank":
        enemy = new EnemyTank(400, 0);
        this.container.addChild(enemy.container);
        this.enemies.push(enemy);
        break;
      case "fast":
        enemy = new EnemyFast(600, 0);
        this.container.addChild(enemy.container);
        this.enemies.push(enemy);
        break;
      default:
        console.error("Type d'ennemi inconnu");
    }
  }

  async showScene() {
    //ajout du background
    const background = await PIXI.Assets.load(
      "src/Assets/Background/PNG/Postapocalypce1/Bright/clouds1.png"
    );
    const nuages = new PIXI.Sprite(background);
    nuages.width = App.app.renderer.width;
    nuages.height = App.app.renderer.height;
    nuages.x = 0;
    nuages.y = 0;
    this.container.addChild(nuages);

    //ajout de la route
    const roadSprite = await PIXI.Assets.load(
      "src/Assets/Background/PNG/Postapocalypce1/Bright/road.png"
    );
    const road = new PIXI.Sprite(roadSprite);
    road.width = App.app.renderer.width;
    road.height = App.app.renderer.height;
    road.y = App.app.renderer.height - road.height;
    console.log(road.texture.source.resource);
    // sprite.texture.baseTexture.resource.source;
    this.pointMap = getGroundPhysic(road);

    this.container.addChild(road);
    this.road = road;

    this.player = new Player();
    App.app.player = this.player;
    App.app.stage.addChild(this.player.container);

  }

  getRoadHeight() {
    if (this.road) {
      console.log(this.road.y + this.road.height);
      return this.road.y + this.road.height;
    }
    return 0;
  }

  update(delta) {
    for (const enemy of this.enemies) {
      enemy.update(delta, this.pointMap, 10);
    }
  }
}
