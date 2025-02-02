window.onload = function () {
  class AjaxGame extends Phaser.Scene {
    constructor() {
      super({ key: "AjaxGame" });
      this.score = 0; // Initialize score
      this.level = 0;
    }

    preload() {
      this.load.image('sky', 'assets/bg.png'); // Background
      this.load.image('ground', 'assets/platform_real.png'); // Ground
      this.load.image('wand', 'assets/wand.png'); // Star collectible
      this.load.spritesheet('dude', 'assets/ajax_idle_run.png', { frameWidth: 100, frameHeight: 100 }); // Player sprite
      // Load button images
      this.load.image('leftButton', 'assets/left.png'); // Left button image
      this.load.image('rightButton', 'assets/right.png'); // Right button image
      this.load.image('jumpButton', 'assets/jump.png'); // Jump button image
      //obsticals 
      this.load.image('ramp', 'assets/ramp.png'); // Jump button image
    }

    create() {
      this.add.image(400, 300, 'sky');

      this.ground = []
      this.ground.push(this.matter.add.sprite(300, 1000, 'ground').setStatic(true).setScale(1));
      this.ground.push(this.matter.add.sprite(500, 850, 'ground').setStatic(true).setScale(1));
      this.ground.push(this.matter.add.sprite(700, 700, 'ground').setStatic(true).setScale(1));
      this.ground.push(this.matter.add.sprite(900, 550, 'ground').setStatic(true).setScale(1));
      this.wand = this.matter.add.sprite(800, 400, 'wand').setStatic(true).setScale(1);

      // Add the player
      this.player = this.matter.add.sprite(200, 450, 'dude');
      this.player.setBounce(1);

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

      // Create on-screen controls using images
      const leftButton = this.matter.add.sprite(50, 1200, 'leftButton').setInteractive().setStatic(true);
      const rightButton = this.matter.add.sprite(800, 1200, 'rightButton').setInteractive().setStatic(true);
      const jumpButton = this.matter.add.sprite(200, 1200, 'jumpButton').setInteractive().setStatic(true);
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

    }

    jump() {
      if (this.isOnGround) { // Check if the player is on the ground before jumping
        this.player.setVelocityY(-11); // Jump strength
      }
    }

    // Function to collect the wand
    collectWand() {
      this.wand.setStatic(false); // Make it non-static to allow for proper control
      this.wand.setVisible(false); // Hide the wand from the scene
      this.wand.body.enable = false; // Disable the body to prevent further collisions
      this.score += 10; // Update the score
      this.scoreText.setText('Score: ' + this.score); // Update displayed score
      console.log('Score:', this.score); // Output score to console
    }


    nextLevel() {
      // Remove all ground platforms
      this.ground.forEach(platform => {
        platform.destroy();
      });
      this.ground = []; // Clear the ground array as platforms are destroyed

      const level = this.level;
      switch (level) {
        case 2:
          console.log('got to level 2');

          break;
        case 3:
          console.log('got to level 3');
          break;
        case 4:
          console.log('got to level 4');
          break;
        default:
          console.log('hit default');
          break;
      }
    }

  }


  const aspectRatio = 16 / 9; // Setting aspect ratio to 16:9
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
      arcade: {
        gravity: { y: 300 },
        debug: false
      }
    },
    scene: AjaxGame,
  };

  // Start the Phaser game
  const game = new Phaser.Game(config);
};

