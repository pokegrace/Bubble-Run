// defining game: (width, height, rendering context) 
var game = new Phaser.Game(1000, 600, Phaser.AUTO);

// declaring variables
var player;
var score;
var bubbles;

// defining Menu screen and methods
var Menu = function(game) {};
Menu.prototype =
{
	preload: function()
	{
		// debugging
		console.log('Menu: preload');

		// loading titlescreen assets
		game.load.image('background', 'assets/images/background.png');
		game.load.image('titlescreen', 'assets/images/titlescreen.png');

		// loading sound asset
		game.load.audio('bubble', 'assets/audio/bubble.mp3');

		// loading font asset
		game.load.bitmapFont('font', 'assets/fonts/carrier_command.png', 'assets/fonts/carrier_command.xml');
	},
	create: function()
	{
		console.log('Menu: create');

		// add key capture so pressing keys won't stop focusing on the game
		game.input.keyboard.addKeyCapture( [Phaser.Keyboard.ESC, Phaser.Keyboard.TAB, Phaser.Keyboard.UP, Phaser.Keyboard.DOWN, Phaser.Keyboard.LEFT, Phaser.Keyboard.RIGHT, Phaser.Keyboard.SPACEBAR,
		 									Phaser.Keyboard.PAGE_UP, Phaser.Keyboard.PAGE_DOWN, Phaser.Keyboard.SHIFT, Phaser.Keyboard.ENTER, Phaser.Keyboard.CONTROL]);

		// adding background to game
		this.background = game.add.tileSprite(0, 0, game.width, game.height, 'background');
		game.add.sprite(120, 20, 'titlescreen');

		// adding sound to game
		bubble = game.add.audio('bubble');

		// looping audio background music at 0.3 volume
		bubble.loopFull(0.3);

		// for keyboard press 
		this.changeKey = game.input.keyboard.addKey(Phaser.Keyboard.SPACEBAR);
	},
	update: function()
	{
		// making background move
		this.background.tilePosition.x -= 3;

		// if the spacebar was pressed, move to next state
		if(this.changeKey.justPressed())
		{
			// debugging
			console.log('Changing states...');
			game.state.start('Tutorial');
		}
	}
}

// defining Tutorial screen and methods
var Tutorial = function(game){};
Tutorial.prototype =
{
	preload: function()
	{
		console.log('Tutorial: preload');

		// resetting score to zero
		score = 0;

		// loading tutorialscreen assets
		// game.load.image('background', 'assets/images/background.png');
		game.load.image('tutorialscreen', 'assets/images/tutorialscreen.png');
	},
	create: function()
	{
		console.log('Tutorial: create');

		// adding background to game
		this.background = game.add.tileSprite(0, 0, game.width, game.height, 'background');
		game.add.sprite(30, 20, 'tutorialscreen');

		// for keyboard press 
		this.changeKey = game.input.keyboard.addKey(Phaser.Keyboard.SPACEBAR);
	},
	update: function()
	{
		// making background move
		this.background.tilePosition.x -= 3;

		// if the spacebar was pressed, move to next state
		if(this.changeKey.justPressed())
		{
			// debugging
			console.log('Changing states...');
			game.state.start('Gameplay');
		}
	}
}

