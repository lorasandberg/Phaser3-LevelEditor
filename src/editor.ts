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

    // An abstract cursor instead of a visual element
    // Reacts to player input and defines which tiles or actions are currently selected.
    // In the case of y = 0, the tile selector becomes active. 
    // When y is [1,5], the level grid is active. 
    cursorPosition : [number, number];

    pickerActive : boolean;

    constructor() {
        this.cursorPosition = [0,0];
        this.pickerActive = true;
    }

    preload(scene : Phaser.Scene) {

        scene.load.image("tileset", "assets/tileset.png");
        scene.load.image("tile_cursor", "assets/cursor.png");
    }

    create(scene : Phaser.Scene) {
        
        // Set editor background
        scene.add.rectangle(200, 300, 360, 560, 0xFFFFFF);


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
        this.levelLayer.y = 300 - this.levelMap.heightInPixels / 2 * this.levelLayer.scaleY + 50;

        this.levelCursor = scene.add.image(0, 0, "tile_cursor");
        this.levelCursor
        .setScale(levelScale, levelScale)
        .setOrigin(0,0)
        .setVisible(false);

        // Populating the map with default tiles at start.
        for(let x = 0; x < levelSize[0]; x++) {
            for(let y = 0; y < levelSize[1]; y++) {
                this.levelMap.putTileAt(1, x, y);
            }
        }

        this.selectedTile = 0;

        // Setting up the tile picker
        this.pickerMap = scene.add.tilemap();
        this.pickerMap.width = tileCount;
        this.pickerMap.height = 1;
        this.pickerMap.setBaseTileSize(tileSize,tileSize);
        this.pickerMap.addTilesetImage("tileset");

        // Setting up a layer, the display element, for the picker
        this.pickerLayer = this.pickerMap.createBlankLayer("layer", "tileset", 0, 0);

        this.pickerLayer.x = 200 - this.pickerMap.widthInPixels / 2 * pickerScale;
        this.pickerLayer.y = 90;

        // Filling the picker with all of our different tiles.
        for(let i = 0; i < tileCount; i++)
            this.pickerMap.putTileAt(i, i, 0);

        this.pickerCursor = scene.add.image(0, 0,"tile_cursor");
        this.pickerCursor.setOrigin(0,0);

        this.pickerLayer.setScale(pickerScale, pickerScale);
        this.pickerCursor.setScale(pickerScale, pickerScale);

        // Check spacebar input for either tile selection or tile insertion.
        scene.input.keyboard.on("keydown-SPACE", function() { 
            if(!this.pickerActive)
                this.putTileAt(this.cursorPosition[0], this.cursorPosition[1]-1); 
            if(this.pickerActive)
                this.setCursorPosition(0,1);
        }, this);

        // Move player cursor depending on arrow key input
        scene.input.keyboard.on("keydown-LEFT", function() { this.setCursorPosition(-1, 0);  }, this);
        scene.input.keyboard.on("keydown-RIGHT", function() { this.setCursorPosition(1, 0); }, this);
        scene.input.keyboard.on("keydown-UP", function() { this.setCursorPosition(0, -1); }, this);
        scene.input.keyboard.on("keydown-DOWN", function() { this.setCursorPosition(0, 1); }, this);

        this.refreshPicker();
    }

    // Refreshes the picker display. Mostly updating cursor position.
    refreshPicker() : void {
        this.pickerCursor.x = this.pickerLayer.x + this.selectedTile * tileSize * this.pickerLayer.scaleX;
        this.pickerCursor.y = this.pickerLayer.y;
    }

    // Executes UI logic depending on player input.
    // Moves either the level grid cursor or picker cursor depending which one is active.
    setCursorPosition(deltaX : number, deltaY : number) : void {

        let newPosition = [
        Phaser.Math.Clamp(this.cursorPosition[0] + deltaX, 0, levelSize[0] - 1), 
        Phaser.Math.Clamp(this.cursorPosition[1] + deltaY, 0, levelSize[1])];

        let difference = [newPosition[0] - this.cursorPosition[0], newPosition[1] - this.cursorPosition[1]];

        this.cursorPosition = [newPosition[0], newPosition[1]];

        // Cursor was moved vertically
        if(difference[1] != 0) {

            // Cursor moved from the picker to the level
            if(this.pickerActive && this.cursorPosition[1] > 0) {
                if(this.selectedTile == 0)
                    this.cursorPosition[0] = 1;
                else 
                    this.cursorPosition[0] = 2;
            }

            // Cursor moved from the leve to the picker
            if(!this.pickerActive && this.cursorPosition[1] == 0) {
                if(this.cursorPosition[0] <= 1)
                    this.selectedTile = 0;
                else
                    this.selectedTile = 1;
            }

            this.pickerActive = this.cursorPosition[1] == 0;
            //this.pickerCursor.setVisible(this.pickerActive);
            this.levelCursor.setVisible(!this.pickerActive);
        }

        // Change tile picker cursor location based on horizontal input.
        if(this.pickerActive)
            this.selectedTile = (this.selectedTile + deltaX + tileCount) % tileCount;

        this.refreshPicker();
        this.refreshLevelGrid();
    }

    // Refreshes the level cursor position. Happens every time the application detects cursor movement.
    refreshLevelGrid() : void {

        this.levelCursor.setVisible(this.cursorPosition[0] >= 0 && this.cursorPosition[0] < levelSize[0] && this.cursorPosition[1] > 0 && this.cursorPosition[1] < levelSize[1] + 1);

        // Convert level grid position to viewport position
        this.levelCursor.x = this.levelLayer.x + tileSize * this.cursorPosition[0] * this.levelLayer.scaleX;
        this.levelCursor.y = this.levelLayer.y + tileSize * (this.cursorPosition[1] - 1) * this.levelLayer.scaleY;
    }

    // Inserts selected tile into the level map.
    putTileAt(x : number, y : number) : void {

        if(x < 0 || y < 0)
            return;
        if(x >= levelSize[0] || y >= levelSize[1])
            return;

        this.levelMap.putTileAt(this.selectedTile, x, y);
    }
}