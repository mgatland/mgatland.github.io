"use strict";

var Entity = function (pos, size) {
	this.pos = pos;
	this.size = size;
	this.live = true;

	this.collisions = []; //transient	
}
Entity.toData = function (ent, data) {
	data.pos = ent.pos.toData();
	data.size = ent.size.toData();
	data.live = ent.live;
}
Entity.fromData = function (entity, data) {
	entity.pos = Pos.fromData(data.pos);
	entity.size = Pos.fromData(data.size);
	entity.live = data.live;
}

var WalkingThing = function (level, pos, size) {
	extend(this, new Entity(pos, size));

	this.isAtCliff = function(dir, minHeight) {
		if (dir === Dir.RIGHT) {
			var frontFoot = new Pos(this.pos.x + this.size.x, this.pos.y + this.size.y);
		} else {
			var frontFoot = new Pos(this.pos.x, this.pos.y + this.size.y);
		}
		return (level.cellDepthAt(frontFoot) >= minHeight);
	}

	this.tryMove = function (x, y) {
		var ok = true;
		while (x != 0) {
			var sign = x > 0 ? 1 : -1;
			this.pos.x += sign;
			x -= sign;
			if (level.isColliding(this)) {
				this.pos.x -= sign;
				x = 0; //no more movement.
				ok = false;
			}
		}
		while (y != 0) {
			var sign = y > 0 ? 1 : -1;
			this.pos.y += sign;
			y -= sign;
			if (level.isColliding(this)) {
				this.pos.y -= sign;
				y = 0; //no more movement.
				ok = false;
			}
		}
		return ok;
	}
}
WalkingThing.toData = Entity.toData;
WalkingThing.fromData = Entity.fromData;

