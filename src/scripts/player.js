import * as PIXI from "pixi.js";

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
            this.groundY = 550;
            this.keys = {};
            this.animations = {};
            this.currentState = 'idle';
            this.movingLeft = false;
            this.movingRight = false;
            this.health = 100;
            this.maxHealth = 100;
            this.projectiles = [];
            this.canShoot = true;
            this.shootCooldown = 300; // Délai entre chaque tir (en millisecondes)
            this.projectileSpeed = 10;
            this.projectileSize = 5;

    this.character = null;
    this.setUpControls();
    (async () => {
      await this.chargePlayer();
    })();
  }

  async chargePlayer() {
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
    this.animations.attackingIdle = await this.loadFrame("src/Assets/Character/Hero/PNG/PNG Sequences/Slashing/0_Fallen_Angels_Slashing_", 12);
    this.animations.attackingRunning = await this.loadFrame("src/Assets/Character/Hero/PNG/PNG Sequences/Run Slashing/0_Fallen_Angels_Run Slashing_", 12);
    this.animations.attackingInTheAir = await this.loadFrame("src/Assets/Character/Hero/PNG/PNG Sequences/Slashing in The Air/0_Fallen_Angels_Slashing in The Air_", 12);

    this.character = new PIXI.AnimatedSprite(this.animations.idle);
    this.character.width = 150;
    this.character.height = 150;

    this.character.animationSpeed = 0.2;
    this.character.play();

    this.character.anchor.set(0.5, 0.5);

    this.character.x = 20;
    this.character.y = this.groundY;

    this.healthBar = new PIXI.Graphics();
    // Position par rapport au personnage
    this.healthBar.position.x = this.character.x;
    this.healthBar.position.y = this.character.y - 100; // Au-dessus du personnage
    
    this.container.addChild(this.character);
    this.container.addChild(this.healthBar);
    
    this.updateHealthBar(); // Mise à jour initiale

    this.container.addChild(this.character);

  }

  updateHealthBar() {
    const barWidth = 250;
    const barHeight = 10;
    const healthPercentage = Math.max(0, this.health / this.maxHealth);

    // Efface les graphiques précédents
    this.healthBar.clear();

    // Met à jour la position de la barre pour suivre le joueur
    this.healthBar.position.set(barWidth + 250, 30);

    // Fond de la barre (gris)
    this.healthBar
        .rect(-barWidth / 2, 0, barWidth, barHeight) // Définir le rectangle
        .fill(0x333333); // Appliquer le remplissage gris

    // Barre de santé (rouge ou vert selon le pourcentage)
    const fillColor = healthPercentage > 0.5 ? 0x00ff00 : 0xff0000;
    this.healthBar
        .rect(-barWidth / 2, 0, barWidth * healthPercentage, barHeight) // Définir la taille en fonction du pourcentage
        .fill(fillColor); // Appliquer le remplissage
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

  setAnimationSpeed(speed) {
    if (this.character) {
        this.character.animationSpeed = speed;
    }
}

createProjectile() {
    if (!this.canShoot) return;

    // Créez une nouvelle instance de Graphics
    const projectile = new PIXI.Graphics()
        .rect(0, 0, 30, 30)
        .fill(0xff0000);

    // Position initiale du projectile
    projectile.x = this.character.x;
    projectile.y = this.character.y;

    // Direction du projectile basée sur l'orientation du personnage
    projectile.direction = this.character.scale.x > 0 ? 1 : -1;

    // Ajoutez le projectile à la liste et à la scène
    this.projectiles.push(projectile);
    this.container.addChild(projectile);

    // Gérez le délai entre les tirs
    this.canShoot = false;
    setTimeout(() => {
        this.canShoot = true;
    }, this.shootCooldown);
}


  // Nouvelle méthode pour mettre à jour les projectiles
  updateProjectiles() {
    for (let i = this.projectiles.length - 1; i >= 0; i--) {
      const projectile = this.projectiles[i];
      projectile.x += this.projectileSpeed * projectile.direction;

      // Supprimer les projectiles hors écran
      if (
        projectile.x > window.innerWidth + 50 ||
        projectile.x < -50
      ) {
        this.container.removeChild(projectile);
        this.projectiles.splice(i, 1);
      }
    }
  }


setUpControls() {
  window.addEventListener("keydown", (event) => {
      this.keys[event.key] = true;

      if ((event.key === "ArrowUp" || event.key === "w") && !this.isJumping) {
          this.isJumping = true;
          this.velocityY = -this.jumpSpeed;
          if (!this.isAttacking) {
              this.setAnimation("jumping");
              this.setAnimationSpeed(0.2); // Vitesse par défaut pour le saut
          }
      }
      if (event.key === "f" || event.key === "F") {
        this.createProjectile();
    }

      // Détection de l'attaque (barre d'espace)
      if (event.key === " " && !this.isAttacking) {
          this.isAttacking = true;

          // Augmenter la vitesse d'animation pour les attaques
          this.setAnimationSpeed(0.3); // Ajustez cette valeur pour accélérer les attaques

          // Sélection de l'animation d'attaque en fonction de l'état
          if (this.isJumping) {
              this.setAnimation("attackingInTheAir");
          } else if (this.movingLeft || this.movingRight) {
              this.setAnimation("attackingRunning");
          } else {
              this.setAnimation("attackingIdle");
          }

          // Temporisation pour désactiver l'attaque
          setTimeout(() => {
              this.isAttacking = false;

              // Retour à la vitesse normale et à l'animation appropriée
              this.setAnimationSpeed(0.2); // Réinitialisez à la vitesse normale
              if (this.isJumping) {
                  this.setAnimation("jumping");
              } else if (this.movingLeft || this.movingRight) {
                  this.setAnimation("running");
              } else {
                  this.setAnimation("idle");
              }
          }, 500); // Durée de l'animation d'attaque
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
        this.character.gotoAndPlay(0); // Redémarre l'animation
    }
  }

  checkCollisionsWithEnemies(enemies) {
    if (!this.character || this.health <= 0) return;

    const playerBounds = this.character.getBounds();

    enemies.forEach((enemy) => {
        if (enemy.dead) return; // Ignorer les ennemis morts

        const enemyBounds = enemy.enemy.getBounds();

        // Détection de collision
        if (
            playerBounds.x < enemyBounds.x + enemyBounds.width &&
            playerBounds.x + playerBounds.width > enemyBounds.x &&
            playerBounds.y < enemyBounds.y + enemyBounds.height &&
            playerBounds.y + playerBounds.height > enemyBounds.y
        ) {
            console.log("Collision avec un ennemi détectée !");
            
            // Appliquer les conséquences
            this.takeDamage(10); // Exemple : réduire la santé du joueur de 10
            enemy.takeDamage(5); // Exemple : réduire la santé de l'ennemi de 5
        }
    });
}

// Réduit la santé du joueur
takeDamage(amount) {
    this.health -= amount;
    console.log(`Le joueur prend ${amount} de dégâts ! Santé restante : ${this.health}`);
    this.updateHealthBar();

    if (this.health <= 0) {
        console.log("Le joueur est mort !");
        // Gérer la mort du joueur ici (exemple : fin du jeu)
    }
}




  update() {
    if (this.character) {
        // Largeur réelle de l'écran
        const screenWidth = window.innerWidth;

        // Déplacement horizontal
        if (this.keys['ArrowLeft'] || this.keys['a']) {
            // Si le joueur atteint le bord gauche, on bloque sa position
            if (this.character.x - this.character.width / 2 > 0) {
                this.character.x -= this.speed;
            } else {
                this.character.x = this.character.width / 2; // Bloqué à gauche
            }

            if (this.character.scale.x > 0) {
                this.character.scale.x *= -1; // Inverser l'orientation
            }

            this.movingLeft = true;
            this.movingRight = false;

            // Animation correcte
            if (this.isAttacking) {
                this.setAnimation('attackingRunning');
            } else if (!this.isJumping) {
                this.setAnimation('running');
            }
        } else if (this.keys['ArrowRight'] || this.keys['d']) {
            // Si le joueur atteint le bord droit, on bloque sa position
            if (this.character.x + this.character.width / 2 < screenWidth) {
                this.character.x += this.speed;
            } else {
                this.character.x = screenWidth - this.character.width / 2; // Bloqué à droite
            }

            if (this.character.scale.x < 0) {
                this.character.scale.x *= -1; // Inverser l'orientation
            }

            this.movingRight = true;
            this.movingLeft = false;

            // Animation correcte
            if (this.isAttacking) {
                this.setAnimation('attackingRunning');
            } else if (!this.isJumping) {
                this.setAnimation('running');
            }
        } else {
            // Pas de mouvement horizontal
            this.movingLeft = false;
            this.movingRight = false;

            if (!this.isJumping && !this.isAttacking && this.currentState !== 'idle') {
                this.setAnimation('idle');
            }
        }

        // Gestion du saut
        if (this.isJumping) {
            this.character.y += this.velocityY; // Appliquer la gravité
            this.velocityY += this.gravity; // Ajouter l'accélération due à la gravité

            if (this.velocityY > 0 && !this.isFalling) {
                this.isFalling = true;
                if (!this.isAttacking) this.setAnimation("fallingDown");
            }

            // Empêche le personnage de dépasser le bas de l'écran
            if (this.character.y >= this.groundY) {
                this.character.y = this.groundY;
                this.isJumping = false;
                this.isFalling = false;

                if (!this.isAttacking) {
                    this.setAnimation("idle");
                }
            }

            // Empêche le personnage de dépasser le haut de l'écran
            if (this.character.y - this.character.height / 2 < 0) {
                this.character.y = this.character.height / 2;
                this.velocityY = 0; // Stoppe le mouvement vertical
            }
        }

        // Mise à jour de la barre de santé
        this.updateHealthBar();
        this.updateProjectiles();
        
    }
}
}


 