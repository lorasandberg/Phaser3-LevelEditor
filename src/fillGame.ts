import Phaser from "phaser";
import Player from "./player";

export default class FillGame extends Phaser.Scene {

	levelMap : Phaser.Tilemaps.Tilemap;
	levelLayer : Phaser.Tilemaps.TilemapLayer;

	player : Player;

	filledTiles : number;
	currentTile : number;

	gameEnded : boolean;

	gameEndText : Phaser.GameObjects.Text;
	gameEndInstrutions : Phaser.GameObjects.Text;

	constructor() {
		super("fillgame");
		this.currentTile = 0;
	}

	preload() {

	}	

	create(data) {

		this.filledTiles = data.width * data.height;
		this.gameEnded = false;

        // Set game background
        this.add.rectangle(200, 300, 360, 560, 0xFFFFFF);

        // Handle the tilemap display
        this.levelMap = this.add.tilemap();
        this.levelMap.width = data.width;
        this.levelMap.height = data.height;
        this.levelMap.setBaseTileSize(data.baseTileWidth,data.baseTileHeight);
        this.levelMap.addTilesetImage("tileset");
        this.levelLayer = this.levelMap.createBlankLayer("layer", "tileset", 0, 0);

        this.levelLayer.setScale(5,5);

        this.levelLayer.x = 200 - this.levelMap.widthInPixels / 2 * this.levelLayer.scaleX;
        this.levelLayer.y = 300 - this.levelMap.heightInPixels / 2 * this.levelLayer.scaleY + 50;

        // Create player instance
        this.player = new Player(this.physics.add.sprite(80, 220, "aino"), this);

		// Quick and dirty prototype solutions! Create (invisible) collider bounds to constrain player movement.
        let walls = this.physics.add.staticGroup();
        walls.create(100, 160, "tile_cursor").setScale(40, 4).refreshBody().setVisible(false);
        walls.create(100, 540, "tile_cursor").setScale(40, 4).refreshBody().setVisible(false);
        walls.create(0, 350, "tile_cursor").setScale(4, 40).refreshBody().setVisible(false);
        walls.create(400, 350, "tile_cursor").setScale(4, 40).refreshBody().setVisible(false);
		
		// Keep the player starting tile empty
        data.data[0][0].index = 1; 

        // Get the map data from the editor and fill the level.
        for(let x = 0; x < data.width; x++) {
            for(let y = 0; y < data.height; y++) {

                this.levelMap.putTileAt(data.data[y][x].index, x, y);

                // Create invisible collider whenever there's a tree tile.
                if(data.data[y][x].index == 0) {
                	walls.create(
                		this.levelLayer.x + data.baseTileWidth * this.levelLayer.scaleX * x + 16 * 5 / 2,
                		this.levelLayer.y + data.baseTileHeight * this.levelLayer.scaleY * y + 16 * 5 / 2, 
                		"tile_cursor",
                		).setScale(5,5).setVisible(false).refreshBody();
                	this.filledTiles--;
                }
                else
                	this.levelMap.getTileAt(x,y).tint = 0x999999;
            }
        }

        this.physics.add.collider(this.player.body, walls);

        this.gameEndText = this.add.text(200, 350, "Game Over!",  { 
        	"fontSize": "40px", 
        	"fontStyle": "bold",
        	"stroke": "#000000",
        	"strokeThickness": 3
        }).setOrigin(0.5, 0.5).setVisible(false);
        this.gameEndInstrutions = this.add.text(200, 390, "Press Backspace to return",  { 
        	"fontSize": "20px" ,
        	"fontStyle": "bold",
        	"stroke": "#000000",
        	"strokeThickness": 3
        }).setOrigin(0.5, 0.5).setVisible(false);
	}

	update() {

		this.player.update();

		if(!this.gameEnded) {

			// Check which tile the player inhabits now
			let tile : Phaser.Tilemaps.Tile;
			tile = this.levelMap.getTileAtWorldXY(this.player.body.x, this.player.body.y);

			let newTile = tile.x + tile.y * this.levelMap.width;

			// If the tile is not white, turn it white (means visited)
			if(tile.tint != 0xffffff)
			{
				tile.tint = 0xffffff;
				this.filledTiles--;

				// If player has visited all empty tiles, game is won
				if(this.filledTiles <= 0) {
					this.gameFinished(true);
				}
			}
			else if(newTile != this.currentTile) { // If the tile is already visited but it's not the same tile as last frame, game detects revisited tile and game ends.
				tile.tint = 0xcc3333;
					this.gameFinished(false); // Game lost
			}

			this.currentTile = newTile;
		}

	}

	gameFinished(victory : boolean) : void {

		this.player.allowControls = false;
		this.gameEnded = true;
		if(victory)
			this.gameEndText.text = "You won!";

		this.gameEndText.setVisible(true);
		this.gameEndInstrutions.setVisible(true);
	}

}