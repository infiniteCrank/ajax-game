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

      this.platforms = this.physics.add.staticGroup();
      // Adjust these y-coordinates to move platforms down
      this.platforms.create(200, 1600, 'ground').setScale(1).refreshBody();
      this.platforms.create(400, 1450, 'ground').setScale(1).refreshBody();
      this.platforms.create(600, 1300, 'ground').setScale(1).refreshBody();
      this.platforms.create(800, 1150, 'ground').setScale(1).refreshBody();
      this.platforms.create(800, 1150, 'ground').setScale(1).refreshBody();
      this.player = this.physics.add.sprite(100, 1200, 'dude'); // Move player down

      this.player.setBounce(0.5);

      this.physics.add.collider(this.player, this.platforms);
      this.physics.add.collider(this.player, this.ramp);

      const stars = this.physics.add.group({
        key: 'star',
        repeat: 5,
        setXY: { x: 150, y: 0, stepX: 110 }
      });

      stars.children.iterate(star => {
        star.setBounceY(Phaser.Math.FloatBetween(0.4, 0.8));
      });

      this.physics.add.collider(stars, this.platforms);

      // Collision detection between player and stars
      this.physics.add.overlap(this.player, stars, this.collectStar, null, this);

      // Input handling
      this.input.keyboard.on('keydown-LEFT', () => {
        this.player.setVelocityX(-160);
      });

      this.input.keyboard.on('keydown-RIGHT', () => {
        this.player.setVelocityX(160);
      });

      this.input.keyboard.on('keyup-LEFT', () => {
        this.player.setVelocityX(0);
      });

      this.input.keyboard.on('keyup-RIGHT', () => {
        this.player.setVelocityX(0);
      });

      // Jump logic
      this.input.keyboard.on('keydown-UP', () => {
        if (this.player.body.touching.down) { // Ensure the character is on the ground
          this.player.setVelocityY(-330);
        }
      });

      // Create on-screen controls using images
      const leftButton = this.add.sprite(50, 550, 'leftButton').setInteractive();
      const rightButton = this.add.sprite(150, 550, 'rightButton').setInteractive();
      const jumpButton = this.add.sprite(100, 650, 'jumpButton').setInteractive();

      leftButton.on('pointerdown', () => {
        this.player.setVelocityX(-160);
      });
      leftButton.on('pointerup', () => {
        this.player.setVelocityX(0);
      });

      rightButton.on('pointerdown', () => {
        this.player.setVelocityX(160);
      });
      rightButton.on('pointerup', () => {
        this.player.setVelocityX(0);
      });

      jumpButton.on('pointerdown', () => {
        if (this.player.body.touching.down) { // Ensure the character is on the ground
          this.player.setVelocityY(-330);
        }
      });

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

    update() {
      // Find the player's current position
      const playerY = this.player.body.position.y;

      // Retrieve all static bodies from the platforms group
      const staticBodies = this.platforms.getChildren(); // Get all platforms

      let highestPlatformY = Number.MAX_VALUE;
      let highestPlatform = null;

      // Iterate through all platforms to find the highest platform
      staticBodies.forEach(platform => {
        const platformY = platform.y; // Access the gameObject's y position
        if (platformY < highestPlatformY) {
          highestPlatformY = platformY;
          highestPlatform = platform; // Keep track of the highest platform
        }
      });

      // If the player has reached the highest platform
      if (playerY < highestPlatformY - 300) {
        // Move the highest platform down to the bottom of the screen
        if (highestPlatform.y != this.sys.game.config.height) {
          highestPlatform.y = this.sys.game.config.height; // Set y coordinate to the bottom
          highestPlatform.refreshBody(); // Refresh the body to apply changes
          this.level++
          this.levelText.setText('Level: ' + this.level); // Update displayed score
          this.nextLevel()
        }
        // Remove all platforms except the highest platform
        staticBodies.forEach(platform => {
          if (platform !== highestPlatform) {
            platform.destroy(); // Destroy other platforms
          }
        });

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
      default: 'arcade',
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

