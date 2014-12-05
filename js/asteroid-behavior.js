define(
	[
		'physicsjs'
	],
	function (
		Physics) {

	Physics.behavior('asteroid-behavior', function (parent) {

		return {
			init : function (options) {
				var self = this;
				parent.init.call(this, options);
				// the asteroid will be passed in via the config options
				// so we need to store the asteroid
				var asteroid = self.asteroid = options.asteroid;
				self.lifeLevel = 3;
			},

			// this is automatically called by the world
			// when this behavior is added to the world
			connect : function (world) {
				// we want to subscribe to world events
				world.on('collisions:detected', this.checkPlayerCollision, this);
				world.on('render', this.renderItems, this);
			},

			// this is automatically called by the world
			// when this behavior is removed from the world
			disconnect : function (world) {
				// we want to unsubscribe from world events
				world.off('collisions:detected', this.checkPlayerCollision);
				world.off('render', this.renderItems);
			},

			// check to see if the asteroid has collided
			checkPlayerCollision : function (data) {

				var self = this,
				world = self._world,
				collisions = data.collisions,
				col,
				asteroid = this.asteroid;
				if (!world) {
					return self;
				}
				var renderer = world._renderer;

				for (var i = 0, l = collisions.length; i < l; ++i) {
					col = collisions[i];
					//Detect collision with laster
					if ((col.bodyA.gameType === 'asteroid' && col.bodyB.gameType === 'laser') ||
						(col.bodyA.gameType === 'laser' && col.bodyB.gameType === 'asteroid')) {
						console.log(col.bodyA.uid + "," + col.bodyB.uid);
						if (col.bodyA.uid==self.asteroid.uid || col.bodyB.uid==self.asteroid.uid) {
							self.lifeLevel=self.lifeLevel-1;
							console.log(" " + self.asteroid.uid + " life: " + self.lifeLevel);
							self.checkForDestruction();
						}
						//console.log("beh_uid:" + self.asteroid.uid + "  aast_uid:" + col.bodyA.uid + "or" + col.bodyB.uid);
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
						this.disconnect(world);
						return;
					}
				}
			},
			
			//Check the asteroid's lifeLevel and remove if it's zero
			checkForDestruction : function(data) {
				var self = this,
				world = self._world,
				asteroid = this.asteroid;
				if (self.lifeLevel==0) {
					//this.disconnect(world);
					asteroid.blowUp();
					world.removeBehavior(this);
					
				}
			},

			renderItems : function (data) {
				var self = this,
				world = self._world,
				player = this.player;
				if (!world) {
					return self;
				}
				var renderer = world._renderer;
			}
		};
	});
});
