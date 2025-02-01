window.onload = function () {
  class AjaxGame extends Phaser.Scene {
    constructor() {
      super({ key: "AjaxGame" });
      this.score = 0; // Initialize score
    }

    preload() {
      this.load.image('sky', 'assets/Back_City.png'); // Background
      this.load.image('ground', 'assets/Platform.png'); // Ground
      this.load.image('star', 'assets/coin.png'); // Star collectible
      this.load.spritesheet('dude', 'assets/girl.jpeg', { frameWidth: 50, frameHeight: 50 }); // Player sprite
      // Load button images
      this.load.image('leftButton', 'assets/left.png'); // Left button image
      this.load.image('rightButton', 'assets/right.png'); // Right button image
      this.load.image('jumpButton', 'assets/jump.png'); // Jump button image
    }

    create() {
      this.add.image(400, 300, 'sky');

      const platforms = this.physics.add.staticGroup();
      // Adjust these y-coordinates to move platforms down
      platforms.create(200, 1600, 'ground').setScale(1).refreshBody();
      platforms.create(400, 1450, 'ground').setScale(1).refreshBody();
      platforms.create(600, 1200, 'ground').setScale(1).refreshBody();
      platforms.create(800, 1150, 'ground').setScale(1).refreshBody();
      platforms.create(1000, 1000, 'ground').setScale(1).refreshBody();

      const player = this.physics.add.sprite(100, 600, 'dude'); // Move player down

      player.setBounce(0.5);
      //player.setCollideWorldBounds(true);

      this.physics.add.collider(player, platforms);

      const stars = this.physics.add.group({
        key: 'star',
        repeat: 5,
        setXY: { x: 150, y: 0, stepX: 110 }
      });

      stars.children.iterate(star => {
        star.setBounceY(Phaser.Math.FloatBetween(0.4, 0.8));
      });

      this.physics.add.collider(stars, platforms);

      // Collision detection between player and stars
      this.physics.add.overlap(player, stars, this.collectStar, null, this);

      // Input handling
      this.input.keyboard.on('keydown-LEFT', () => {
        player.setVelocityX(-160);
      });

      this.input.keyboard.on('keydown-RIGHT', () => {
        player.setVelocityX(160);
      });

      this.input.keyboard.on('keyup-LEFT', () => {
        player.setVelocityX(0);
      });

      this.input.keyboard.on('keyup-RIGHT', () => {
        player.setVelocityX(0);
      });

      // Jump logic
      this.input.keyboard.on('keydown-UP', () => {
        if (player.body.touching.down) { // Ensure the character is on the ground
          player.setVelocityY(-330);
        }
      });

      // Create on-screen controls using images
      const leftButton = this.add.sprite(50, 550, 'leftButton').setInteractive();
      const rightButton = this.add.sprite(150, 550, 'rightButton').setInteractive();
      const jumpButton = this.add.sprite(100, 650, 'jumpButton').setInteractive();

      leftButton.on('pointerdown', () => {
        player.setVelocityX(-160);
      });
      leftButton.on('pointerup', () => {
        player.setVelocityX(0);
      });

      rightButton.on('pointerdown', () => {
        player.setVelocityX(160);
      });
      rightButton.on('pointerup', () => {
        player.setVelocityX(0);
      });

      jumpButton.on('pointerdown', () => {
        if (player.body.touching.down) { // Ensure the character is on the ground
          player.setVelocityY(-330);
        }
      });
    }

    // Function to collect a star
    collectStar(player, star) {
      if (star.active) { // Check if star is still active
        star.disableBody(true, true); // Remove the star from the scene
        this.score += 10; // Update the score
        console.log('Score:', this.score); // Output score to console
      }
    }

    update() {

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
