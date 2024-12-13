import { Enemy } from "./enemy.js";
import { loadFrames } from "./utils/loadFrames.js";

export class EnemyBasic extends Enemy {
  constructor(x, y) {
    // Appelle le constructeur de la classe parente sans textures (ici on passe un tableau vide ou null)
    super(x, y, 1.5); // PIXI.Texture.EMPTY est une texture vide de remplacement

    // Charge les animations après l'initialisation de l'objet
    this.loadAnimation();
  }
  // Charger les animations de l'ennemi (walking, dying, etc.)
  async loadAnimation() {
    try {
      this.animations.walking = await loadFrames(
        "src/Assets/Character/Enemy/Zombie1/Walking/0_Zombie_Villager_Walking_"
      );
      this.animations.dying = await loadFrames(
        "src/Assets/Character/Enemy/Zombie1/Dying/0_Zombie_Villager_Dying_"
      );
      this.animations.attacking = await loadFrames(
        "src/Assets/Character/Enemy/Zombie1/Slashing/0_Zombie_Villager_Slashing_"
      );
      this.animations.idle = await loadFrames(
        "src/Assets/Character/Enemy/Zombie1/Idle/0_Zombie_Villager_Idle_"
      );
    } catch (error) {
      console.error("Error during loading frames:", error);
    }
    this.chargeEnemy(this.animations.idle); // Charge l'animation idle par défaut
  }

  // Mettre à jour l'ennemi
  update(delta, bounds) {
    super.update(delta, bounds); // Appel au parent pour le mouvement de base (déplacement)
    // Ajouter d'autres logiques pour l'ennemi ici
  }
}
