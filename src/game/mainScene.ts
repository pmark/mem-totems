import Phaser from 'phaser';

export class MainScene extends Phaser.Scene {
  private cursors!: Phaser.Types.Input.Keyboard.CursorKeys;
  private player!: Phaser.GameObjects.Arc;

  constructor() {
    super('MainScene');
  }

  create() {
    this.player = this.add.circle(480, 270, 20, 0xffcc00);
    this.cursors = this.input?.keyboard?.createCursorKeys();
  }

  update() {
    const speed = 200;
    if (this.cursors.left?.isDown) this.player.x -= speed * this.game.loop.delta / 1000;
    if (this.cursors.right?.isDown) this.player.x += speed * this.game.loop.delta / 1000;
    if (this.cursors.up?.isDown) this.player.y -= speed * this.game.loop.delta / 1000;
    if (this.cursors.down?.isDown) this.player.y += speed * this.game.loop.delta / 1000;
  }
}