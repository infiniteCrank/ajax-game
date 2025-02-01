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

    }

    create() {
      this.add.image(400, 300, 'sky');

      const platforms = this.physics.add.staticGroup();
      platforms.create(200, 700, 'ground').setScale(1).refreshBody();
      platforms.create(400, 550, 'ground').setScale(1).refreshBody();
      platforms.create(600, 400, 'ground').setScale(1).refreshBody();
      platforms.create(800, 300, 'ground').setScale(1).refreshBody();
      platforms.create(900, 200, 'ground').setScale(1).refreshBody();

      const player = this.physics.add.sprite(100, 450, 'dude');

      player.setBounce(0.2);
      player.setCollideWorldBounds(true);

      this.physics.add.collider(player, platforms);

      const stars = this.physics.add.group({
        key: 'star',
        repeat: 5,
        setXY: { x: 12, y: 0, stepX: 110 }
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

  const config = {
    type: Phaser.AUTO,
    width: window.innerWidth * 0.9,
    height: window.innerHeight * 0.9,
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
