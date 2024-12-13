export function getGroundPhysic(sprite) {
  const canvas = document.createElement("canvas");
  canvas.width = sprite.texture.width;
  canvas.height = sprite.texture.height;
  const ctx = canvas.getContext("2d");
  console.log(sprite);
  // Dessiner l'image sur un canvas temporaire
  ctx.drawImage(sprite.texture.source.resource, 0, 0);

  const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height).data;
  const contour = [];

  for (let x = 0; x < canvas.width; x++) {
    for (let y = 0; y < canvas.height; y++) {
      const alpha = imageData[(y * canvas.width + x) * 4 + 3]; // Canal alpha
      if (alpha > 0) {
        const height = canvas.height - window.innerHeight - 50; // Hauteur relative
        // Trouver le premier pixel opaque
        contour.push({ x: x, y: y - height });
        break;
      }
    }
  }
  
  return contour;
}
