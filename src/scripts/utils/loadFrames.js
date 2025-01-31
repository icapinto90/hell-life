import * as PIXI from "pixi.js";

/**
 * @fileoverview Ce système permet de charger une séquence d'images pour créer une animation.
 * @param {string} basePath - Le chemin de base des images à charger.
 * @returns {Promise<PIXI.Texture[]>} - Un tableau de textures chargées.
 * @author Ricardo Marques Pinto
 * @date 31.01.2025
 */
export async function loadFrames(basePath) {
  const frames = [];
  let i = 0;

  while (true) {
    // Formater le numéro avec trois chiffres (001, 002, 003, ...)
    const frameNumber = String(i).padStart(3, "0");
    const frame = `${basePath}${frameNumber}.png`;

    try {
      const texture = await PIXI.Assets.load(frame);
      frames.push(texture);
      i++; 
    } catch (error) {
      console.warn(`No more frames found at ${frame}. Stopping.`);
      break; // Arrêter si une frame n'est pas trouvée
    }
  }

  return frames;
}
