import * as PIXI from 'pixi.js';
import { App } from './app.js';
import { EnemyBasic } from './enemyBasic.js';
import { EnemyFast } from './enemyFast.js';
import { EnemyTank } from './enemyTank.js';
import { getGroundPhysic } from './utils/getGroundPhysic.js';
import { Player } from './player.js';
import { ScoreSystem } from './score.js';

/**
 * @fileoverview Ce fichier définit la classe Scene pour gérer la scène du jeu.
 * Il inclut la gestion du joueur, des ennemis, des vagues d'ennemis et du score.
 * @authors 
 * - Ricardo Marques Pinto : Gestion des ennemis, du système de vagues & du score
 * - Arthur Jaquier : Intégration du joueur et affichage de la scène
 * @date 31.01.2025
 */

export class Scene {
  constructor() {
    (async () => {
      this.container = new PIXI.Container();
      this.player = null;
      this.score = new ScoreSystem();
      this.container.interactive = true;
      this.scene = null;
      this.enemies = [];
      this.wave = 1;
      this.enemiesSpawned = 0;
      this.maxEnemiesInWave = 5;
      this.waveText = null;
      this.generatingWave = false; // Indicateur si une vague est en cours de génération
      await this.showScene();
      this.initPlayer();
      this.initScore();
      this.initWaveText(); // Initialisation du texte de vague
      this.startWave();
      App.app.stage.addChild(this.container);
      App.app.ticker.add((delta) => this.update(delta));
    })();
  }

  initPlayer() {
    this.player = new Player();
    this.container.addChild(this.player.container);
  }

  initScore() {
    this.score = new ScoreSystem();
    this.container.addChild(this.score.container);
  }

  initWaveText() {
    this.waveText = new PIXI.Text({
      text: '',
      style: {
        fontFamily: 'Arial',
        fontSize: 48,
        fill: 0xffffff,
        align: 'center',
      },
    });
    this.waveText.anchor = new PIXI.Point(0.5, 0.5);
    this.waveText.x = App.app.renderer.width / 2;
    this.waveText.y = App.app.renderer.height / 2;
    this.waveText.visible = false;
    this.container.addChild(this.waveText);
  }

  startWave() {
    this.enemiesSpawned = 0;
    this.totalEnemiesInWave = this.maxEnemiesInWave + (this.wave - 1) * 3;
    this.spawnNextEnemy(); // Commence à faire apparaître les ennemis
  }

  displayWaveText(waveNumber) {
    this.waveText.text = `Vague ${waveNumber}`;
    this.waveText.visible = true;
    this.generatingWave = true; // Indique que la vague est en cours de génération
    // Masquer le texte après 2 secondes
    setTimeout(() => {
      this.waveText.visible = false;
      this.startWave();
      this.generatingWave = false; // Indique que la vague est terminée
    }, 2000);
  }

  spawnNextEnemy() {
    if (this.enemiesSpawned >= this.totalEnemiesInWave) return;

    const randomType = Math.random();
    if (randomType < 0.5) {
      this.addEnemy('basic');
    } else if (randomType < 0.8) {
      this.addEnemy('fast');
    } else {
      this.addEnemy('tank');
    }

    this.enemiesSpawned++;

    // Planifie l'apparition du prochain ennemi avec un petit délai
    setTimeout(
      () => this.spawnNextEnemy(),
      1000 - Math.min(this.wave * 50, 500)
    ); // Les vagues avancées font apparaître plus rapidement
  }

  addEnemy(type = 'basic') {
    let enemy;
    const spawnX = Math.random() > 0.5 ? -50 : App.app.renderer.width + 50; // Apparaît à gauche ou à droite
    const spawnY = this.getRoadHeight() - 100; // Ajuste pour apparaître sur la route
    switch (type) {
      case 'basic':
        enemy = new EnemyBasic(spawnX, spawnY);
        break;
      case 'tank':
        enemy = new EnemyTank(spawnX, spawnY);
        break;
      case 'fast':
        enemy = new EnemyFast(spawnX, spawnY);
        break;
      default:
        console.error("Type d'ennemi inconnu");
        return;
    }

    this.container.addChild(enemy.container);
    this.enemies.push(enemy);
  }

  async showScene() {
    const background = await PIXI.Assets.load(
      'src/Assets/Background/PNG/Postapocalypce1/Bright/clouds1.png'
    );
    const nuages = new PIXI.Sprite(background);
    nuages.width = App.app.renderer.width;
    nuages.height = App.app.renderer.height;
    this.container.addChild(nuages);

    const roadSprite = await PIXI.Assets.load(
      'src/Assets/Background/PNG/Postapocalypce1/Bright/road.png'
    );
    const road = new PIXI.Sprite(roadSprite);
    road.width = App.app.renderer.width;
    road.height = App.app.renderer.height;
    console.log(road.height);
    console.log(road.width);
    road.y = App.app.renderer.height - road.height;

    this.pointMap = getGroundPhysic(road);
    this.container.addChild(road);
    this.road = road;
  }

  update(delta) {
    let audio = document.getElementById('ambient-music');
    audio.volume = 0.2;
    audio.play();

    if (!this.player.character) return;

    if (this.player) {
      this.player.update(this.pointMap, 10);
    }

    // Mettre à jour tous les ennemis
    for (const enemy of this.enemies) {
      if (!enemy) continue;
      enemy.update(delta, this.pointMap, this.player);
      this.checkPlayerAttacks(enemy);
    }
    this.player.checkCollisionsWithEnemies(this.enemies);

    // Nettoyer les ennemis morts de la liste
    this.enemies = this.enemies.filter((enemy) => !enemy.dead);

    // Vérifie si tous les ennemis de la vague sont morts
    if (
      this.enemies.length === 0 &&
      this.enemiesSpawned >= this.totalEnemiesInWave
    ) {
      if (this.generatingWave) return; // Attendre la fin de la vague actuelle
      this.wave++;
      this.maxEnemiesInWave += 2;
      this.displayWaveText(this.wave);
    }

    this.score.update();
  }

  checkPlayerAttacks(enemy) {
    const player = this.player;

    // Vérifier si l'ennemi est à portée d'attaque
    const isEnemyOnLeft =
      enemy.positionX + enemy.width >= player.character.x - 50; // À gauche du joueur
    const isEnemyOnRight =
      enemy.positionX <= player.character.x + player.character.width + 50; // À droite du joueur

    // Calculer la distance horizontale
    const distance = Math.abs(player.character.x - enemy.positionX);

    // Si l'ennemi est à portée des deux côtés
    if (distance < 50 && (isEnemyOnLeft || isEnemyOnRight)) {
      console.log('Attaque');
      this.handleAttack(player, enemy);
    }
  }
  getRoadHeight() {
    return this.road ? this.road.y + this.road.height : 0;
  }

  handleAttack(player, enemy) {
    if (enemy.attacking || enemy.dead) return;
    if (enemy.dead) {
      this.score.enemyKilled();
    }
    enemy.attacking = true;
    enemy.launchAnimation('attacking', 0.5);
    player.takeDamage(10);
    setTimeout(() => {
      enemy.attacking = false;
    }, 450);
  }
}
