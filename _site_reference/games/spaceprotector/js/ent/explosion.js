"use strict";
define(["colors", "sprites"], function (Colors, Sprites) {

	var expSpriteData = "v1.0:000000000000000000000000001110000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000001100000000000010000000001100000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000001000000000000100000000000010000000000100000000001000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000010000000000001000000000000010000000001000000000010000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000101000000000000000000000000000000000000000000000100000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000";
	var expSprite = Sprites.loadFramesFromData(expSpriteData);

	var Explosion = function (dir, owner, pos) {
		this.dir = dir;
		this.owner = owner;
		this.pos = pos;
		this.age = 0;
		this.maxAge = 20;
	  this.live = true;

	  this.update = function () {
	  	this.age++;
	  	if (this.age > this.maxAge)
	  		this.live = false;
	  };

	  this.draw = function (painter) {
		  if (this.live) {
				var frame = Math.floor(5 * this.age / this.maxAge);
				var color = this.owner === "player" ? Colors.good : Colors.bad;
				painter.drawSprite2(this.pos.x, this.pos.y, 5, this.dir, expSprite[frame], color);
			}
		}
	};
	return Explosion;
});