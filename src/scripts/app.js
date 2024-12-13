import { Application } from 'pixi.js';
import { Scene } from './scene';
import { Player } from './player';

class GameApplication {
  constructor() {
    this.app = new Application();
    this.initApp();
  }

  async initApp() {
    await this.app.init({ resizeTo: window });
    document.body.appendChild(this.app.canvas);
    this.scenes = new Scene();
    this.app.stage.interactive = true;
    this.app.stage.addChild(this.scenes.container);
    this.player = new Player();
    this.app.player = this.player;
    this.app.stage.addChild(this.player.container);
  }

  static async getScene() {
    await App.initPromise; // Attendre que l'application soit complètement initialisée
    return App.scene; // Retourne la scène initialisée
  }
}

export const App = new GameApplication();
