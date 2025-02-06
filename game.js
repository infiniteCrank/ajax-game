window.onload = function () {
  class AjaxGame extends Phaser.Scene {
    constructor() {
      super({ key: "AjaxGame" });
      this.score = 0; // Initialize score
      this.level = 1;
      this.lives = 3;
    }

    preload() {
      this.load.image('sky', 'assets/bg.png'); // Background
      this.load.image('ground', 'assets/platform_real.png'); // Ground
      this.load.image('wand', 'assets/wand.png'); // Star collectible
      this.load.image('winWand', 'assets/win_wand.png'); // Star collectible
      this.load.spritesheet('dude', 'assets/ajax_idle_run.png', { frameWidth: 100, frameHeight: 100 }); // Player sprite
      this.load.spritesheet('dudeWin', 'assets/ajax_win.png', { frameWidth: 100, frameHeight: 100 }); // Player sprite
      this.load.spritesheet('dudeJump', 'assets/ajax_jump.png', { frameWidth: 100, frameHeight: 100 }); // Player sprite
      // Load button images
      this.load.image('leftButton', 'assets/left.png'); // Left button image
      this.load.image('rightButton', 'assets/right.png'); // Right button image
      this.load.image('jumpButton', 'assets/jump.png'); // Jump button image
      //obsticals 
      this.load.image('ramp', 'assets/ramp.png'); // Jump button image

      this.load.audio('collectSound', 'assets/bubble_game_sfx_wandcollection.mp3');
      this.load.audio('jumpSound', 'assets/bubble_game_sfx_jump.mp3');
      this.load.audio('backgroundMusic', 'assets/bubble_game_music_floatonby_v02.mp3');
    }

    create() {
      // Play the background music on loop
      this.music = this.sound.add('backgroundMusic', { loop: true });
      this.music.play();
      this.add.image(400, 300, 'sky');
      this.ramps = [];
      this.ground = [];
      this.ground.push(this.matter.add.sprite(300, 1000, 'ground').setStatic(true).setScale(1));
      this.ground.push(this.matter.add.sprite(500, 850, 'ground').setStatic(true).setScale(1));
      this.ground.push(this.matter.add.sprite(700, 700, 'ground').setStatic(true).setScale(1));
      this.ground.push(this.matter.add.sprite(900, 550, 'ground').setStatic(true).setScale(1));
      this.wand = this.matter.add.sprite(800, 400, 'wand').setStatic(true).setScale(1);

      // Define animations for the player
      this.anims.create({
        key: 'run-left',
        frames: this.anims.generateFrameNames('dude', { start: 0, end: 1 }),
        frameRate: 5,
        repeat: -1 // Repeat indefinitely
      });

      this.anims.create({
        key: 'run-right',
        frames: this.anims.generateFrameNames('dude', { start: 0, end: 1 }),
        frameRate: 5,
        repeat: -1
      });

      this.anims.create({
        key: 'idle',
        frames: [{ key: 'dude', frame: 2 }], // The idle frame is the third frame
        frameRate: 10
      });

      this.anims.create({
        key: 'win',
        frames: [{ key: 'dudeWin', frame: 0 }],
        frameRate: 10
      });

      // Define animations for the player
      this.anims.create({
        key: 'jump',
        frames: this.anims.generateFrameNames('dudeJump', { start: 0, end: 1 }),
        frameRate: 2,
        repeat: -1 // Repeat indefinitely
      });

      // Add the player
      this.player = this.matter.add.sprite(200, 450, 'dude').play('idle');
      this.player.setBounce(0.9);

      // Initialize score text
      this.scoreText = this.add.text(16, 16, 'Score: 0', {
        fontSize: '32px',
        fill: '#ffffff'
      });

      // Initialize score text
      this.levelText = this.add.text(200, 16, 'Level: 1', {
        fontSize: '32px',
        fill: '#ffffff'
      });

      // Initialize lives text
      this.lifeText = this.add.text(400, 16, 'Lives: 3', {
        fontSize: '32px',
        fill: '#ffffff'
      });

      // Create on-screen controls using images
      const leftButton = this.matter.add.sprite(100, 1200, 'leftButton').setInteractive().setStatic(true);
      const rightButton = this.matter.add.sprite(800, 1200, 'rightButton').setInteractive().setStatic(true);
      const jumpButton = this.matter.add.sprite(250, 1200, 'jumpButton').setInteractive().setStatic(true);
      leftButton.on('pointerdown', () => {
        this.player.setVelocityX(-5);
      });
      leftButton.on('pointerup', () => {
        this.player.setVelocityX(0);
      });

      rightButton.on('pointerdown', () => {
        this.player.setVelocityX(5);
      });
      rightButton.on('pointerup', () => {
        this.player.setVelocityX(0);
      });

      jumpButton.on('pointerdown', () => {
        this.jump()
      });

      // Player movement controls
      this.input.keyboard.on('keydown-LEFT', () => {
        this.player.setVelocityX(-5);
      });
      this.input.keyboard.on('keyup-LEFT', () => {
        if (this.player.body.velocity.x < 0) {
          this.player.setVelocityX(0);
        }
      });
      this.input.keyboard.on('keydown-RIGHT', () => {
        this.player.setVelocityX(5);
      });
      this.input.keyboard.on('keyup-RIGHT', () => {
        if (this.player.body.velocity.x > 0) {
          this.player.setVelocityX(0);
        }
      });
      // Input handling
      this.input.keyboard.on('keydown-SPACE', this.jump, this);

      // Add collision detection with the ground
      this.matter.world.on('collisionstart', event => {
        event.pairs.forEach(pair => {
          if (pair.bodyA === this.player.body || pair.bodyB === this.player.body) {
            this.isOnGround = true; // Player is on a platform
          }
          // Check for wand collection
          if ((pair.bodyA === this.player.body && pair.bodyB === this.wand.body) ||
            (pair.bodyB === this.player.body && pair.bodyA === this.wand.body)) {
            this.collectWand(); // Call function to collect wand
            this.level++
            this.nextLevel()
          }

          // Check for collision with winWand
          if (this.winWand) {
            if ((pair.bodyA === this.player.body && pair.bodyB === this.winWand.body) ||
              (pair.bodyB === this.player.body && pair.bodyA === this.winWand.body)) {
              this.music.stop();
              this.scene.start('VictoryScreen'); // Transition to victory scene
            }
          }
        });
      });

      this.matter.world.on('collisionend', event => {
        event.pairs.forEach(pair => {
          if (pair.bodyA === this.player.body || pair.bodyB === this.player.body) {
            this.isOnGround = false; // Player is not on a platform
          }
        });
      });
    }

    update() {
      // Check if player falls below y = height of the game
      if (this.player.y > this.game.config.height) {
        this.lives -= 1; // Subtract a life
        this.lifeText.setText('Lives: ' + this.lives); // Update lives display
        this.player.setPosition(200, 450); // Reset player position

        // Check if out of lives
        if (this.lives <= 0) {
          console.log('Game Over'); // Handle game over here
          this.lives = 3;
          this.level = 1;
          this.score = 0;
          this.music.stop();
          this.scene.start('GameOverScreen'); // Transition to game over scene
        }
      }

      // Update player animation based on velocity
      if (!this.isOnGround) {
        // Player is in the air, so the jump animation has already been played
        return; // Don't change the animation
      }

      if (this.player.body.velocity.x < 0) {
        this.player.play('run-left', true); // Play left run animation when moving left
      } else if (this.player.body.velocity.x > 0) {
        this.player.play('run-right', true); // Play right run animation when moving right (you'll need to create this animation too)
      } else {
        this.player.play('idle', true); // Play idle animation when not moving
      }
    }

    jump() {
      if (this.isOnGround) { // Check if the player is on the ground before jumping
        this.player.setVelocityY(-11); // Jump strength
        this.player.play('jump', true); // Play jump animation
        this.isOnGround = false; // Set this to false immediately upon jumping
        const sound = this.sound.add('jumpSound');
        sound.play();
      }
    }

    // Function to collect the wand
    collectWand() {
      this.player.play('win', true);
      this.wand.destroy();
      this.score += 10; // Update the score
      this.scoreText.setText('Score: ' + this.score); // Update displayed score
      console.log('Score:', this.score); // Output score to console
      const sound = this.sound.add('collectSound');
      sound.play();
    }

    nextLevel() {
      // Remove all ground platforms
      this.ground.forEach(platform => {
        platform.destroy();
      });
      this.ground = []; // Clear the ground array as platforms are destroyed

      const level = this.level;
      this.levelText.setText('Level: ' + this.level); // Update displayed score
      switch (level) {
        case 2:
          console.log('got to level 2');
          this.ground.push(this.matter.add.sprite(500, 850, 'ground').setStatic(true).setScale(1));

          //*********************************** 
          // ramp code :(((((||||||))))):
          // ***********************************/

          // Define the vertices for the ramp's right triangle shape
          const rampVertices = [
            { x: 450, y: 300 },      // Top Left
            { x: 0, y: 500 }, // Bottom Left
            { x: 450, y: 500 }  // Bottom Right
          ];

          // Create the ramp with a custom shape
          const rampBody = this.matter.bodies.fromVertices(350, 750, rampVertices, {
            isStatic: true,
            friction: 0.8, // Adjust friction as necessary
          });

          // Add the custom ramp body to the world
          this.matter.world.add(rampBody);
          this.ramps.push(rampBody); // Store the ramp body if needed

          // Draw the ramp using Phaser's graphics
          const graphics = this.add.graphics();
          graphics.fillStyle(0xF56FFF); // Green color to fill the triangle
          graphics.beginPath();

          // Move to the first vertex and draw the triangle
          graphics.moveTo(rampVertices[0].x + 50, rampVertices[0].y + 310); //top 
          graphics.lineTo(rampVertices[1].x + 50, rampVertices[1].y + 310); //bl
          graphics.lineTo(rampVertices[2].x + 50, rampVertices[2].y + 310); //br
          graphics.closePath();
          graphics.fillPath();

          //************************************************* */
          this.wand = this.matter.add.sprite(100, 750, 'wand').setStatic(true).setScale(1);

          break;

        case 3:
          console.log('got to level 3');
          this.ground.push(this.matter.add.sprite(900, 600, 'ground').setStatic(true).setScale(1));
          this.wand = this.matter.add.sprite(800, 450, 'wand').setStatic(true).setScale(1);
          break;
        case 4:
          console.log('got to level 4');
          this.ground.push(this.matter.add.sprite(700, 900, 'ground').setStatic(true).setScale(1));
          this.winWand = this.matter.add.sprite(100, 750, 'winWand').setStatic(true).setScale(1);
          break;
        default:
          console.log('hit default');
          this.ground.push(this.matter.add.sprite(700, 900, 'ground').setStatic(true).setScale(1));
          break;
      }
    }

  }

  class TitleScreen extends Phaser.Scene {
    constructor() {
      super({ key: "TitleScreen" });
    }

    preload() {
      this.load.image('titleBackground', 'assets/start_screen_base.png'); // Background for title screen
      this.load.image('startButton', 'assets/start.png'); // Start button
      this.load.image('creditsButton', 'assets/credits.png'); // Start button
    }

    create() {
      // Add background
      this.add.image(450, 800, 'titleBackground');


      // Create start button
      const startButton = this.add.sprite(420, 600, 'startButton').setInteractive();

      // Handle button click to start the game
      startButton.on('pointerdown', () => {
        this.scene.start('AjaxGame'); // Switch to the game scene
      });

      // Adjust pointer feedback
      startButton.on('pointerover', () => {
        startButton.setTint(0x78c457); // Change color on hover
      });
      startButton.on('pointerout', () => {
        startButton.clearTint(); // Reset color when no longer hovering
      });

      // Create credit button
      const creditsButton = this.add.sprite(420, 800, 'creditsButton').setInteractive();
      // Handle button click to show credits
      creditsButton.on('pointerdown', () => {
        this.scene.start('CreditsScreen'); // Switch to the credits scene
      });

      // Adjust pointer feedback
      creditsButton.on('pointerover', () => {
        creditsButton.setTint(0x78c457); // Change color on hover
      });
      creditsButton.on('pointerout', () => {
        creditsButton.clearTint(); // Reset color when no longer hovering
      });
    }
  }

  class CreditsScreen extends Phaser.Scene {
    constructor() {
      super({ key: "CreditsScreen" });
    }

    preload() {
      this.load.image('creditsBackground', 'assets/credits_page.png'); // Load your credits background image
      this.load.image('backButton', 'assets/back_arrow.png'); // Start button
    }

    create() {
      this.add.image(450, 810, 'creditsBackground'); // Add background image for credits

      // Create start button
      const backButton = this.add.sprite(150, 1200, 'backButton').setInteractive();

      // Handle button click to start the game
      backButton.on('pointerdown', () => {
        this.scene.start('TitleScreen'); // Switch to the game scene
      });

    }
  }

  class VictoryScreen extends Phaser.Scene {
    constructor() {
      super({ key: "VictoryScreen" });
    }

    preload() {
      this.load.image('victoryBackground', 'assets/win_screen_base.png'); // Load your victory background image
      this.load.image('restartButton', 'assets/retry.png'); // Restart button
      this.load.audio('victoryMusic', 'assets/bubble_game_music_victory.mp3');
    }

    create() {
      this.music = this.sound.add('victoryMusic', { loop: true });
      this.music.play();
      this.add.image(450, 810, 'victoryBackground'); // Add background image for victory
      // Create start button
      const backButton = this.add.sprite(420, 450, 'restartButton').setInteractive();

      // Handle button click to start the game
      backButton.on('pointerdown', () => {
        this.music.stop();
        this.scene.start('TitleScreen'); // Switch to the game scene
      });

    }
  }

  class GameOverScreen extends Phaser.Scene {
    constructor() {
      super({ key: "GameOverScreen" });
    }

    preload() {
      this.load.image('gameOverBackground', 'assets/death_screen_base.png'); // Load your game over background image
      this.load.image('restartButton', 'assets/retry.png'); // Restart button
      this.load.audio('loseMusic', 'assets/bubble_game_music_death_02.mp3');
    }

    create() {
      this.music = this.sound.add('loseMusic', { loop: true });
      this.music.play();
      this.add.image(450, 810, 'gameOverBackground'); // Add background image for game over

      // Create start button
      const backButton = this.add.sprite(420, 800, 'restartButton').setInteractive();

      // Handle button click to start the game
      backButton.on('pointerdown', () => {
        this.music.stop();
        this.scene.start('TitleScreen'); // Switch to the game scene
      });
    }
  }

  const aspectRatio = 9 / 16; // Setting aspect ratio to 9:16
  const targetWidth = window.innerWidth * 0.9;
  const targetHeight = targetWidth * aspectRatio;

  const config = {
    type: Phaser.AUTO,
    width: targetWidth,
    height: targetHeight,
    scale: {
      mode: Phaser.Scale.FIT,
      autoCenter: Phaser.Scale.CENTER_BOTH,
    },
    parent: "phaser-container",
    dom: {
      createContainer: true,
    },
    physics: {
      default: 'matter',
      matter: {
        debug: {
          showBody: false,       // Show the outlines for the bodies
          showStaticBody: false, // Show outlines for static bodies
          showConvexHulls: false, // Show convex hulls related to bodies
          fillStyle: 'rgb(255, 217, 0)', // Fill color for bodies
          strokeStyle: 'rgba(255,0,0,1)', // Border color for bodies
        }
      }
    },
    scene: [TitleScreen, AjaxGame, CreditsScreen, VictoryScreen, GameOverScreen], // Include both scenes
  };

  // Start the Phaser game
  const game = new Phaser.Game(config);
};

