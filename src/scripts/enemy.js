import * as PIXI from 'pixi.js';
import { App } from './app';

export class Enemy {
  constructor(x = 0, y = 0, speed = 1, health = 100) {
    this.container = new PIXI.Container();
    this.container.interactive = true;
    this.x = x;
    this.y = y;
    this.speed = speed;
    this.health = health;
  }

  chargeEnemy(texture) {
    this.enemy = new PIXI.AnimatedSprite(texture);
    this.enemy.anchor.set(0.5);
    this.enemy.animationSpeed = 0.1; // Vitesse de l'animation
    this.enemy.play(); // Lance l'animation en boucle
    this.enemy.width = 150;
    this.enemy.height = 150;
    this.container.addChild(this.enemy);
    App.app.stage.addChild(this.container);
  }

  update(delta) {
    this.x -= this.speed * delta;
  }

  takeDamage(amount) {
    this.health -= amount;
    if (this.health <= 0) {
      this.destroy();
    }
  }
}
