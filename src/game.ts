import 'phaser';
import LevelEditor from './editor';
import FillGame from './fillGame';

// Main class where the application starts at
export default class Game extends Phaser.Scene
{
    // Our eitor class that does all the editor-related work.
    editor : LevelEditor;
    fillGame : FillGame;

    check : boolean;

    constructor ()
    {
        super('main');
        this.editor = new LevelEditor();
        this.fillGame = new FillGame();
        this.check = false;

    }

    preload ()
    {
        this.load.image("tileset", "assets/tileset.png");
        this.load.image("tile_cursor", "assets/cursor.png");
        this.load.spritesheet("aino", "assets/aino.png", { frameWidth: 16, frameHeight: 16});
        this.editor.preload(this);
    }

    create ()
    {
        this.editor.create(this);
    }

    update() {

        // Check if player wants to move from the game to the editor or the other way around
        this.input.keyboard.on("keydown-ENTER", function() { 
            if(!this.check) {
                this.check = true;
                this.scene.launch("fillgame", this.editor.getMap());
            }
        }, this);


        this.input.keyboard.on("keydown-BACKSPACE", function() {
            if(this.check) {
               this.scene.get("fillgame");
               this.scene.stop("fillgame");
               this.check = false;
            }
        }, this);
    }
}

const config = {
    type: Phaser.AUTO,
    backgroundColor: '#f0316a',
    width: 400,
    height: 600,
    scene: [ Game, FillGame ],
    parent: "phaser", 
    physics: {
        default: 'arcade',
        arcade: {
            gravity: { y: 0 },
            debug: false
        }
    },
};

const game = new Phaser.Game(config);
