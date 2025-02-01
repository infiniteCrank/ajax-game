window.onload = function () {
  class AjaxGame extends Phaser.Scene {
    constructor() {
      super({ key: "AjaxGame" });
    }

    preload() {
    }

    create() {
     
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
    scene: AjaxGame,
  };

  // Start the Phaser game
  const game = new Phaser.Game(config);
};
