import * as PIXI from 'pixi.js';
import { App } from './app';
import { getGroundYAtX } from './utils/getGroundYAtX';

export class Enemy {
  constructor(x = 0, y = 0, speed = 1.5, health = 100) {
    this.container = new PIXI.Container();
    this.container.interactive = true;
    this.enemy = null;
    this.x = x;
    this.y = y;
    this.speed = speed;
    this.health = health;
    this.vy = 0; // Vitesse verticale initiale
    this.gravity = 0.5; // Force gravitationnelle
    this.grounded = false; // Indicateur si l'ennemi est au sol
    this.attacking = false;
    this.animations = {};
    this.movingleft = false;
    this.maxHealth = health; // Santé maximale
    this.dead = false;
  }

  updateHealthBar() {
    this.healthBar = new PIXI.Graphics();
    this.healthBarWidth = 100; // Largeur maximale de la barre de vie
    this.healthBarHeight = 10; // Hauteur de la barre de vie

    // Couleur de la barre en fonction de la santé restante
    const healthRatio = this.health / this.maxHealth;
    const healthColor =
      healthRatio > 0.5 ? 0x00ff00 : healthRatio > 0.25 ? 0xffff00 : 0xff0000;

    // Dessiner la barre de fond (gris)

    this.healthBar.rect(
      -this.healthBarWidth / 2,
      -this.enemy.height / 2 - 20, // Position au-dessus de l'ennemi
      this.healthBarWidth,
      this.healthBarHeight
    );
    this.healthBar.fill(0x444444);

    // Dessiner la barre de santé restante
    this.healthBar.rect(
      -this.healthBarWidth / 2,
      -this.enemy.height / 2 - 20, // Position au-dessus de l'ennemi
      this.healthBarWidth * healthRatio,
      this.healthBarHeight
    );
    this.healthBar.fill(healthColor);
    this.container.addChild(this.healthBar); // Ajoute la barre au conteneur de l'ennemi
  }

  chargeEnemy(texture) {
    this.enemy = new PIXI.AnimatedSprite(texture, 1);
    this.enemy.anchor.set(0.5);
    this.enemy.animationSpeed = 0.5; // Vitesse de l'animation
    this.enemy.play(); // Lance l'animation en boucle
    this.enemy.width = 150;
    this.enemy.height = 150;
    this.updateHealthBar();
    this.container.addChild(this.enemy);
    App.app.stage.addChild(this.container);
  }

  launchWalkingAnimation() {
    if (this.enemy.textures === this.animations.walking) return;
    if (this.animations.walking && this.animations.walking.length > 0) {
      this.enemy.textures = this.animations.walking;
      this.enemy.animationSpeed = this.speed / 10; // Ajuster la vitesse de l'animation
      this.enemy.play();
    } else {
      console.error(
        "Erreur : l'animation de marche est manquante ou indéfinie."
      );
    }
  }

  async update(delta, groundContour, player) {
    //if dead return

    if (!this.enemy || this.attacking || !player || this.dead) return;
    // Trouver la hauteur du sol à la position X de l'ennemi

    // Gérer la gravité et le sol
    const groundY = getGroundYAtX(groundContour, this.x);

    this.grounded = true;
    this.y = groundY - this.enemy.height + 66;
    this.vy = 0;

    this.followObject(player.character);
  }

  launchAttackAnimation() {
    if (this.animations.attacking && this.animations.attacking.length > 0) {
      this.enemy.textures = this.animations.attacking;
      this.enemy.loop = false;
      this.enemy.animationSpeed = 0.5;
      this.enemy.play();
    } else {
      console.error(
        "Erreur : l'animation d'attaque est manquante ou indéfinie."
      );
    }
  }

  launchDieAnimation() {
    if (this.animations.dying && this.animations.dying.length > 0) {
      console.log('launchDieAnimation');
      this.enemy.textures = this.animations.dying;
      this.enemy.loop = false; // Arrêter l'animation à la fin
      this.enemy.animationSpeed = 0.3; // Vitesse de l'animation
      this.enemy.play();
    } else {
      console.error("Erreur : l'animation de mort est manquante ou indéfinie.");
    }
  }

  checkCollisionWithGround(ground) {
    const enemyBottom = this.y + this.enemy.height;
    const groundTop = ground;

    if (enemyBottom >= groundTop) {
      this.y = groundTop - this.enemy.height; // Positionner l'ennemi sur le sol
      this.grounded = true;
      this.vy = 0; // Réinitialiser la vitesse verticale
    } else {
      this.grounded = false;
    }
  }

  followObject(object) {
    if (this.x < object.x) {
      this.x += this.speed;
      if (this.movingleft === true) {
        this.enemy.scale.x *= -1; // Inverser la direction
      }
      this.movingleft = false;
      this.launchWalkingAnimation();
    } else {
      // Déplacement vers la gauche
      if (this.movingleft === false) {
        this.enemy.scale.x *= -1; // Inverser la direction
        this.movingleft = true;
      }
      this.x -= this.speed;
      this.launchWalkingAnimation();
    }
    this.container.x = this.x;
    this.container.y = this.y;
  }

  takeDamage(amount) {
    console.log('takeDamage', amount);
    this.health -= amount;
    this.updateHealthBar();
    this.x += this.movingleft ? 5 : -5;
    if (this.health <= 0) {
      this.dead = true;
 
      this.launchDieAnimation();
      setTimeout(() => {
        this.destroy();
      }, 2000);
      let damageSound = document.getElementById('dead_enemy_sound');
      // Revenir au début du son
    damageSound.play(); // Jouer le son des dégâts
    damageSound.volume = 12.0;
    }
  }

  destroy() {
    this.container.destroy();
  }
}
