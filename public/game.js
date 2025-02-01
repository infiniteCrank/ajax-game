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
      this.load.image('star', 'assets/wand.png'); // Star collectible
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

      this.ground = this.matter.add.sprite(400, 1000, 'ground').setStatic(true).setScale(1);

      // Add the player
      this.player = this.matter.add.sprite(400, 450, 'dude');
      this.player.setBounce(0.2);

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
        this.player.setVelocityY(-10); // Jump strength
      }
    }

    // Function to collect a star
    collectStar(player, star) {
      if (star.active) { // Check if star is still active
        star.disableBody(true, true); // Remove the star from the scene
        this.score += 10; // Update the score
        this.scoreText.setText('Score: ' + this.score); // Update displayed score
        console.log('Score:', this.score); // Output score to console
      }
    }

    nextLevel() {
      const level = this.level;
      switch (level) {
        case 2:
          console.log('got to level 2');
          this.platforms.create(200, 1450, 'ground').setScale(1).refreshBody();
          this.platforms.create(800, 1450, 'ramp').setScale(1).refreshBody()

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

