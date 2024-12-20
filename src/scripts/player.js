import * as PIXI from "pixi.js";
import { App } from "./app.js";
import { Scene } from "./scene.js";
import { groupD8 } from "pixi.js";
import { getGroundYAtX } from "./utils/getGroundYAtX.js";

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
    this.groundY = 300;
    this.keys = {};
    this.animations = {};
    this.currentState = "idle";
    this.health = 100;

    this.character = null;
    this.setUpControls();
    (async () => {
      await this.chargePlayer();
    })();
  }

  async chargePlayer() {
    console.log("groupeD8", groupD8);
    this.animations.idle = await this.loadFrame(
      "src/Assets/Character/Hero/PNG/PNG Sequences/Idle/0_Fallen_Angels_Idle_",
      18
    );
    this.animations.walking = await this.loadFrame(
      "src/Assets/Character/Hero/PNG/PNG Sequences/Walking/0_Fallen_Angels_Walking_",
      24
    );
    this.animations.running = await this.loadFrame(
      "src/Assets/Character/Hero/PNG/PNG Sequences/Running/0_Fallen_Angels_Running_",
      12
    );
    this.animations.jumping = await this.loadFrame(
      "src/Assets/Character/Hero/PNG/PNG Sequences/Jump Start/0_Fallen_Angels_Jump Start_",
      6
    );
    this.animations.fallingDown = await this.loadFrame(
      "src/Assets/Character/Hero/PNG/PNG Sequences/Falling Down/0_Fallen_Angels_Falling Down_",
      6
    );
    this.animations.lowered = await this.loadFrame("");

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

      try {
        const texture = await PIXI.Assets.load(frame);
        frames.push(texture);
      } catch (error) {}
    }
    return frames;
  }

  setUpControls() {
    window.addEventListener("keydown", (event) => {
      this.keys[event.key] = true;

      if ((event.key === "ArrowUp" || event.key === "w") && !this.isJumping) {
        this.isJumping = true;
        this.velocityY = -this.jumpSpeed;
        this.setAnimation("jumping");
      }
    });

    window.addEventListener("keyup", (event) => {
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
      // Déplacement horizontal
      if (this.keys["ArrowLeft"] || this.keys["a"]) {
        this.character.x -= this.speed;
        if (!this.isJumping) {
          this.setAnimation("running");
        }
      }

      if (this.keys["ArrowRight"] || this.keys["d"]) {
        this.character.x += this.speed;
        if (!this.isJumping) {
          this.setAnimation("running");
        }
      }

      // Ajuster la position verticale en fonction de la route
      if (this.scene && this.scene.getRoadHeightAt) {
        const roadHeight = this.scene.getRoadHeightAt(this.character.x);
        if (roadHeight !== undefined) {
          this.character.y = roadHeight - this.character.height; // Positionner le personnage sur la route
        }
      }

      // Empêcher de sortir de l'écran
      if (this.character.x < -38) this.character.x = -38;
      if (
        this.character.x >
        App.app.renderer.width + 38 - this.character.width
      ) {
        this.character.x = App.app.renderer.width - this.character.width + 38;
      }

      // Gestion des animations si le personnage est immobile
      if (
        !this.keys["ArrowLeft"] &&
        !this.keys["ArrowRight"] &&
        !this.keys["a"] &&
        !this.keys["d"]
      ) {
        if (!this.isJumping && this.currentState !== "idle") {
          this.setAnimation("idle");
        }
      }

      // Gestion du saut
      if (this.isJumping) {
        this.character.y += this.velocityY; // Appliquer la gravité
        this.velocityY += this.gravity; // Ajouter l'accélération due à la gravité

        // Passer à l'animation de chute si nécessaire
        if (this.velocityY > 0 && !this.isFalling) {
          this.isFalling = true;
          this.setAnimation("fallingDown");
        }

        // Stopper le saut si le personnage touche le sol
        if (this.character.y >= this.groundY) {
          this.character.y = this.groundY;
          this.isJumping = false;
          this.isFalling = false;
          this.setAnimation("idle");
        }
      }
    }
  }
}
