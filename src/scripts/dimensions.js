const coordinatesDisplay = document.createElement('div');
coordinatesDisplay.style.position = 'fixed';
coordinatesDisplay.style.top = '10px';
coordinatesDisplay.style.left = '10px';
coordinatesDisplay.style.backgroundColor = 'rgba(0, 0, 0, 0.7)';
coordinatesDisplay.style.color = 'white';
coordinatesDisplay.style.padding = '10px';
coordinatesDisplay.style.borderRadius = '5px';
coordinatesDisplay.style.fontFamily = 'Arial, sans-serif';
coordinatesDisplay.style.fontSize = '14px';
coordinatesDisplay.style.zIndex = '1000';
document.body.appendChild(coordinatesDisplay);

// Écouter les mouvements de la souris
window.addEventListener('mousemove', (event) => {
    const x = event.clientX; // Coordonnée X de la souris
    const y = event.clientY; // Coordonnée Y de la souris

    // Afficher les coordonnées
    coordinatesDisplay.textContent = `X: ${x}, Y: ${y}`;
});