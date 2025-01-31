import * as PIXI from "pixi.js";

/**
 * @fileoverview Système de gestion du score et du temps pour le jeu.
 * Ce module gère le score du joueur en fonction du temps écoulé et du nombre d'ennemis éliminés.
 * Il met également à jour l'affichage du score et du temps à l'écran.
 * @author Ricardo Marques Pinto
 * @date 31.01.2025
 */

export class ScoreSystem {
  constructor() {
    this.container = new PIXI.Container();
    this.container.interactive = true;
    this.startTime = Date.now();
    this.enemiesKilled = 0;
    this.score = 0;

    this.scoreText = new PIXI.Text({
      text: "Score: 0",
      style: {
        fontFamily: "Arial",
        fontSize: 24,
        fill: 0xffffff,
        align: "center",
      },
    });
    this.timerText = new PIXI.Text({
      text: "Time: 0",
      style: {
        fontFamily: "Arial",
        fontSize: 24,
        fill: 0xffffff,
        align: "center",
      },
    });

    this.scoreText.position.set(10, 10);
    this.timerText.position.set(10, 40);

    this.container.addChild(this.scoreText, this.timerText);
  }

  update() {
    const currentTime = Date.now();
    const elapsedTime = Math.floor((currentTime - this.startTime) / 1000);
    this.timerText.text = `Time: ${elapsedTime}`;

    this.score = this.calculateScore(elapsedTime, this.enemiesKilled);
    this.scoreText.text = `Score: ${this.score}`;
  }

  calculateScore(time, kills) {
    return kills * 100 + time * 10;
  }

  enemyKilled() {
    this.enemiesKilled += 1;
  }
}
