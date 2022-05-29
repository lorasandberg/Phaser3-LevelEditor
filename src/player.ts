export default class Player {

	speed : number;
	drag : number;


	body : Phaser.Types.Physics.Arcade.SpriteWithDynamicBody;
	cursors : Phaser.Types.Input.Keyboard.CursorKeys;

	allowControls : boolean;
	facingRight : boolean;

	constructor(body : Phaser.Types.Physics.Arcade.SpriteWithDynamicBody, scene : Phaser.Scene) {
		this.body = body;

        this.body.setDamping(true);
        this.body.setScale(3.5,3.5);
        this.body.setVelocity(0,0);

        this.allowControls = true;

        this.cursors = scene.input.keyboard.createCursorKeys();

        this.speed = 300;
        this.drag = 0.7;


        // Create walking (and standing) animation
        scene.anims.create({
        	key: "moving",
        	frames: scene.anims.generateFrameNumbers("aino", { start: 0, end: 3 }),
        	frameRate: 8,
        	repeat: -1 
        });

        scene.anims.create({
        	key: "standing", 
        	frames: [ {key: "aino", frame: 0 }],
        	frameRate: 10
        });
    

        this.facingRight = false;
	}

	update() {

		//Check for movement input
		if(this.allowControls) {
			if(this.cursors.left.isDown) 
				this.body.setVelocityX(-this.speed);
			if(this.cursors.right.isDown)
				this.body.setVelocityX(this.speed);
			if(this.cursors.up.isDown)
				this.body.setVelocityY(-this.speed);
			if(this.cursors.down.isDown)
				this.body.setVelocityY(this.speed);
		}

		// Detect whether to play walking or standing animation
		let limit = 10;
		if((this.body.body.velocity.x * this.body.body.velocity.x) + (this.body.body.velocity.y * this.body.body.velocity.y) > limit * limit)
			this.body.anims.play("moving", true);
		else
			this.body.anims.play("standing");

		// Detect which way to face
		if(this.body.body.velocity.x > limit && !this.facingRight) {
			this.facingRight = true;
			this.body.flipX = true;
		}
		else if(this.body.body.velocity.x < -limit && this.facingRight) {
			this.facingRight = false;
			this.body.flipX = false;
		}

		// Apply drag
		this.body.setVelocity(this.body.body.velocity.x * this.drag, this.body.body.velocity.y * this.drag);
	}

}