import Phaser from 'phaser';
import { MainScene } from './mainScene';

export const createGame = (parent: string) => {
  return new Phaser.Game({
    type: Phaser.AUTO,
    parent,
    backgroundColor: '#1e1e1e',
    scale: {
      mode: Phaser.Scale.FIT,
      autoCenter: Phaser.Scale.CENTER_BOTH,
      width: 960,
      height: 540
    },
    physics: {
      default: 'arcade',
      arcade: { gravity: { y: 0 }, debug: false }
    },
    scene: [MainScene]
  });
};