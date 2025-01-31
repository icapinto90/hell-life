/**
 * @fileoverview Ce module permet de récupérer la hauteur du sol à une position x donnée.
 * Il prend en compte les contours du sprite pour déterminer la hauteur du sol.
 * @param {Object[]} contour - Un tableau d'objets contenant les coordonnées des points du contour.
 * @param {number} x - La position x à
 * @returns {number} - La hauteur du sol à la position x donnée.
 * @author Ricardo Marques Pinto
 * @date 31.01.2025
 */
export function getGroundYAtX(contour, x) {

  const roundedX = Math.round(x);

  // Chercher des points autour de x si le point exact n'est pas trouvé
  const point = contour.find((p) => p.x === roundedX);

  if (point) {
    return point.y;
  }

  // Si pas de point exact, trouver les points les plus proches
  const closestPoints = contour
    .filter((p) => Math.abs(p.x - roundedX) <= 1)
    .sort((a, b) => Math.abs(a.x - roundedX) - Math.abs(b.x - roundedX));

  if (closestPoints.length > 0) {
    return closestPoints[0].y;
  }
  return null;
}
