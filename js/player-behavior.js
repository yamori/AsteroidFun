define(
	[
		'physicsjs'
	],
	function (
		Physics) {

	Physics.behavior('player-behavior', function (parent) {

		return {
			init : function (options) {
				this.keyTracker = new Object();
				this.turnTracker = false;
				var self = this;
				parent.init.call(this, options);
				// the player will be passed in via the config options
				// so we need to store the player
				var player = self.player = options.player;
				self.gameover = false;
				self.collisionRing = [];

				// events
				document.addEventListener('keydown', function (e) {
					if (self.gameover) {
						return;
					}
					self.keyAction('keydown', e.keyCode);
					return false;
				});
				document.addEventListener('keyup', function (e) {
					if (self.gameover) {
						return;
					}
					self.keyAction('keyup', e.keyCode);
					return false;
				});
			},

			// this is automatically called by the world
			// when this behavior is added to the world
			connect : function (world) {

				// we want to subscribe to world events
				world.on('collisions:detected', this.checkPlayerCollision, this);
				world.on('integrate:positions', this.behave, this);
				world.on('render', this.renderItems, this);
			},

			// this is automatically called by the world
			// when this behavior is removed from the world
			disconnect : function (world) {

				// we want to unsubscribe from world events
				world.off('collisions:detected', this.checkPlayerCollision);
				world.off('integrate:positions', this.behave);
				world.off('render', this.renderItems);
			},

			// check to see if the player has collided
			checkPlayerCollision : function (data) {

				var self = this,
				world = self._world,
				collisions = data.collisions,
				col,
				player = this.player;
				var renderer = world._renderer;

				for (var i = 0, l = collisions.length; i < l; ++i) {
					col = collisions[i];
					//Detect collision with square
					if ((col.bodyA.gameType === 'square' && col.bodyB.gameType === 'laser') ||
						(col.bodyA.gameType === 'laser' && col.bodyB.gameType === 'square')) {
						//world.emit('win-game');
					}
					//Detect if we collide with a rock.
					if ((col.bodyA.gameType === 'player' && col.bodyB.gameType === 'asteroid') ||
						(col.bodyA.gameType === 'asteroid' && col.bodyB.gameType === 'player')) {
						self.collisionRing.push({
							state : player.state
						});
						// remove ring after 200ms
						setTimeout(function () {
							self.collisionRing = [];
						}, 100);
					}
				}

				//For now, don't care about exploding.
				return;

				for (var i = 0, l = collisions.length; i < l; ++i) {
					col = collisions[i];

					// if we aren't looking at debris
					// and one of these bodies is the player...
					if (col.bodyA.gameType !== 'debris' &&
						col.bodyB.gameType !== 'debris' &&
						(col.bodyA === player || col.bodyB === player)) {
						player.blowUp();
						world.removeBehavior(this);
						this.gameover = true;

						// when we crash, we'll publish an event to the world
						// that we can listen for to prompt to restart the game
						world.publish('lose-game');
						return;
					}
				}
			},

			// toggle player motion
			keyAction : function (keyaction, keyCode) {

				if (keyaction == 'keydown') {
					this.keyTracker[keyCode] = true;
					return;
				} else if (keyaction == 'keyup') {
					this.keyTracker[keyCode] = false;
				}
			},

			behave : function (data) {
				//var player = data.player;
				// Behave based on keyTracker
				//this.player.thrust( this.playerMove ? 10 : 0 );
				if (this.keyTracker[38]) {
					this.player.thrust(10);
				} else if (!this.keyTracker[38]) {
					this.player.thrust(0);
				}
				if (this.keyTracker[37]) {
					//Left
					this.player.turn(-1);
					this.turnTracker = true;
				} else if (this.keyTracker[39]) {
					//Right
					this.player.turn(1);
					this.turnTracker = true;
				} else if (!this.keyTracker[37] & !this.keyTracker[39] & this.turnTracker == true) {
					this.player.turn(0);
					this.turnTracker = false;
				}
				if (this.keyTracker[90]) {
					this.player.shoot();
				} //Shoot
			},

			renderItems : function (data) {
				var self = this,
				world = self._world,
				player = this.player;
				var renderer = world._renderer;
				return;
				//Don't draw a colision indicate around the player
				for (var i = 0; i < self.collisionRing.length; ++i) {
					var ring = self.collisionRing[i];
					renderer.drawCircle(ring.state.pos.x, ring.state.pos.y, 40, {
						strokeStyle : '#000000',
						lineWidth : 4,
						fillStyle : '#ff0000',
						angleIndicator : 'white'
					});
				}

			}
		};
	});
});
