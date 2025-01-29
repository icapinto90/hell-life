import * as PIXI from 'pixi.js';
import { App } from './app';
import { getGroundYAtX } from './utils/getGroundYAtX';

const GRAVITY = 0.5;
const INITIAL_SPEED = 1.5;
const INITIAL_HEALTH = 100;
const HEALTH_BAR_WIDTH = 100;
const HEALTH_BAR_HEIGHT = 10;

/**
 * Classe abstraite représentant un ennemi dans le jeu.
 * @abstract
 * @author Ricardo
 */
export class Enemy {
  /**
   * Crée une instance d'Enemy.
   * @param {number} [x=0] - Position initiale en X.
   * @param {number} [y=0] - Position initiale en Y.
   * @param {number} [speed=INITIAL_SPEED] - Vitesse de déplacement.
   * @param {number} [health=INITIAL_HEALTH] - Points de vie de l'ennemi.
   */
  constructor(x = 0, y = 0, speed = INITIAL_SPEED, health = INITIAL_HEALTH) {
    /** @type {PIXI.Container} Conteneur principal de l'ennemi */
    this.container = new PIXI.Container();
    this.container.interactive = true;

    /** @type {PIXI.AnimatedSprite|null} Sprite animé de l'ennemi */
    this.enemy = null;

    /** @type {number} Position X de l'ennemi */
    this.positionX = x;

    /** @type {number} Position Y de l'ennemi */
    this.positionY = y;

    /** @type {number} Vitesse de l'ennemi */
    this.speed = speed;

    /** @type {number} Points de vie actuels de l'ennemi */
    this.health = health;

    /** @type {number} Points de vie maximum */
    this.maxHealth = health;

    /** @type {number} Vitesse verticale de l'ennemi (pour la gravité) */
    this.vy = 0;

    /** @type {number} Force gravitationnelle appliquée à l'ennemi */
    this.gravity = GRAVITY;

    /** @type {boolean} Indique si l'ennemi est au sol */
    this.grounded = false;

    /** @type {boolean} Indique si l'ennemi est en train d'attaquer */
    this.attacking = false;

    /** @type {Object<string, PIXI.Texture[]>} Stocke les animations de l'ennemi */
    this.animations = {};

    /** @type {boolean} Indique si l'ennemi se déplace vers la gauche */
    this.movingleft = false;

    /** @type {boolean} Indique si l'ennemi est mort */
    this.dead = false;
  }

  updateHealthBar() {
    if (!this.healthBar) {
      this.healthBar = new PIXI.Graphics();
      this.container.addChild(this.healthBar);
    }

    this.healthBar.clear();

    const healthRatio = this.health / this.maxHealth;
    const healthColor =
      healthRatio > 0.5 ? 0x00ff00 : healthRatio > 0.25 ? 0xffff00 : 0xff0000;

    // Dessiner la barre de fond
    this.healthBar.beginFill(0x444444);
    this.healthBar.drawRect(
      -HEALTH_BAR_WIDTH / 2,
      -this.enemy.height / 2 - 20,
      HEALTH_BAR_WIDTH,
      HEALTH_BAR_HEIGHT
    );
    this.healthBar.endFill();

    // Dessiner la barre de santé
    this.healthBar.beginFill(healthColor);
    this.healthBar.drawRect(
      -HEALTH_BAR_WIDTH / 2,
      -this.enemy.height / 2 - 20,
      HEALTH_BAR_WIDTH * healthRatio,
      HEALTH_BAR_HEIGHT
    );
    this.healthBar.endFill();
  }

  /**
   * Charge le sprite animé de l'ennemi.
   * @param {PIXI.Texture[]} texture - Textures pour l'animation.
   */
  chargeEnemy(texture) {
    this.enemy = new PIXI.AnimatedSprite(texture, 1);
    this.enemy.anchor.set(0.5);
    this.enemy.animationSpeed = 0.5;
    this.enemy.play();
    this.enemy.width = 150;
    this.enemy.height = 150;
    this.updateHealthBar();
    this.container.addChild(this.enemy);
    App.app.stage.addChild(this.container);
  }

  /**
   * Lance une animation spécifique de l'ennemi.
   * @param {string} animationType - Type d'animation (ex: "walking", "attacking").
   */
  launchAnimation(animationType) {
    console.log(animationType);
    const animation = this.animations[animationType];
    if (animation && animation.length > 0) {
      this.enemy.textures = animation;
      this.enemy.loop = animationType !== 'dying';
      this.enemy.animationSpeed =
        animationType === 'attacking' ? 1 : this.speed / 10;
      this.enemy.play();
    } else {
      console.error(
        `Erreur : l'animation ${animationType} est manquante ou indéfinie.`
      );
    }
  }

  /**
   * Met à jour l'état de l'ennemi.
   * @param {number} delta - Temps écoulé depuis la dernière mise à jour.
   * @param {Array<number>} groundContour - Contour du sol.
   * @param {Object} player - Joueur à suivre.
   */
  async update(delta, groundContour, player) {
    if (!this.enemy || this.attacking || !player || this.dead) return;

    const groundY = getGroundYAtX(groundContour, this.positionX);
    this.grounded = true;
    this.positionY = groundY - this.enemy.height + 66;
    this.vy = 0;

    this.followObject(player.character);
  }

  /**
   * Vérifie la collision de l'ennemi avec le sol.
   * @param {number} ground - Position du sol en Y.
   */
  checkCollisionWithGround(ground) {
    const enemyBottom = this.positionY + this.enemy.height;
    const groundTop = ground;

    if (enemyBottom >= groundTop) {
      this.positionY = groundTop - this.enemy.height;
      this.grounded = true;
      this.vy = 0;
    } else {
      this.grounded = false;
    }
  }

  /**
   * Fait suivre l'ennemi à un objet (ex: joueur).
   * @param {Object} object - Objet à suivre (ex: le joueur).
   */
  followObject(object) {
    if (this.positionX < object.x) {
      this.positionX += this.speed;
      if (this.movingleft) {
        this.enemy.scale.x *= -1;
      }
      this.movingleft = false;
      this.launchAnimation('walking');
    } else {
      if (!this.movingleft) {
        this.enemy.scale.x *= -1;
        this.movingleft = true;
      }
      this.positionX -= this.speed;
      this.launchAnimation('walking');
    }
    this.container.x = this.positionX;
    this.container.y = this.positionY;
  }

  /**
   * Inflige des dégâts à l'ennemi.
   * @param {number} amount - Quantité de dégâts infligés.
   */
  takeDamage(amount) {
    this.health -= amount;
    this.updateHealthBar();
    this.positionX += this.movingleft ? 5 : -5;
    if (this.health <= 0) {
      const damageSound = document.getElementById('dead_enemy_sound');
      damageSound.play();
      damageSound.volume = 12.0;
      this.dead = true;
      this.launchAnimation('dying');
      setTimeout(() => this.destroy(), 2000);
    }
  }

  /**
   * Détruit l'ennemi et supprime son sprite.
   */
  destroy() {
    this.container.destroy();
  }
}