define(["shot"], function (Shot) {

	var crateSpriteData = "v1.0:100111000100010010001000100000000100100111000100010010001000100000000100010011101000100001000100010000001000100000000100000000000000000000000000100011100100010001001000100000000100101110000100010100001000100000000100010001111000100000100100010000001000100000000100000000000000000000000000100001110100010000101000100000000100100111000100010010001000100000000100010011101000100001000100010000001000100000000100000000000000000000000000100011100100010001001000100000000100100011100100010001001000100000000100010111001000100010000100010000001000100000000100000000000000000000000000100111000100010010001000100000000100100001110100010000101000100000000100011110001000100100000100010000001000100000000100000000000000000000000000101110000100010100001000100000000100100011100100010001001000100000000100010111001000100010000100010000001000100000000100000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000";
	var crateSprites = loadFramesFromData(crateSpriteData);
	var crateAnims = {
		walk: {frames: [0,1,2,3,4,5], delay: 4}
	};

	var flagSpriteData = "v1.0:000011111100000011111000000011111000000011111100000010000000000010000000000010000000000010000000000010000000011111111000000000000000000000000000";
	var flagSprites = loadFramesFromData(flagSpriteData);

	var endSpriteData = "v1.0:000000000000111111111100100000000100100000000100010000001000010000001000001000010000001000010000000100100000000111100000000000000000000000000000";
	var endSprites = loadFramesFromData(endSpriteData);

	var End = function (level, x, y) {
		extend(this, new Entity(new Pos(x, y), new Pos(10, 10)));
		this.isEnd = true;
		this.ignoreShots = true;
		this.update = function () {}
		this.draw = function (painter) {
			painter.drawSprite2(this.pos.x, this.pos.y, this.size.x, Dir.LEFT, endSprites[0], Colors.good);
		};
		this.toData = function () { return null};
		this.fromData = function () {/*not replicated*/};
	}

	var Flag = function (level, x, y) {
		extend(this, new Entity(new Pos(x, y), new Pos(10, 10)));

		this.isCheckpoint = true;
		this.selected = false;

		this.ignoreShots = true;

		this.update = function () {
		}
		this.draw = function (painter) {
			painter.drawSprite2(this.pos.x, this.pos.y, this.size.x, Dir.LEFT, flagSprites[0], this.selected ? Colors.highlight : Colors.good);
		};
		this.toData = function () { return null};
		this.fromData = function () {/*not replicated*/};
	}

	var walkerSpriteData = "v1.0:011111111000111110101000111111111000011110000000011110010000011111100000111110010000111110000000010100000000000000000000000000000000000000000000011111111000111110101000111111111000011110000000011110010000011111100000111110010000111110000000100010000000000000000000000000000000000000000000011111111000111110101000111111011000011110000000011110010000011111100000111110010000111110000000010100000000000000000000000000000000000000000000011111111000111110101000111111011000011110000000011110100000011111000000111110100000111110000000100010000000000000000000000000000000000000000000011111111000111110101000111111011000011110000000011110010000011111100000111110010000111110000000010100000000000000000000000000000000000000000000011111111000111110101000111111011000011110000000011110001000011111110000111110001000111110000000100010000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000";
	var walkerSprites = [];
	var walkerSprites = loadFramesFromData(walkerSpriteData);
	var walkerAnims = {
		walk: {frames: [0,1], delay: 5},
		stunned: {frames: [2], delay: 999},
		run: {frames: [2, 3, 4, 5], delay: 3}
	};

	var WalkMonster = function (level, x, y) {
		var _this = this;

		//constants
		var initialHealth = 5;
		var moveDelay = 5;
		var fastMoveDelay = 0;
		var maxAggro = 30;
		var stunDuration = 20;

		//state
		var moveTimer = 0;
		var aggro = 0; //includes stun time as well

		var onHit = function (collisions) {
			if (aggro === 0) {
				aggro = maxAggro + stunDuration;
				_this.startAnimation("stunned");
			} else {
				aggro = Math.max(aggro, maxAggro);
			}
		}

		var ai = function () {
			_this.tryMove(0,1); //gravity

			if (aggro > 0) {
				aggro--;
				if (aggro === maxAggro) {
					_this.startAnimation("run");
					moveTimer = 0; //sync with animation
				}
				if (aggro === 0) {
					_this.startAnimation("walk");
					moveTimer = 0; //sync with animation
				}
			}

			if (aggro > maxAggro) {
				//I'm so angry I can't move.
				return;
			}
			var delay = aggro > 0 ? fastMoveDelay : moveDelay
			if (moveTimer >= delay) {
				moveTimer = 0;
				var couldWalk = _this.tryMove(_this.dir.x,0);
				if (couldWalk === false) {
					_this.dir = _this.dir.reverse;
				} else if (_this.isAtCliff(_this.dir, 2)) {
					_this.dir = _this.dir.reverse;
				}
			} else {
				moveTimer++;
			}
		}

		this.toData = function () {
			var data = this.monsterToData();
			data.moveTimer = moveTimer;
			data.aggro = aggro;
			return data;
		}

		this.fromData = function (data) {
			this.monsterFromData(data);
			moveTimer = data.moveTimer;
			aggro = data.aggro;
		}

		extend(this, new Monster(level, x, y, 9, 9, walkerSprites, walkerAnims, ai, initialHealth, onHit));
		this.startAnimation("walk");
	}

	var shooterSpriteData = "v1.0:001110000000010101000000010111000000010101000000000100000000000100000000000100000000001110000000001010000000000000000000000000000000000000000000001110000000010101000000010111000000010101000000000100000000000100000000000100000000001111000000001000000000000000000000000000000000000000000000001110000000010101000000010111000000010101000000000100000000000100000000000100000000001110000000001010000000000000000000000000000000000000000000001110000000010101000000010111000000010101000000000100000000000100000000000100000000011110000000000010000000000000000000000000000000000000000000001110000000010101000000010111000000010101000000000100000000000100000000000110000000001110000000001010000000000000000000000000000000000000000000001110000000010101000000010111000000010101000000000100000000000110000000000110000000001110000000001010000000000000000000000000000000000000000000001110000000010101000000010111000000010101000000000110000000000110000000000100000000001110000000001010000000000000000000000000000000000000000000001110000000010101000000010111000000010101000000000111000000000111000000000100000000001110000000001010000000000000000000000000000000000000000000000000000000001110000000010101000000010111000000010101100000000111000000000100000000001110000000001010000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000";
	var shooterSprites = loadFramesFromData(shooterSpriteData);
	var shooterAnims = {
		walk: {frames: [0, 1, 2, 3], delay: 5}, 
		shoot: {frames: [4, 5, 6, 7, 8], delay: 60/5} //refireDelay / frames.length
	};

	var ShootMonster = function (level, x, y) {
		var _this = this;
		//constants
		var maxWalkingTime = 90;
		var maxShotsInARow = 5;
		var moveDelay = 5;
		var refireDelay = 60;

		//state TODO: Replicate
		var refireTimer = refireDelay;
		var action = "shooting";
		var moveTimer = 0;
		var shotsInARow = 0;
		var walkingTime = 0;

		var ai = function () {
			_this.tryMove(0,1); //gravity

			if (action === "walking") {
				if (moveTimer === 0) {
					moveTimer = moveDelay;
					var couldWalk = _this.tryMove(_this.dir.x,0);
					if (couldWalk === false) {
						_this.dir = _this.dir.reverse;
					} else if (_this.isAtCliff(_this.dir, 2)) {
						_this.dir = _this.dir.reverse;
					}
				} else {
					moveTimer--;
				}
				walkingTime++;
				if (walkingTime > maxWalkingTime) {
					action = "shooting";
					refireTimer = refireDelay;
					shotsInARow = 0;
					_this.startAnimation("shoot");
				}
			}

			if (action === "shooting") {
				if (refireTimer === 0) {
					Events.shoot(new Shot(level, _this.pos.clone().moveXY(0, _this.size.x/2), _this.dir, "monster"));
					Events.playSound("mshoot", _this.pos.clone());
					refireTimer = refireDelay;
					shotsInARow++;
					_this.startAnimation("shoot"); //force animation to stay in sync with actual firing.
					if (shotsInARow === maxShotsInARow) {
						action = "walking";
						walkingTime = 0;
						_this.startAnimation("walk");
					}
				} else {
					refireTimer--;
				}
			}
		}

		this.toData = function () {
			var data = this.monsterToData();
			data.refireTimer = refireTimer;
			data.action = action;
			data.walkingTime = walkingTime;
			data.shotsInARow = shotsInARow;
			data.moveTimer = moveTimer;
			return data;
		}

		this.fromData = function (data) {
			this.monsterFromData(data);
			refireTimer = data.refireTimer;
			action = data.action;
			walkingTime = data.walkingTime;
			shotsInARow = data.shotsInARow;
			moveTimer = data.moveTimer;
		}

		extend(this, new Monster(level, x, y, 7, 9, shooterSprites, shooterAnims, ai, 1));
		this.startAnimation("shoot");
	}

	var Monster = function (level, x, y, width, height, sprites, anims, ai, health, onHit) {

		//constants
		this.killPlayerOnTouch = true;

		//state
		extend(this, new WalkingThing(level, new Pos(x, y), new Pos(width, height)));

		this.isNetDirty = true;
		this.health = health;

		this.dir = Dir.LEFT;
		var deadTime = 0;
		var anim = "walk"; //default
		var animFrame = 0;
		var animDelay = 0;

		this.monsterToData = function () {
			var data = {};
			data.health = this.health;
			data.dir = Dir.toId(this.dir);
			data.deadTime = deadTime;
			data.anim = anim;
			data.animFrame = animFrame;
			data.animDelay = animDelay;
			Entity.toData(this, data);
			return data;
		}

		this.monsterFromData = function (data) {
			this.health = data.health;
			this.dir = Dir.fromId(data.dir);
			deadTime = data.deadTime;
			anim = data.anim;
			animFrame = data.animFrame;
			animDelay = data.animDelay;
			Entity.fromData(this, data);
		}

		//override me with your custom data
		this.toData = function () {
			var data = this.monsterToData();
			//your custom data
			return data;
		}

		//override me with your custom data
		this.fromData = function (data) {
			this.monsterFromData(data);
			//your custom data
		}

		var getAnimation = function () {
			if (anims === null) return {frames: [0], delay: 0};
			return anims[anim];
		}

		this.startAnimation = function(newAnim) {
			anim = newAnim;
			animFrame = 0;
			animDelay = 0;
		}

		this.update = function () {
			if (this.live === false) {
				if (deadTime < 30) deadTime++;
				return;
			}

			animDelay++;
			if (animDelay > getAnimation().delay) {
				animDelay = 0;
				animFrame++;
				if (animFrame >= getAnimation().frames.length) {
					animFrame = 0;
				}
			}

			if (ai) ai();

			if (this.collisions.length > 0) {
				this.health--;
				if (onHit) onHit();
				this.collisions.length = 0;
				if (this.health == 0) { 
					this.live = false;
					Events.playSound("mdead", this.pos.clone());
					return;
				} else {
					Events.playSound("mhit", this.pos.clone());
				}
			}
		};

		this.draw = function (painter) {
			if (this.live === false) {
				if (deadTime < 30) {
					painter.drawSprite2(this.pos.x, this.pos.y, this.size.x, this.dir, sprites[getAnimation().frames[animFrame]], Colors.highlight);
				}
				return;
			}
			painter.drawSprite2(this.pos.x, this.pos.y, this.size.x, this.dir, sprites[getAnimation().frames[animFrame]], Colors.bad);
		};
	};

	Monster.create1 = function (level, x, y) {
		return new ShootMonster(level, x, y);
	};
	Monster.create2 = function (level, x, y) {
		return new WalkMonster(level, x, y);
	};
	Monster.createCrate = function (level, x, y) {
		return new Monster(level, x, y, 10, 10, crateSprites, crateAnims, null, 1);
	};
	Monster.createFlag = function (level, x, y) {
		return new Flag(level, x, y);
	};
	Monster.createEnd = function (level, x, y) {
		return new End(level, x, y);
	};

	return Monster;
});