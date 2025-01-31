import { Enemy } from './enemy.js';
import { loadFrames } from './utils/loadFrames.js';

const ANIMATION_PATHS = {
  walking:
    'src/Assets/Character/Enemy/Zombie1/Walking/0_Zombie_Villager_Walking_',
  dying: 'src/Assets/Character/Enemy/Zombie1/Dying/0_Zombie_Villager_Dying_',
  attacking:
    'src/Assets/Character/Enemy/Zombie1/Slashing/0_Zombie_Villager_Slashing_',
  idle: 'src/Assets/Character/Enemy/Zombie1/Idle/0_Zombie_Villager_Idle_',
};

/**
 * @fileoverview Ce fichier définit la classe EnemyBasic, un ennemi de base du jeu.
 * Il gère le chargement des animations, les mouvements, les attaques avec le joueur et l'environnement.
 * @author Ricardo Marques Pinto
 * @date 31.01.2025
 */
export class EnemyBasic extends Enemy {
  /**
   * Crée une instance d'EnemyBasic.
   * @param {number} x - Position initiale en X.
   * @param {number} y - Position initiale en Y.
   */
  constructor(x, y) {
    super(x, y, 1.5); // Vitesse de 1.5

    this.loadAnimations();
  }

  /**
   * Charge les animations de l'ennemi.
   * @async
   * @returns {Promise<void>} Une promesse qui se résout après le chargement des animations.
   */
  async loadAnimations() {
    try {
      // Charge toutes les animations en parallèle
      const [walking, dying, attacking, idle] = await Promise.all([
        loadFrames(ANIMATION_PATHS.walking),
        loadFrames(ANIMATION_PATHS.dying),
        loadFrames(ANIMATION_PATHS.attacking),
        loadFrames(ANIMATION_PATHS.idle),
      ]);

      this.animations = { walking, dying, attacking, idle };

      this.chargeEnemy(this.animations.idle);
    } catch (error) {
      console.error('Erreur lors du chargement des animations :', error);
    }
  }

  /**
   * Met à jour l'ennemi.
   * @param {number} delta - Temps écoulé depuis la dernière mise à jour.
   * @param {Array<number>} bounds - Contour du terrain.
   * @param {Object} player - Référence au joueur.
   */
  update(delta, bounds, player) {
    super.update(delta, bounds, player);
  }
}
