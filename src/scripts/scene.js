import * as PIXI from 'pixi.js';
import { App } from './app.js';
import { EnemyBasic } from './enemyBasic.js';
import { EnemyFast } from './enemyFast.js';
import { EnemyTank } from './enemyTank.js';
import { getGroundPhysic } from './utils/getGroundPhysic.js';
import { Player } from './player.js';
import { ScoreSystem } from './score.js';

export class Scene {
  constructor() {
    (async () => {
      this.container = new PIXI.Container();
      this.score = new ScoreSystem();
      this.container.interactive = true;
      this.scene = null;
      this.enemies = [];
      this.wave = 1; // Commence à la vague 1
      this.enemiesSpawned = 0; // Nombre d'ennemis apparus dans la vague
      this.maxEnemiesInWave = 5; // Nombre initial d'ennemis par vague
      this.waveText = null; // Texte pour afficher la vague
      this.generatingWave = false; // Indicateur si une vague est en cours de génération
      await this.showScene();
      this.initPlayer();
      this.initScore();
      this.initWaveText(); // Initialisation du texte de vague
      this.startWave(); // Démarrer la première vague
      App.app.stage.addChild(this.container);
      App.app.ticker.add((delta) => this.update(delta));
    })();
  }

  initScore() {
    this.score = new ScoreSystem();
    this.container.addChild(this.score.container);
  }

  initPlayer() {
    this.player = new Player();
    this.container.addChild(this.player.container);
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

  displayWaveText(waveNumber) {
    this.waveText.text = `Vague ${waveNumber}`;
    this.waveText.visible = true;
    this.generatingWave = true; // Indique que la vague est en cours de génération

    // Masquer le texte après 2 secondes
    setTimeout(() => {
      this.waveText.visible = false;
      this.startWave(); // Démarre la nouvelle vague après l'affichage
      this.generatingWave = false; // Indique que la vague est terminée
    }, 2000);
  }

  startWave() {
    this.enemiesSpawned = 0;
    this.totalEnemiesInWave = this.maxEnemiesInWave + (this.wave - 1) * 3; // Augmente le nombre d'ennemis à chaque vague
    this.spawnNextEnemy(); // Commence à faire apparaître les ennemis
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

    // Nettoyer les ennemis morts de la liste
    this.enemies = this.enemies.filter((enemy) => !enemy.dead);

    // Vérifie si tous les ennemis de la vague sont morts
    if (
      this.enemies.length === 0 &&
      this.enemiesSpawned >= this.totalEnemiesInWave
    ) {
      if (this.generatingWave) return; // Attendre la fin de la vague actuelle
      this.wave++;
      this.maxEnemiesInWave += 2; // Augmente la difficulté de manière graduelle
      this.displayWaveText(this.wave); // Affiche le texte de vague
    }

    // Mettre à jour le score
    this.score.update();
  }

  checkPlayerAttacks(enemy) {
    const player = this.player;

    // Vérifier si l'ennemi est à portée d'attaque
    const isEnemyOnLeft = enemy.x + enemy.width >= player.character.x - 50; // À gauche du joueur
    const isEnemyOnRight =
      enemy.x <= player.character.x + player.character.width + 50; // À droite du joueur

    // Calculer la distance horizontale
    const distance = Math.abs(player.character.x - enemy.x);

    // Si l'ennemi est à portée des deux côtés
    if (distance < 50 && (isEnemyOnLeft || isEnemyOnRight)) {
      // Appeler l'attaque
      this.handleAttack(player, enemy);
    }
  }
  getRoadHeight() {
    return this.road ? this.road.y + this.road.height : 0;
  }

  handleAttack(player, enemy) {
    if (enemy.attacking || enemy.dead) return;
    enemy.takeDamage(10);
    if (enemy.dead) {
      this.score.enemyKilled();
    }
    enemy.attacking = true;
    enemy.launchAttackAnimation();
    setTimeout(() => {
      enemy.attacking = false;
    }, 450);
  }
}
