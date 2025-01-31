import * as PIXI from 'pixi.js';
import { getGroundYAtX } from './utils/getGroundYAtX.js';
import { App } from './app.js';


/**
 * @fileoverview Ce fichier définit la classe Player pour le jeu.
 * Il gère les animations, le mouvement, les sauts, les attaques,
 * la gestion de la vie et les collisions avec les ennemis.
 * Le joueur peut se déplacer, sauter, attaquer et subir des dégâts.
 * @author Arthur Jaquier
 * @date 31.01.2025
 */

export class Player {
  constructor() {
    this.container = new PIXI.Container(); // Conteneur pour gérer le joueur
    this.container.interactive = true;
    this.speed = 5;
    this.jumpSpeed = 10;
    this.gravity = 0.5;
    this.isJumping = false;
    this.isFalling = false;
    this.velocityY = 0;
    this.groundY = 0;
    this.keys = {}; // Stocke l'état des touches
    this.animations = {}; // Contient les différentes animations du joueur
    this.currentState = 'idle'; // État par défaut du joueur (inactif)
    this.movingLeft = false;
    this.movingRight = false;
    this.health = 300;
    this.maxHealth = 300;

    this.character = null;
    this.setUpControls();
    (async () => {
      await this.chargePlayer();
    })();
  }
  // Chargement des animations
  async chargePlayer() {
    this.animations.idle = await this.loadFrame(
      'src/Assets/Character/Hero/PNG/PNG Sequences/Idle/0_Fallen_Angels_Idle_',
      18
    );
    this.animations.walking = await this.loadFrame(
      'src/Assets/Character/Hero/PNG/PNG Sequences/Walking/0_Fallen_Angels_Walking_',
      24
    );
    this.animations.running = await this.loadFrame(
      'src/Assets/Character/Hero/PNG/PNG Sequences/Running/0_Fallen_Angels_Running_',
      12
    );
    this.animations.jumping = await this.loadFrame(
      'src/Assets/Character/Hero/PNG/PNG Sequences/Jump Start/0_Fallen_Angels_Jump Start_',
      6
    );
    this.animations.fallingDown = await this.loadFrame(
      'src/Assets/Character/Hero/PNG/PNG Sequences/Falling Down/0_Fallen_Angels_Falling Down_',
      6
    );
    this.animations.attackingIdle = await this.loadFrame(
      'src/Assets/Character/Hero/PNG/PNG Sequences/Slashing/0_Fallen_Angels_Slashing_',
      12
    );
    this.animations.attackingRunning = await this.loadFrame(
      'src/Assets/Character/Hero/PNG/PNG Sequences/Run Slashing/0_Fallen_Angels_Run Slashing_',
      12
    );
    this.animations.attackingInTheAir = await this.loadFrame(
      'src/Assets/Character/Hero/PNG/PNG Sequences/Slashing in The Air/0_Fallen_Angels_Slashing in The Air_',
      12
    );
    // Charge le son pour l'attaque
    let attackSound = new Audio('src/Sounds/SWSH_Whoosh 4 (ID 1796)_LS.mp3');

    // Event listener pour détecter l'appui sur la barre d'espace
    document.addEventListener('keydown', (event) => {
      if (event.code === 'Space') {
        attackSound.currentTime = 0; // Revenir au début du son
        attackSound.play();
      }
    });
    this.character = new PIXI.AnimatedSprite(this.animations.idle);
    this.character.width = 150;
    this.character.height = 150;

    this.character.animationSpeed = 0.2;
    this.character.play();

    this.character.anchor.set(0.5, 0.5);

    this.character.x = window.innerWidth / 2;
    this.character.y = this.groundY;

    // Initialisation de la barre de vie
    this.healthBar = new PIXI.Graphics();
    this.healthBar.position.x = this.character.x;
    this.healthBar.position.y = this.character.y - 100;
    this.container.addChild(this.character);
    this.container.addChild(this.healthBar);
    this.updateHealthBar(); 
    this.container.addChild(this.character);
  }

