// main.js begins
require({
	baseUrl : 'js/',
	packages : [{
			name : 'physicsjs',
			location : 'physicsjs-0.6.0',
			main : 'physicsjs-0.6.0.min'
		}
	]
},
	[
		'require',
		'physicsjs',

		//Custom modules
		'player',
		'player-behavior',
		'asteroid',
		'asteroid-behavior',

		// official modules
		'physicsjs/renderers/canvas',
		'physicsjs/bodies/circle',
		'physicsjs/bodies/rectangle',
		'physicsjs/bodies/convex-polygon',
		'physicsjs/behaviors/attractor',
		'physicsjs/behaviors/newtonian',
		'physicsjs/behaviors/sweep-prune',
		'physicsjs/behaviors/body-collision-detection',
		'physicsjs/behaviors/edge-collision-detection',
		'physicsjs/behaviors/body-impulse-response',
		'physicsjs/behaviors/verlet-constraints'
	], function (
		require,
		Physics) {

	Physics(function (world) {

		var viewWidth = window.innerWidth;
		var viewHeight = window.innerHeight;

		var renderer = Physics.renderer('canvas', {
				el : 'viewport', // id of the canvas element
				width : viewWidth,
				height : viewHeight
			});
		world.add(renderer);
		// render on each step
		world.on('step', function () {
			world.render();
		});
		var maxInitialSpeed = 0.1;
		var asteroids = [10, 10, 10, 10, 20, 40]; //weight the likelihood of an asteroid's weight
		var asteroidArr = [];
		var asteroidBehaviorArr = [];
		for (n = 0; n < 20; n++) {
			var asteroidKind = asteroids[Math.floor(Math.random() * asteroids.length)];
			var asteroidImg = new Image();
			asteroidImg.src = require.toUrl('../images/asteroid' + asteroidKind + '.png');
			asteroidArr[n] = Physics.body('asteroid', {
					x : Math.random() * (viewWidth - 10) + 10,
					y : Math.random() * (viewHeight - 10) + 10,
					mass : 1,
					vx : Math.random() * maxInitialSpeed - maxInitialSpeed / 2,
					vy : Math.random() * maxInitialSpeed - maxInitialSpeed / 2,
					radius : asteroidKind / 2, //radius divide by 2
					restitution : 0.80,
					styles : {
						fillStyle : '#dc322f'
					},
					view : asteroidImg
				});
			asteroidArr[n].gameType = 'asteroid';
			asteroidBehaviorArr[n] = Physics.behavior('asteroid-behavior', {
				asteroid : asteroidArr[n]
			});
			world.add([asteroidArr[n],asteroidBehaviorArr[n]]);
		}
		var squareImg = new Image();
		squareImg.src = require.toUrl('../images/pinterest-logo.png');
		var square = Physics.body('rectangle', {
				x : Math.random() * (viewWidth - 10) + 10,
				y : Math.random() * (viewHeight - 10) + 10,
				mass : 3,
				vx : Math.random() * maxInitialSpeed - maxInitialSpeed / 2,
				vy : Math.random() * maxInitialSpeed - maxInitialSpeed / 2,
				width : 20,
				height : 20,
				restitution : 0.80,
				styles : {
					fillStyle : '#1c322f'
				},
				view : squareImg
			});
		square.gameType = 'square';
		world.add(square);

		// resize events
		window.addEventListener('resize', function () {

			viewWidth = window.innerWidth;
			viewHeight = window.innerHeight;

			renderer.el.width = viewWidth;
			renderer.el.height = viewHeight;

			viewportBounds = Physics.aabb(0, 0, viewWidth, viewHeight);
			// update the boundaries
			edgeBounce.setAABB(viewportBounds);

		}, true);

		//Gravity
		//world.add(Physics.behavior('constant-acceleration'));
		//world.render();

		world.add(Physics.behavior('body-collision-detection'));
		world.add(Physics.behavior('sweep-prune'));
		//world.add(Physics.behavior('constant-acceleration',{acc: { x : 0, y: 0.00004 } }));
		world.add(Physics.behavior('newtonian', {
				strength : 0.01
			}));

		var bounds = Physics.aabb(0, 0, viewWidth, viewHeight);
		world.add(Physics.behavior('edge-collision-detection', {
				aabb : bounds,
				restitution : 0.99
			}));
		// ensure objects bounce when edge collision is detected
		world.add(Physics.behavior('body-impulse-response'));

		// subscribe to ticker to advance the simulation
		Physics.util.ticker.on(function (time, dt) {
			world.step(time);
		});

		// start the ticker
		Physics.util.ticker.start();

		//Introducing the player.
		var ship = Physics.body('player', {
				x : 400,
				y : 100,
				vx : 0.08,
				radius : 30,
				mass : 5
			});
		ship.gameType = 'player';
		var playerBehavior = Physics.behavior('player-behavior', {
				player : ship
			});
		world.add([
				ship,
				playerBehavior]);

		//Introducing Verlet constraints.
		var rigidConstraints = Physics.behavior('verlet-constraints', {
				iterations : 3
			});
		var squareThing = [];
		var spacing = 20;
		var stiffness = 0.1;
		var nLength = 3;
		var mLength = 4;
		for (var n = 0; n < nLength; n++) {
			for (var m = 0; m < mLength; m++) {
				squareThing.push(Physics.body('circle', {
						x : spacing * n + 100,
						y : spacing * m + 100,
						mass : 1,
						radius : 7, //radius divide by 2
						restitution : 0.80,
						styles : {
							fillStyle : '#dc322f'
						}
					}));
				var currentIndex = mLength * n + m;
				if (n > 0) {
					// horizontal
					rigidConstraints.distanceConstraint(squareThing[currentIndex - mLength], squareThing[currentIndex], stiffness);
				}
				if (m > 0) {
					// vertical
					rigidConstraints.distanceConstraint(squareThing[currentIndex - 1], squareThing[currentIndex], stiffness);
					if (n > 0) {
						//diagonals
						rigidConstraints.distanceConstraint(squareThing[currentIndex - mLength - 1], squareThing[currentIndex], stiffness, Math.sqrt(2) * spacing);
						rigidConstraints.distanceConstraint(squareThing[currentIndex - mLength], squareThing[currentIndex - 1], stiffness, Math.sqrt(2) * spacing);
					}
				}
			}
		}
		// render
		world.on('render', function (data) {

			var constraints = rigidConstraints.getConstraints().distanceConstraints,
			c;

			for (var i = 0, l = constraints.length; i < l; ++i) {

				c = constraints[i];
				renderer.drawLine(c.bodyA.state.pos, c.bodyB.state.pos, '#4d4d4d');
			}
		});
		world.add(squareThing);
		world.add(rigidConstraints);

		world.on('win-game', function () {
			world.pause();
			document.body.className = 'win-game';
		});

	});
});
