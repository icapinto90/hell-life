import * as PIXI from 'pixi.js';

import app from './app.js';

const container = new PIXI.Container();
app.stage.addChild(container);

//ajout du background
const background = await PIXI.Assets.load('src/Assets/Background/PNG/Postapocalypce1/Bright/clouds1.png')
const nuages = new PIXI.Sprite(background);
nuages.width = app.renderer.width;
nuages.height = app.renderer.height;
nuages.x = 0;
nuages.y = 0;
container.addChild(nuages);
//ajout de la route
const roadSprite = await PIXI.Assets.load('src/Assets/Background/PNG/Postapocalypce1/Bright/road.png');
const road = new PIXI.Sprite(roadSprite);
road.width = app.renderer.width;
road.height = app.renderer.height;
road.x = 0;
road.y = 0;
container.addChild(road);