  updateHealthBar() {
    const barWidth = 250;
    const barHeight = 10;
    const healthPercentage = Math.max(0, this.health / this.maxHealth);

    // Efface l'ancienne barre et redessine la nouvelle
    this.healthBar.clear();
    this.healthBar.position.set(barWidth + 250, 30);

    // Fond de la barre de vie
    this.healthBar.rect(-barWidth / 2, 0, barWidth, barHeight).fill(0x333333);

    // Barre de santé (rouge ou vert selon le pourcentage)
    const fillColor = healthPercentage > 0.5 ? 0x00ff00 : 0xff0000;
    this.healthBar
      .rect(-barWidth / 2, 0, barWidth * healthPercentage, barHeight) // Définir la taille en fonction du pourcentage
      .fill(fillColor); // Appliquer le remplissage
  }

  // Charge les images d'une animation
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

  setAnimationSpeed(speed) {
    if (this.character) {
      this.character.animationSpeed = speed;
    }
  }

  //Gestion des touches
  setUpControls() {
    window.addEventListener('keydown', (event) => {
      this.keys[event.key] = true;

      if ((event.key === 'ArrowUp' || event.key === 'w') && !this.isJumping) {
        this.isJumping = true;
        this.velocityY = -this.jumpSpeed;

        const jumpSound = document.getElementById('jumpSound');
        jumpSound.currentTime = 0;
        jumpSound.volume = 0.3;
        jumpSound.play();

        if (!this.isAttacking) {
          this.setAnimation('jumping');
          this.setAnimationSpeed(0.2); // Vitesse par défaut pour le saut
        }
      }

      // Gestion de l'attaque
      if (event.key === ' ' && !this.isAttacking) {
        this.isAttacking = true;
        this.setAnimationSpeed(0.3);

        if (this.isJumping) {
          this.setAnimation('attackingInTheAir');
        } else if (this.movingLeft || this.movingRight) {
          this.setAnimation('attackingRunning');
        } else {
          this.setAnimation('attackingIdle');
        }

        // Temporisation pour désactiver l'attaque
        setTimeout(() => {
          this.isAttacking = false;

          this.setAnimationSpeed(0.2); // Réinitialisez à la vitesse normale
          if (this .isJumping) {
            this.setAnimation('jumping');
          } else if (this.movingLeft || this.movingRight) {
            this.setAnimation('running');
          } else {
            this.setAnimation('idle');
          }
        }, 500); // Durée de l'attaque
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
      this.character.gotoAndPlay(0); // Redémarre l'animation
    }
  }

  checkCollisionsWithEnemies(enemies) {
    if (!this.character || this.health <= 0) return;

    const playerBounds = this.character.getBounds();
    const isAttacking = this.isAttacking; // État d'attaque du joueur

    enemies.forEach((enemy) => {
      // Vérifier que enemy existe et n'est pas mort
      if (!enemy || enemy.dead) return;

      // Vérifier que enemy.enemy existe avant d'appeler getBounds
      if (!enemy.enemy) return;

      try {
        const enemyBounds = enemy.enemy.getBounds();

        // Détection de collision
        if (this.checkOverlap(playerBounds, enemyBounds)) {
          if (isAttacking) {
            enemy.takeDamage(2);
          }
        }
      } catch (error) {
        console.error('Erreur lors de la vérification des collisions :', error);
        console.log('Enemy state:', enemy);
      }
    });
  }

  // Vérification de la collision entre les bords du joueur et de l'ennemi
  checkOverlap(bounds1, bounds2) {
    return (
      bounds1.x < bounds2.x + bounds2.width &&
      bounds1.x + bounds1.width > bounds2.x &&
      bounds1.y < bounds2.y + bounds2.height &&
      bounds1.y + bounds1.height > bounds2.y
    );
  }

  makeInvulnerable() {
    this.isInvulnerable = true;
    const blinkInterval = setInterval(() => {
      this.character.alpha = this.character.alpha === 1 ? 0.5 : 1;
    }, 100);

    // Fin de l'invulnérabilité après 1.5 secondes
    setTimeout(() => {
      this.isInvulnerable = false;
      clearInterval(blinkInterval);
      this.character.alpha = 1;
    }, 1500);
  }

  applyKnockback(direction) {
    const knockbackForce = 2;
    const knockbackY = -2; // Petit saut lors du knockback

    this.character.x += direction * knockbackForce;
    if (this.isGrounded) {
      this.velocityY = knockbackY;
      this.isJumping = true;
    }
  }

  takeDamage(amount) {
    this.health -= amount;
    console.log(
      `Le joueur prend ${amount} de dégâts ! Santé restante : ${this.health}`
    );
    this.updateHealthBar();
    // Jouer le son des dégâts
    let damageSound = document.getElementById('damage-sound');
    damageSound.currentTime = 0;
    damageSound.volume = 0.5;
    damageSound.play();
    if (this.health <= 0) {
      console.log('Le joueur est mort !');
      App.app.destroy();
      window.location.reload();
    }
  }

  // Met à jour l'état du joueur à chaque frame : gestion des mouvements, du saut et des animations.
  update(backgroundGround) {
    if (this.character) {
      const screenWidth = window.innerWidth;

      // Déplacement horizontal
      if (this.keys['ArrowLeft'] || this.keys['a']) {
        if (this.character.x - this.character.width / 2 > 0) {
          this.character.x -= this.speed;
        } else {
          this.character.x = this.character.width / 2;
        }

        if (this.character.scale.x > 0) {
          this.character.scale.x *= -1; // Inverser l'orientation
        }
        // Gestion des animations : mouvement ou attaque
        this.movingLeft = true;
        this.movingRight = false;
        if (this.isAttacking) {
          this.setAnimation('attackingRunning');
        } else if (!this.isJumping) {
          this.setAnimation('running');
        }
      } else if (this.keys['ArrowRight'] || this.keys['d']) {
        if (this.character.x + this.character.width / 2 < screenWidth) {
          this.character.x += this.speed;
        } else {
          this.character.x = screenWidth - this.character.width / 2;
        }
        if (this.character.scale.x < 0) {
          this.character.scale.x *= -1; // Inverser l'orientation
        }

        this.movingRight = true;
        this.movingLeft = false;
        if (this.isAttacking) {
          this.setAnimation('attackingRunning');
        } else if (!this.isJumping) {
          this.setAnimation('running');
        }
      } else {
        // Pas de mouvement horizontal
        this.movingLeft = false;
        this.movingRight = false;

        if (
          !this.isJumping &&
          !this.isAttacking &&
          this.currentState !== 'idle'
        ) {
          this.setAnimation('idle');
        }

        if (this.isAttacking) {
          this.setAnimation('attackingRunning');
        } else if (!this.isJumping) {
          this.setAnimation('running');
        }
      }

      // Gestion du saut
      if (this.isJumping) {
        this.character.y += this.velocityY; // Appliquer la gravité
        this.velocityY += this.gravity;

        if (this.velocityY > 0 && !this.isFalling) {
          this.isFalling = true;
          if (!this.isAttacking) this.setAnimation('fallingDown');
        }

        if (this.character.y >= this.groundY) {
          this.character.y = this.groundY;
          this.isJumping = false;
          this.isFalling = false;

          if (!this.isAttacking) {
            this.setAnimation('idle');
          }
        }
        this.updateHealthBar();
      } else {
        this.groundY =
          getGroundYAtX(backgroundGround, this.character.x) -
          this.character.height +
          70;
        this.character.y = this.groundY;
      }

      this.updateHealthBar();
    }
  }
}