// defining Gameplay screen and methods
var Gameplay = function(game){};
Gameplay.prototype =
{
	preload: function()
	{
		console.log('Gameplay: preload');

		// loading texture atlas
		// game.load.atlas('key', 'pathtofile.png', 'pathtofile.json');
		game.load.atlas('spritesheet', 'assets/images/spritesheet.png', 'assets/images/sprites.json');

		// loading particle
		game.load.image('particle', 'assets/images/particle.png');
		game.load.image('bubbleparticle', 'assets/images/bubbleparticle.png');

		// loading background image
		// game.load.image('background', 'assets/images/background.png');

		// loading sound asset
		game.load.audio('plop', 'assets/audio/Plop.mp3');
	},
	create: function()
	{
		console.log('Gameplay: create');

		// adding background to game
		this.background = game.add.tileSprite(0, 0, game.width, game.height, 'background');

		// adding audio to game
		plop = game.add.audio('plop');

		// adding score text to game: (x, y, default text, font details)
		scoreText = game.add.bitmapText(16, 16, 'font', 'Score: 0', 24);
		scoreText.tint = 0x9FAFD9;
		scoreText.scale.setTo(0.8, 1);

		// starting physics system
		game.physics.startSystem(Phaser.Physics.ARCADE);

		// creating initial particle emitter for popping bubbles
		emitter = game.add.emitter(0, 0, 100);
		emitter.makeParticles('bubbleparticle');
		emitter.gravity = 150;

		// for keyboard press
		this.changeKey = game.input.keyboard.addKey(Phaser.Keyboard.SPACEBAR);

		// adding player to game
		player = game.add.sprite(64, game.world.centerY, 'spritesheet', 'player0');
		// enabling physics on player
		game.physics.arcade.enable(player);
		//enabling gravity on player
		player.body.gravity.y = 100;
		// making player not leave world bounds
		player.body.collideWorldBounds = true; 
		// setting collider to circle with radius of 24px
		player.body.setCircle(24);

		// adding player animations
		player.animations.add('up', Phaser.Animation.generateFrameNames('player', 2, 5, '', 1), 5, true);
		player.animations.add('down', Phaser.Animation.generateFrameNames('player', 6, 9, '', 1), 5, true);
		player.animations.play('down');

		// adding bubbles to the game
		// making a group of bubbles
		bubbles = game.add.group();
		// enabling physics for bubbles
		bubbles.enableBody = true;

		// adding spikes to the game
		// making a group of spikes
		spikes = game.add.group();
		// enabling physics for spikes
		spikes.enableBody = true;
	},
	update: function()
	{
		// making background move
		this.background.tilePosition.x -= 3;

		// creating variable cursors to get keyboard input
		cursors = game.input.keyboard.createCursorKeys();

		// this prevents bubbles from spawning every frame
		// Math.random() * (max - min) + min
		var randSpawn = Math.random() * (10000 - 1) + 1;

		// if the randSpawn is less than 150, then spawn a bubble
		if(randSpawn > 100 && randSpawn < 2000)
		{
			// calling function to create bubble
			createBubble();
		} 
		// spike spawn rate depending on score
		if(score < 100)
		{
			if(randSpawn < 100)
				createSpike();
		} 
		else if(score >= 100 && score < 200)
		{
			if(randSpawn < 200)
				createSpike();
		}
		else if(score >= 200)
		{
			if(randSpawn < 300)
				createSpike();
		}

		// player movement
		// resetting player's velocity
		player.body.velocity.x = 0;

		// if up key is pressed, move player up, and play animation
		if(cursors.up.isDown)
		{
			player.body.velocity.y = -150;
		}
		else if(cursors.down.isDown)
		{
			player.body.velocity.y = 80;
		}

		// playing animations
		if(player.body.velocity.y <= 0) 
			player.animations.play('up');
		else if(player.body.velocity.y > 0)
			player.animations.play('down');

		// if player overlaps with bubble, then run collectBubble function
		game.physics.arcade.overlap(player, bubbles, collectBubble, null, this);

		// if player overlaps with spike, then run endGame function
		game.physics.arcade.overlap(player, spikes, endGame, null, this);
	}
}

