import Phaser from 'phaser';
import { MainScene } from './mainScene';

export const createGame = (parent: string) => {
  return new Phaser.Game({
    type: Phaser.AUTO,
    parent,
    backgroundColor: '#1e1e1e',
    scale: {
      // Fill the available viewport and keep the scene centered
      // RESIZE ensures the canvas matches the parent size (no letterboxing on small landscape screens)
      mode: Phaser.Scale.RESIZE,
      autoCenter: Phaser.Scale.CENTER_BOTH,
      width: 960,
      height: 540,
      parent: parent,
      expandParent: true
    },
    physics: {
      default: 'arcade',
      arcade: { gravity: { x: 0, y: 0 }, debug: false }
    },
    scene: [MainScene]
  });
};