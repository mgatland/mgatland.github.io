"use strict";
define(["ent/shot", "events", "colors", "ent/walkingthing", "sprites", "dir", "pos", "util", "spritedata"], 
	function (Shot, Events, Colors, WalkingThing, Sprites, Dir, Pos, Util, SpriteData) {

	var Player = function (gs, x, y) {
		var _this = this;
		
		var startPos = new Pos(x, y);
		Util.extend(this, new WalkingThing(gs, startPos, new Pos(5,6)));

		//Replicated variables
		this.state = "falling";
		this.fallingTime = 0;
		this.loading = 0;
		this.refireRate = 15;
		this.dir = Dir.RIGHT;
		this.shotThisFrame = false;
		this.groundedY = this.pos.y;

		//todo replicated
		this.jumpHeldCounter = 0; 

		var spawnPoint = startPos.clone();
		var currentCheckpoint = null; //The flag entity we last touched

		var deadTimer = 0;
		var hitPos = null;
		var animFrame = 0;
		var animDelay = 0;

		var animState = "standing";
		var shootingAnim = false;
		var timeSinceLastShot = 0;

		var jumpIsQueued = false;
		var isSpringed = false;
		var respawnGlow = 0;

		this.toData = function () {
			var data = {};
			data.state = this.state;
			data.fallingTime = this.fallingTime;
			data.loading = this.loading;
			data.dir = Dir.toId(this.dir);
			data.shotThisFrame = this.shotThisFrame;
			data.groundedY = this.groundedY;

			data.spawnPoint = spawnPoint.toData();
			//currentCheckpoint
			data.deadTimer = deadTimer;
			data.hitPos = hitPos ? hitPos.toData() : null;
			data.animFrame = animFrame;
			data.animDelay = animDelay;
			data.animState = animState;
			data.shootingAnim = shootingAnim;
			data.timeSinceLastShot = timeSinceLastShot;
			data.jumpIsQueued = jumpIsQueued;
			data.isSpringed = isSpringed;
			data.respawnGlow = respawnGlow;

			WalkingThing.toData(this, data);
			return data;
		}

		this.fromData = function (data) {
			this.state = data.state;
			this.fallingTime = data.fallingTime;
			this.loading = data.loading;
			this.dir = Dir.fromId(data.dir);
			this.shotThisFrame = data.shotThisFrame;
			this.groundedY = data.groundedY;

			spawnPoint = Pos.fromData(data.spawnPoint);
			//currentCheckpoint
			deadTimer = data.deadTimer;
			hitPos = Pos.fromData(data.hitPos);
			animFrame = data.animFrame;
			animDelay = data.animDelay;
			animState = data.animState;
			shootingAnim = data.shootingAnim;
			timeSinceLastShot = data.timeSinceLastShot;
			jumpIsQueued = data.jumpIsQueued;
			isSpringed = data.isSpringed;
			respawnGlow = data.respawnGlow;

			WalkingThing.fromData(this, data);
		}

		//Constants or not replicated
		var maxDeadTime = 30;
		var playerSprites = Sprites.loadFramesFromData(SpriteData.player);
		this.hidden = false;

		//TODO: decide if replicated
		var deaths = 0;

		//functions

		var states = {

			jumping: new function () {
				var phases = [];
				phases[0] = {ySpeed: -2, normalDuration: 1, jumpHeldDuration: 4, jumpHoldMultiplier: [3,1,1,1]};
				phases[1] = {ySpeed: -1, normalDuration: 1, jumpHeldDuration: 16};
				phases[2] = {ySpeed: 0, normalDuration: 7};
				this.preupdate = function () {};
				this.update = function (jumpIsHeld) {
					animState = "jumping";
					var phase = phases[this.jumpPhase];

					if (isSpringed) jumpIsHeld = true; //forced by a spring.

					if (this.jumpHeldCounter > 0) this.jumpHeldCounter -= 1;
					if (jumpIsHeld) {
						this.jumpHeldCounter += 
							phase.jumpHoldMultiplier ? phase.jumpHoldMultiplier[this.jumpTime] : 1;
					}

					var jumpBoostActive = (this.jumpHeldCounter > 0);

					var speed = phase.ySpeed;
					var spaceAboveMe = this.tryMove(0, speed, gs);

					this.jumpTime++;
					var duration = (jumpBoostActive && phase.jumpHeldDuration) ? phase.jumpHeldDuration : phase.normalDuration;
					if (this.jumpTime >= duration) {
						this.jumpPhase++;
						this.jumpTime = 0;
					}
					if (!spaceAboveMe && this.jumpPhase < phases.length - 1) {
						this.jumpPhase = phases.length - 1;
						this.jumpTime = 0;
					}
					if (this.jumpPhase === phases.length) {
						this.state = "falling";
						this.fallingTime = 0;
					}
				};
			},

			falling: new function () {
				this.preupdate = function () {};
				this.update = function () {
					animState = "falling";
					if (this.isOnGround()) {
						Events.playSound("land", this.pos.clone());
						this.state = "grounded";
					} else {
						this.fallingTime++;
						var speed = this.fallingTime < 10 ? 1 : 2;
						this.tryMove(0,speed,gs);
					}
				};
			},

			grounded: new function () {
				this.preupdate = function () {
					if (jumpIsQueued) {
						beginJumpState();
						jumpIsQueued = false;
						Events.playSound("jump", this.pos.clone());
					}
					if (isSpringed) isSpringed = false;
				};
				this.update = function () {
					if (!this.isOnGround()) {
						this.fallingTime++;
						if (this.fallingTime >= 3) {
							this.state = "falling";
						}
					} else {
						this.fallingTime = 0;
					}
				};
			}
		};

		this.getFrame = function () {
			var frame;
			if (animState === "standing") {
				frame = 0;
			} else if (animState === "running") {
				frame = animFrame+1;
			} else if (animState === "falling" ) {
				frame = 5;
			} else if (animState === "jumping") {
				frame = 1;
			} else {
				console.log("Error animation state " + animState);
			}
			if (shootingAnim && frame === 0) frame = 6;
			return playerSprites[frame];
		}

		this.draw = function (painter) {
			if (this.hidden) return;
			var img = this.getFrame();
			var color = respawnGlow > 0 ? Colors.highlight : Colors.good;
			if (this.live) {
				painter.drawSprite2(this.pos.x, this.pos.y, this.size.x, 
					this.dir, img, color);
			} else {
				var decay = (maxDeadTime - deadTimer) / maxDeadTime;
				painter.drawSprite2(this.pos.x, this.pos.y, this.size.x, 
					this.dir, img, Colors.highlight, false, decay, hitPos);
			}	
		}

		this._shoot = function () {
			var pos = this.pos.clone();
			if (animState === "standing") {
				pos.moveXY(0, 1);
			}
			Events.shoot(new Shot(gs, pos, this.dir, "player"));
			Events.playSound("pshoot", this.pos.clone());
		}

		function beginJumpState() {
			_this.state = "jumping";
			_this.jumpTime = 0;
			_this.jumpPhase = 0;
			_this.jumpHeldCounter = 0;
		}

		var updateShooting = function(keys) {
			if (_this.loading > 0) _this.loading--;

			if (keys.shootHit || keys.shoot && _this.loading === 0) {
				_this.loading = _this.refireRate;
				_this._shoot();
				_this.shotThisFrame = true;
			} else {
				_this.shotThisFrame = false;
			}

			if (keys.shoot) {
				shootingAnim = true;
				timeSinceLastShot = 0;
			} else {
				timeSinceLastShot++;
				if (timeSinceLastShot > 30) shootingAnim = false;
			}
		}

		this.hurt = function (_hitPos) {
			_this.live = false;
			deadTimer = maxDeadTime;
			hitPos = _hitPos.clone().clampWithin(_this.pos, _this.size);
			deaths++;
			Events.playSound("pdead", null);
		}

		this.spring = function () {
			if (this.live && !isSpringed) {
				isSpringed = true;
				Events.playSound("spring", _this.pos.clone());
				beginJumpState();
			}			
		}

		this.update = function (keys) {
			
			if (this.hidden) return;

			if (!this.live) {
				if (deadTimer === 0) {
					this.live = true;
					this.pos = spawnPoint.clone();
					this.state = "falling";
					isSpringed = false;
					respawnGlow = 5;
				} else {
					deadTimer--;
				}
				return;
			}

			if (respawnGlow > 0) {
				respawnGlow--;
			}

			this.collisions.forEach(function (other) {
				if (_this.live === false) return; //so we can't die twice in this loop
				if (other.killPlayerOnTouch) {
					if (respawnGlow > 0) {
						//A hack to hurt the monster. fixme use a hurt method
						other.collisions.push(_this);
					} else {
						_this.hurt(other.pos);
					}
				}
				if (other.isCheckpoint && other !== currentCheckpoint) {
					if (currentCheckpoint) currentCheckpoint.selected = false;
					spawnPoint = other.pos.clone();
					currentCheckpoint = other;
					currentCheckpoint.selected = true;
					Events.playSound("checkpoint", _this.pos.clone());
				}
				if (other.isEnd) {
					Events.winLevel();
				}
			});
			this.collisions.length = 0;

			var movingDir = null;
			if (keys.left && !keys.right) {
				this.dir = Dir.LEFT;
				movingDir = Dir.LEFT;
				this.tryMove(-1,0,gs);
			} else if (keys.right && !keys.left) {
				this.dir = Dir.RIGHT;
				movingDir = Dir.RIGHT;
				this.tryMove(1,0,gs);
			}

			updateShooting(keys);

			if (isSpringed) {
				var unblocked = this.tryMove(2,0,gs);
				if (!unblocked) isSpringed = false;
			}

			//If you hit jump and hold it down, that hit gets queued.
			if (keys.jumpIsHit) {
				jumpIsQueued = true;
			} else {
				jumpIsQueued = jumpIsQueued && keys.jumpIsHeld;
			}

			getState().preupdate.call(this);

			getState().update.call(this, keys.jumpIsHeld);

			if (this.isOnGround() || this.pos.y > this.groundedY) {
				this.groundedY = this.pos.y;
			}

			if (this.state  === "grounded") {
				if (movingDir === null) {
					animState = "standing";
				} else {
					animState = "running";					
				}
			}

			if (animState !== "running") {
				animDelay = 0;
				animFrame = 3; //first frame when we start running after landing\standing still
			} else {
				animDelay++;
				if (animDelay >= 5) {
					animDelay = 0;
					animFrame++;
					if (animFrame === 4) animFrame = 0;
				}
			}
		}

		var getState = function () {
			return states[_this.state];
		}

		this.getDeaths = function () {
			return deaths;
		}

	}
	return Player;
});