// defining Gameover screen and methods
var Gameover = function(game){};
Gameover.prototype =
{
	preload: function()
	{
		console.log('Gameover: preload');

		// loading texture atlas
		// game.load.atlas('key', 'pathtofile.png', 'pathtofile.json');
		game.load.atlas('spritesheet', 'assets/images/spritesheet.png', 'assets/images/sprites.json');

		// loading game over and background screens
		game.load.image('gameoverscreen', 'assets/images/gameoverscreen.png');
		game.load.image('background', 'assets/images/background.png');
	},
	create: function()
	{
		console.log('Gameover: create');

		// adding game over screen and background to game
		this.background = game.add.tileSprite(0, 0, game.width, game.height, 'background');
		game.add.sprite(140, 20, 'gameoverscreen');

		// showing player score
		scoreText = game.add.bitmapText(500, 175, 'font', 'Score: 0', 26);
		scoreText.setText('Score: ' + score);
		scoreText.tint = 0x9FAFD9;
		scoreText.anchor.setTo(0.5);
		scoreText.scale.setTo(0.8, 1);

		// adding player to game
		this.player = game.add.sprite(game.world.centerX - 20, game.world.centerY, 'spritesheet', 'player0');

		// adding game over animations
		this.player.animations.add('gameover', Phaser.Animation.generateFrameNames('player', 0, 1, '', 1), 3, true);
		this.player.animations.play('gameover');

		// for keyboard press 
		this.changeKey = game.input.keyboard.addKey(Phaser.Keyboard.SPACEBAR);
	},
	update: function()
	{
		// making background move
		this.background.tilePosition.x -= 3;

		// if the spacebar was pressed, move back to tutorial screen
		if(this.changeKey.justPressed())
		{
			// debugging
			console.log('Changing states...');
			game.state.start('Tutorial');
		}
	}
}

// run this function when player collides with bubble
function collectBubble(player, bubble)
{
	// removes bubble from game
	bubble.kill();

	// emit particles
	emitter.x = player.x + 40;
	emitter.y = player.y + 20;
	// emitter.start(explode?, particle lifespan (ms), ignored when using burst mode, how many particles emitted)
	emitter.start(true, 600, null, 5);

	// updates score
	score++;
	scoreText.setText('Score: ' + score);

	// play sound effect
	plop.play();
}

// run this function to switch to gameover state
function endGame(player, spike)
{
	// removes spike from game
	spike.kill();

	// switches to gameover state
	game.state.start('Gameover');
}

// this function creates a random colored bubble at a random speed
function createBubble()
{
	// generating random numbers for bubble y position
	var randY = Math.random() * (550 - 50) + 50;

	// creating array of bubble sprites
	var bubbleList = ['bubble0', 'bubble1', 'bubble2', 'bubble3', 'bubble4', 'bubble5', 'bubble6', 'bubble7'];

	// generating random bubble to spawn
	// Math.floor() because Math.random() needs to generate whole numbers
	var randBubble = Math.floor(Math.random() * (7 - 1) + 1);

	// generating random velocity for spikes and bubbles
	var randVelocity = -(Math.random() * (250 - 150) + 150);

	// creating a bubble from the group .create(x, y, 'spritesheet', 'key');
	var bubble = bubbles.create(1000, randY, 'spritesheet', bubbleList[randBubble]);

	// giving bubble a velocity so it can move 
	bubble.body.velocity.x = randVelocity;
	// setting collision body to circle with radius of 24px
	bubble.body.setCircle(24);
}

function createSpike()
{
	// generating random numbers for bubble y and spike y positions
	var randY = Math.random() * (580 - 50) + 50;

	// creating an array of "bubble sprites" and "spike sprites"
	var spikeList = ['spike0', 'spike1', 'spike2', 'spike3', 'spike4'];

	var randSpike = Math.floor(Math.random() * (5 - 1) + 1);
	var randVelocity = -(Math.random() * (250 - 150) + 150);
	var spike = spikes.create(1000, randY, 'spritesheet', spikeList[randSpike]);

	spike.body.velocity.x = randVelocity;
	// setting collision body: setSize(w, h);
	spike.body.setSize(15, 15);
}

// adding all states to StateManager and starting game at Menu
game.state.add('Menu', Menu);
game.state.add('Tutorial', Tutorial);
game.state.add('Gameplay', Gameplay);
game.state.add('Gameover', Gameover);
game.state.start('Menu');