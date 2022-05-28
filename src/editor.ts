import Phaser from "phaser";

export default class LevelEditor {

    tilemap : Phaser.Tilemaps.Tilemap;
    tilelayer : Phaser.Tilemaps.TilemapLayer;

    constructor() {

    }

    preload(scene : Phaser.Scene) {

        scene.load.image("tileset_grass", "assets/tileset_grass.png");
    }

    create(scene : Phaser.Scene) {
        
        // Setting up the tilemap
        this.tilemap = scene.add.tilemap();
        this.tilemap.width = 2;
        this.tilemap.height = 2;
        this.tilemap.setBaseTileSize(32,32);

        this.tilemap.addTilesetImage("tileset_grass");

        // Setting up a single layer for the tilemap
        this.tilelayer = this.tilemap.createBlankLayer("layer", "tileset_grass", 0, 0);
        this.tilelayer.x = 400 - this.tilemap.widthInPixels / 2;
        this.tilelayer.y = 300 - this.tilemap.heightInPixels / 2;

        // Populating the map with random tiles at start.
        this.tilemap.putTileAt(Phaser.Math.Between(0,60), 0, 0);
        this.tilemap.putTileAt(Phaser.Math.Between(0,60), 1, 0);
        this.tilemap.putTileAt(Phaser.Math.Between(0,60), 0, 1);
        this.tilemap.putTileAt(Phaser.Math.Between(0,60), 1, 1);
    }
}