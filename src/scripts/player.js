import * as PIXI from 'pixi.js';
import { App } from './app.js';
import { Scene } from './scene.js';
import { groupD8 } from 'pixi.js';

export class Player {
    constructor() {
        this.container = new PIXI.Container();
        this.container.interactive = true;

        this.speed = 5;
        this.jumpSpeed = 10;
        this.gravity = 0.5;
        this.isJumping = false;
        this.isFalling = false;
        this.velocityY = 0;
        this.groundY = 370;
        this.keys = {};
        this.animations = {};
        this.currentState = 'idle';

        this.character = null; 
        this.setUpControls();
        this.chargePlayer();
        
        

        
    }

    async chargePlayer() {
        console.log('groupeD8', groupD8);
        this.animations.idle = await this.loadFrame('src/Assets/Character/Hero/PNG/PNG Sequences/Idle/0_Fallen_Angels_Idle_', 18);
        this.animations.running = await this.loadFrame('src/Assets/Character/Hero/PNG/PNG Sequences/Running/0_Fallen_Angels_Running_', 12);
        this.animations.jumping = await this.loadFrame('src/Assets/Character/Hero/PNG/PNG Sequences/Jump Start/0_Fallen_Angels_Jump Start_', 6);
        this.animations.fallingDown = await this.loadFrame('src/Assets/Character/Hero/PNG/PNG Sequences/Falling Down/0_Fallen_Angels_Falling Down_', 6)
        
        

        this.character = new PIXI.AnimatedSprite(this.animations.idle); 
        this.character.width = 150;
        this.character.height = 150;

        this.character.animationSpeed = 0.2;
        this.character.play();

        this.character.x = 20;
        this.character.y = this.groundY;

        //const roadHeight = CurrentScene.getRoadHeight(); // Appeler la méthode pour obtenir la hauteur réelle
        //console.log('Hauteur réelle de la route :', roadHeight);

        this.container.addChild(this.character);

        
        App.app.ticker.add(() => {
            this.update(); 
        });
    }

    async loadFrame(basePath, frameCount) {
        const frames = [];
        for (let i = 1; i <= frameCount; i++) {
            const frame = `${basePath}${i}.png`;
            console.log(`Attempting to load frame: ${frame}`);
            try {
                const texture = await PIXI.Assets.load(frame); 
                frames.push(texture);
            } catch (error) {
                console.error(`Error loading texture: ${frame}`, error);
            }
        }
        return frames;
    }
    setUpControls() {
        window.addEventListener('keydown', (event) => {
            this.keys[event.key] = true;
    
            
            if ((event.key === 'ArrowUp' || event.key === 'w') && !this.isJumping) {
                this.isJumping = true;
                this.velocityY = -this.jumpSpeed; 
                this.setAnimation('jumping');
            }
        });
    
        window.addEventListener('keyup', (event) => {
            this.keys[event.key] = false;
        });
    }
    
    setAnimation(state) {
        if (this.currentState !== state) {
            this.currentState = state;
            this.character.textures = this.animations[state];
            this.character.gotoAndPlay(0); // redemarre animation
        }
    }

    update() {
        if (this.character) {
            if (this.keys['ArrowLeft'] || this.keys['a']) {
                this.character.x -= this.speed;
                this.character.texture.rotate = groupD8.MIRROR_HORIZONTAL;
                if(!this.isJumping)
                    {this.setAnimation('running');}
            }
            

            if (this.keys['ArrowRight'] || this.keys['d']) { 
                this.character.x += this.speed;
                if(!this.isJumping)
                    this.character.texture.rotate = groupD8.E;
                    {this.setAnimation('running');}
            }
            


            if(!this.keys['ArrowLeft'] && !this.keys['ArrowRight'] && !this.keys['a'] && !this.keys['d']){
                if(!this.isJumping && this.currentState !== 'idle'){
                this.setAnimation('idle');
            }
            }

                //Gestion du saut
                 if (this.isJumping) {
                    this.character.y += this.velocityY; // Change la position verticale
                    this.velocityY += this.gravity; // Applique la gravité
                    
                    // Passer à l'animation de chute si le personnage commence à descendre
                if (this.velocityY > 0 && !this.isFalling) {
                    this.isFalling = true;
                    this.setAnimation('fallingDown');
                }
                    // Arrête le saut lorsque le personnage touche le sol
                    if (this.character.y >= this.groundY) {
                        this.character.y = this.groundY; // Ramène le personnage au sol
                        this.isJumping = false; // Permet de sauter à nouveau
                        this.isFalling = false; // Réinitialise l'état de chute
                        this.setAnimation('idle'); // Reviens à l'état idle
                    }
        }
    }
}}
