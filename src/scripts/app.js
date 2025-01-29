import { Application } from 'pixi.js';
import { Scene } from './scene';

/**
 * Classe principale du jeu.
 * @author Ricardo & Arthur
 */
class GameApplication {
  constructor() {
    this.app = new Application();
    this.scenes = new Scene();
    this.initApp();
  }
  /** Initialise l'application Pixi.js. */
  async initApp() {
    await this.app.init({ resizeTo: window });
    document.body.appendChild(this.app.canvas);
    this.app.stage.interactive = true;
    this.app.stage.addChild(this.scenes.container);
  }
}

export const App = new GameApplication();
