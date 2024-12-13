import * as PIXI from 'pixi.js';

export async function loadFrames(basePath) {
  const frames = [];
  let i = 0;

  while (true) {
    // Formater le numéro avec trois chiffres (001, 002, 003, ...)
    const frameNumber = String(i).padStart(3, '0');
    const frame = `${basePath}${frameNumber}.png`;
    console.log(`Attempting to load frame: ${frame}`);

    try {
      const texture = await PIXI.Assets.load(frame);
      frames.push(texture); // Ajouter la texture au tableau
      i++; // Passer au prochain numéro de frame
    } catch (error) {
      console.warn(`No more frames found at ${frame}. Stopping.`);
      break; // Arrêter si une frame n'est pas trouvée
    }
  }

  return frames;
}
