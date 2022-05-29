import 'phaser';
import LevelEditor from './editor';

// Main class where the application starts at
export default class Game extends Phaser.Scene
{
    // Our eitor class that does all the editor-related work.
    editor : LevelEditor;

    constructor ()
    {
        super('demo');
        this.editor = new LevelEditor();
    }

    preload ()
    {
        this.editor.preload(this);
    }

    create ()
    {
        this.editor.create(this);
    }
}

const config = {
    type: Phaser.AUTO,
    backgroundColor: '#f0316a',
    width: 400,
    height: 600,
    scene: Game,
    parent: "phaser"
};

const game = new Phaser.Game(config);
