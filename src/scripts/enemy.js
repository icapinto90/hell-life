import * as PIXI from "pixi.js";
import { App } from "./app";
import { getGroundYAtX } from "./utils/getGroundYAtX";

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
  }

  chargeEnemy(texture) {
    this.enemy = new PIXI.AnimatedSprite(texture, 1);
    this.enemy.anchor.set(0.5);
    this.enemy.animationSpeed = 0.5; // Vitesse de l'animation
    this.enemy.play(); // Lance l'animation en boucle
    this.enemy.width = 150;
    this.enemy.height = 150;
    this.container.addChild(this.enemy);
    App.app.stage.addChild(this.container);
  }

  launchWalkingAnimation() {
    if (this.enemy.textures === this.animations.walking) return;
    if (this.animations.walking && this.animations.walking.length > 0) {
      this.enemy.textures = this.animations.walking;
      this.enemy.animationSpeed = this.speed / 10; // Ajuster la vitesse de l'animation
      this.enemy.play();
      console.log(
        "walking with speed:",
        this.speed,
        "animationSpeed:",
        this.enemy.animationSpeed
      );
    } else {
      console.error(
        "Erreur : l'animation de marche est manquante ou indéfinie."
      );
    }
  }

  async update(delta, groundContour) {
    if (!this.enemy) {
      return;
    }

    // Trouver la hauteur du sol à la position X de l'ennemi
    const groundY = getGroundYAtX(groundContour, this.x);
    console.log("groundY", groundY);

    // Appliquer la gravité si l'ennemi est en l'air
    if (this.y < groundY) {
      this.grounded = false;
      this.vy += this.gravity; // Augmente la vitesse verticale
      this.y += this.vy; // Met à jour la position verticale
      console.log("vy", this.vy);
    } else {
      // Si l'ennemi est au sol
      this.grounded = true;
      this.y = groundY; // Ajuste la position de l'ennemi au niveau du sol
      this.vy = 0; // Réinitialise la vitesse verticale
    }

    // Gérer l'attaque
    if (
      App.app.player.character.x > this.x - 20 - this.enemy.width &&
      App.app.player.character.x < this.x + 20 &&
      !this.attacking
    ) {
      this.attacking = true;
      this.launchAttackAnimation();

      // Met en pause jusqu'à la fin de l'animation
      setTimeout(() => {
        console.log("fin attaque");
        this.attacking = false;
        console.log("attacking", this.attacking);
      }, 450);
    } else if (App.app.player.character.x > this.x && !this.attacking) {
      // Déplacement vers la droite
      this.x += this.speed;
      if (this.movingleft === true) {
        this.enemy.scale.x *= -1; // Inverser la direction
      }
      this.movingleft = false;
      this.launchWalkingAnimation();
    } else if (App.app.player.character.x < this.x && !this.attacking) {
      // Déplacement vers la gauche
      if (this.movingleft === false) {
        this.enemy.scale.x *= -1; // Inverser la direction
        this.movingleft = true;
      }
      this.x -= this.speed;
      this.launchWalkingAnimation();
    }

    // Appliquer les nouvelles coordonnées au conteneur
    this.container.x = this.x;
    this.container.y = this.y;
  }

  launchAttackAnimation() {
    if (this.animations.attacking && this.animations.attacking.length > 0) {
      this.enemy.textures = this.animations.attacking;
      this.enemy.play();
    } else {
      console.error(
        "Erreur : l'animation d'attaque est manquante ou indéfinie."
      );
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

  takeDamage(amount) {
    this.health -= amount;
    if (this.health <= 0) {
      this.destroy();
    }
  }
}
