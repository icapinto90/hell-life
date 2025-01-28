import { Application } from 'pixi.js';
import { Scene } from './scene';

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
  }

  static async getScene() {
    await App.initPromise; 
    return App.scene;
  }
}

export const App = new GameApplication();
