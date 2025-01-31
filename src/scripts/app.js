import { Application } from 'pixi.js';
import { Scene } from './scene';

/**
 * @fileoverview Classe principale du jeu.
 * Cette classe gère l'initialisation de l'application Pixi.js,
 * l'ajout des scènes et la gestion de l'interactivité.
 * @author Ricardo Marques Pinto & Arthur Jaquier
 * @date 31.01.2025
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
