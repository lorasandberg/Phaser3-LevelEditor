import Phaser from "phaser";

const levelSize = [4,4];
const tileSize = 16;
const tileCount = 2; // How many different tiles are in the tileset.

export default class LevelEditor {

    // Level refers to the editable grid of tiles.
    // Picker refers to the list of different tiles the user can choose from to add to the level.
    levelMap : Phaser.Tilemaps.Tilemap;
    pickerMap : Phaser.Tilemaps.Tilemap;
    levelLayer : Phaser.Tilemaps.TilemapLayer;
    pickerLayer : Phaser.Tilemaps.TilemapLayer;

    pickerCursor : Phaser.GameObjects.Image;
    levelCursor : Phaser.GameObjects.Image;

    // Which tile is currently selected on the picker.
    selectedTile : number;

    constructor() {

    }

    preload(scene : Phaser.Scene) {

        scene.load.image("tileset", "assets/tileset.png");
        scene.load.image("tile_cursor", "assets/cursor.png");
    }

    create(scene : Phaser.Scene) {
        
        // Visual scale of the display elements for both grids.
        const levelScale : number = 4; 
        const pickerScale : number = 3;

        // Setting up the level
        this.levelMap = scene.add.tilemap();
        this.levelMap.width = levelSize[0];
        this.levelMap.height = levelSize[0];
        this.levelMap.setBaseTileSize(tileSize,tileSize);

        this.levelMap.addTilesetImage("tileset");

        // Setting up a layer, the display element, for the tilemap
        this.levelLayer = this.levelMap.createBlankLayer("layer", "tileset", 0, 0);
        this.levelLayer.setScale(levelScale,levelScale);


        this.levelLayer.x = 200 - this.levelMap.widthInPixels / 2 * this.levelLayer.scaleX;
        this.levelLayer.y = 300 - this.levelMap.heightInPixels / 2 * this.levelLayer.scaleY;

        this.levelCursor = scene.add.image(0, 0, "tile_cursor");
        this.levelCursor.setScale(levelScale, levelScale);
        this.levelCursor.setOrigin(0,0);

        scene.input.on("pointermove", this.refreshLevelCursor, this);

        // Populating the map with default tiles at start.
        for(let x = 0; x < levelSize[0]; x++) {
            for(let y = 0; y < levelSize[1]; y++) {
                this.levelMap.putTileAt(1, x, y);
            }
        }

        this.selectedTile = 0;

        this.levelLayer.setInteractive();

        this.levelLayer.on('pointerdown', this.putTile, this);
        scene.input.keyboard.on("keydown-SPACE", function() { this.putTile(scene.input.activePointer); }, this);

        // Setting up the tile picker
        this.pickerMap = scene.add.tilemap();
        this.pickerMap.width = tileCount;
        this.pickerMap.height = 1;
        this.pickerMap.setBaseTileSize(tileSize,tileSize);
        this.pickerMap.addTilesetImage("tileset");

        // Setting up a layer, the display element, for the picker
        this.pickerLayer = this.pickerMap.createBlankLayer("layer", "tileset", 0, 0);

        this.pickerLayer.x = 200 - this.pickerMap.widthInPixels / 2 * pickerScale;
        this.pickerLayer.y = 32;

        // Filling the picker with all of our different tiles.
        for(let i = 0; i < tileCount; i++)
            this.pickerMap.putTileAt(i, i, 0);

        this.pickerCursor = scene.add.image(0, 0,"tile_cursor");
        this.pickerCursor.setOrigin(0,0);

        this.pickerLayer.setScale(pickerScale, pickerScale);
        this.pickerCursor.setScale(pickerScale, pickerScale);

        // Picker tile selection logic. Player can go through the tiles with left and right arrow keys.
        scene.input.keyboard.on("keydown-LEFT", function() { 
            this.selectedTile--; 
            this.selectedTile = (this.selectedTile + tileCount) % tileCount;
            this.refreshPicker();
        }, this);

        scene.input.keyboard.on("keydown-RIGHT", function() { 
            this.selectedTile++; 
            this.selectedTile = (this.selectedTile + tileCount) % tileCount;
            this.refreshPicker();
        }, this);

        this.refreshPicker();
    }

    // Refreshes the picker display. Mostly updating cursor position.
    refreshPicker() : void {
        this.pickerCursor.x = this.pickerLayer.x + this.selectedTile * tileSize * this.pickerLayer.scaleX;
        this.pickerCursor.y = this.pickerLayer.y;
    }

    // Refreshes the level cursor position. Happens every time the application detects mouse movement.
    refreshLevelCursor(pointer : Phaser.Input.Pointer) : void {
        let x = Phaser.Math.FloorTo((pointer.x - this.levelLayer.x) / (tileSize * this.levelLayer.scaleX));
        let y = Phaser.Math.FloorTo((pointer.y - this.levelLayer.y) / (tileSize * this.levelLayer.scaleY));

        x = Phaser.Math.Clamp(x, 0, levelSize[0]-1);
        y = Phaser.Math.Clamp(y, 0, levelSize[1]-1);

        this.levelCursor.x = this.levelLayer.x + tileSize * x * this.levelLayer.scaleX;
        this.levelCursor.y = this.levelLayer.y + tileSize * y * this.levelLayer.scaleY;
    }

    // Inserts selected tile into the level map.
    putTile(pointer : Phaser.Input.Pointer) : void { 

        let x = pointer.x;
        let y = pointer.y;

        this.levelMap.putTileAt(this.selectedTile, 
            Phaser.Math.FloorTo((x - this.levelLayer.x) / (tileSize * this.levelLayer.scaleX)), 
            Phaser.Math.FloorTo((y - this.levelLayer.y) / (tileSize * this.levelLayer.scaleY)));
    }
}