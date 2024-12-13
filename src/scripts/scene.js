import * as PIXI from 'pixi.js';
import { App } from './app.js';

export class Scene {
  constructor() {
    this.container = new PIXI.Container();
    this.container.interactive = true;
    this.scene = null;
    this.showScene();
  }

  async showScene() {
    //ajout du background
    const background = await PIXI.Assets.load(
      'src/Assets/Background/PNG/Postapocalypce1/Bright/clouds1.png'
    );
    const nuages = new PIXI.Sprite(background);
    nuages.width = App.app.renderer.width;
    nuages.height = App.app.renderer.height;
    nuages.x = 0;
    nuages.y = 0;
    this.container.addChild(nuages);

    //ajout de la route
    const roadSprite = await PIXI.Assets.load(
      'src/Assets/Background/PNG/Postapocalypce1/Bright/road.png'
    );
    const road = new PIXI.Sprite(roadSprite);
    road.width = App.app.renderer.width;
    road.height = App.app.renderer.height;
    road.y = App.app.renderer.height - road.height;

    this.container.addChild(road);
    this.road = road;
    this.roadContour = await this.getRouteContour('src/Assets/Background/PNG/Postapocalypce1/Bright/road.png');

    }

    
    async getRouteContour(imagePath) {
      return new Promise((resolve) => {
        const image = new Image();
        image.src = imagePath;
  
        image.onload = () => {
          const canvas = document.createElement('canvas');
          const context = canvas.getContext('2d');
  
          canvas.width = image.width;
          canvas.height = image.height;
  
          // Dessiner l'image sur le canvas
          context.drawImage(image, 0, 0);
  
          // Récupérer les données des pixels
          const imageData = context.getImageData(0, 0, image.width, image.height);
          const data = imageData.data;
  
          const contour = [];
          for (let x = 0; x < image.width; x++) {
            let found = false;
            for (let y = image.height - 1; y >= 0; y--) {
              const alpha = data[(y * image.width + x) * 4 + 3]; // Canal alpha
              if (alpha > 0) {
                contour[x] = y; // Enregistrer la hauteur visible pour x
                found = true;
                break;
              }
            }
            if (!found) {
              contour[x] = image.height; // Si aucun pixel non transparent, position au bas
            }
          }
  
          resolve(contour);
        };
      });
    }
  
    getRoadHeightAt(x) {
      if (!this.roadContour || x < 0 || x >= this.roadContour.length) {
        return App.app.renderer.height; // Retourne le bas de l'écran si hors des limites
      }
      return this.roadContour[Math.floor(x)];
    }
  }

