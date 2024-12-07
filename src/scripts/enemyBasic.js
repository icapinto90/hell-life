import { Enemy } from './enemy.js';
import { loadFrames } from './utils/loadFrames.js';

export class EnemyBasic extends Enemy {
  constructor(x, y) {
    // Appelle le constructeur de la classe parente sans textures (ici on passe un tableau vide ou null)
    super(x, y); // PIXI.Texture.EMPTY est une texture vide de remplacement

    // Charge les animations après l'initialisation de l'objet
    this.loadAnimation();
  }
  // Charger les animations de l'ennemi (walking, dying, etc.)
  async loadAnimation() {
    this.animations = {};
    try {
      this.animations.walking = await loadFrames(
        'src/Assets/Character/Enemy/Zombie1/Walking/0_Zombie_Villager_Walking_'
      );
      this.animations.dying = await loadFrames(
        'src/Assets/Character/Enemy/Zombie1/Dying/0_Zombie_Villager_Dying_'
      );
      this.animations.attacking = await loadFrames(
        'src/Assets/Character/Enemy/Zombie1/Slashing/0_Zombie_Villager_Slashing_'
      );
      this.animations.idle = await loadFrames(
        'src/Assets/Character/Enemy/Zombie1/Idle/0_Zombie_Villager_Idle_'
      );
    } catch (error) {
      console.error('Error during loading frames:', error);
    }
    this.chargeEnemy(this.animations.idle); // Charge l'animation idle par défaut
  }

  // Jouer l'animation 'idle'
  playIdleAnimation() {
    if (this.animations.idle && this.animations.idle.length > 0) {
      this.textures = this.animations.idle; // Change l'ensemble des textures de l'ennemi pour l'animation idle
      this.animationSpeed = 0.1; // Définir la vitesse de l'animation
      this.enemy.play(); // Démarre l'animation
    } else {
      console.error(
        'Error: Cannot play idle animation. Textures are missing or undefined.'
      );
    }
  }

  // Exemple d'animation spécifique à jouer (par exemple, walking, dying, etc.)
  playWalkingAnimation() {
    if (this.animations.walking && this.animations.walking.length > 0) {
      this.textures = this.animations.walking;
      this.play();
    } else {
      console.error('Error: Walking animation is missing or undefined.');
    }
  }

  // Mettre à jour l'ennemi
  update(delta, bounds) {
    super.update(delta, bounds); // Appel au parent pour le mouvement de base (déplacement)
    // Ajouter d'autres logiques pour l'ennemi ici
  }
}
