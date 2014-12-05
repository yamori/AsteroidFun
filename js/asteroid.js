define(
	[
		'require',
		'physicsjs',
		'physicsjs/bodies/circle',
		'physicsjs/bodies/convex-polygon'
	],
	function (
		require,
		Physics) {
	// extend the circle body
	Physics.body('asteroid', 'circle', function (parent) {


		return {
			// we want to do some setup when the body is created
			// so we need to call the parent's init method
			// on "this"
			init : function (options) {
				parent.init.call(this, options);
			},
			// 'splode! This will remove the ship
			// and replace it with a bunch of random
			// triangles for an explosive effect!
			blowUp : function () {
				var self = this;
				var world = this._world;
				if (!world) {
					return self;
				}

				world.removeBody(this);
				return self;
			}
		};
	});
});
