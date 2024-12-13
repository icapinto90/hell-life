export function getGroundYAtX(contour, x) {
  // Arrondir x
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

  // Fallback si aucun point n'est trouvé
  console.warn(`Aucun point de sol trouvé pour x: ${x}`);
  return null;
}