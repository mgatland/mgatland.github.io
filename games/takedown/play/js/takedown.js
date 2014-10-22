"use strict";
var TakeDown = function () {

	//globals
	var screen = {
		width: 25,
		height: 17,
		tileSize: 30,
		hudHeight: 64
	};

	var dir = {
		NONE: 0,
		UP: 1,
		LEFT: 2,
		DOWN: 3,
		RIGHT: 4
	};

	var messageTextDelay = 50;

	var track = function (action, label, number) {
		console.log("_trackEvent: " + action + ", " + label + ", " + number);
		try {
			_gaq.push(['_trackEvent',"takedown_ingame", action, ""+label, number]);;
		} catch (e) {

		}
	}

	var hideElement = function (el) {
		el.style.display = "none";
	}

	var showElement = function (el) {
		el.style.display = "";
	}

	dir.random = function () {
		switch (Math.floor(Math.random() * 4)) {
			case 0: return dir.UP;
			case 1: return dir.RIGHT;
			case 2: return dir.DOWN;
			case 3: return dir.LEFT;
		}
	};

	dir.adjacentDirs = function (face) {
		switch (face) {
			case dir.UP:
			case dir.DOWN: return [dir.LEFT, dir.RIGHT];
			case dir.LEFT:
			case dir.RIGHT: return [dir.UP, dir.DOWN];
		}
		console.log("error: finding adjacent dirs for unnatural dir " + face);
		return [dir.UP, dir.DOWN, dir.lEFT, dir.RIGHT];
	}

	dir.name = function (face) {
		switch (face) {
			case 1: return "UP";
			case 2: return "RIGHT";
			case 3: return "DOWN";
			case 4: return "LEFT";
			case 0: return "NONE";
		}
		return "ERROR: dir " + face;
	}

	//AI globals to un-globalify
	var maxCanSee = 25 * 2;
	var suspicionBehindMulti = 0.2;
	var maxDeadTime = 25;

	var Assets = function () {
		var itemsToLoad = 0;

	    var loadImage = function (name) {
	        itemsToLoad++;
	        var image = new Image();
	        image.onload = function () {
	            itemHasLoaded(name);
	        }
	        image.src = name;
	        return image;
	    };

	    var onAllLoaded;

	    var itemHasLoaded = function (name) {
	    	console.log("loaded " + name);
	    	itemsToLoad--;
	    	if (itemsToLoad == 0) {
	    		console.log("Loaded all assets");
	    		onAllLoaded();
	    	}
	    }

	    this.load = function (callback) {
	    	onAllLoaded = callback;
		    var itemsToLoad = 0;
			this.deadImage = loadImage("res/gfx/dead.png");
			this.decImage = loadImage("res/gfx/dec.png");
			this.effectsImage = loadImage("res/gfx/effects.png");
			this.groundImage = loadImage("res/gfx/ground.png");
			this.humanImage = loadImage("res/gfx/human.png");
			this.shotImage = loadImage("res/gfx/shots.png");
	    }
	}

	var canvas;
	var ctx;

	var heatOnFiring = 20;
	var gunKick = 0;

	var Pos = function (x, y) {
		this.x = x;
		this.y = y;

		this.equals = function(other) {
			return (this.x === other.x && this.y === other.y);
		}

		this.clone = function() {
			return new Pos(this.x, this.y);
		}

		//TODO: manhatten mode is never used, remove it?
		//It was used for enemy movement before we had pathfinding
		this.dirTowards = function(other, manhatten) {
			if (manhatten !== true) {
				manhatten = false;
			}
			var dX = this.x - other.x;
			var dY = this.y - other.y;
			var dirTowards = dir.NONE;
			if (this.equals(other)) {
				return dir.NONE;
			}
			var xIsLargest = (Math.abs(dX) > Math.abs(dY));
			var yIsLargest = (Math.abs(dY) > Math.abs(dX));
			if (dX != 0 &&
				((xIsLargest && !manhatten) || (yIsLargest && manhatten) || dY == 0)) {
				if (dX > 0) {
					dirTowards =  dir.LEFT;
				} else {
					dirTowards = dir.RIGHT;
				}
			} else {
				if (dY > 0) {
					dirTowards = dir.UP;
				} else {
					dirTowards = dir.DOWN;
				}
			}
			return dirTowards;
		}

		this.dirOnPathTowards = function (other, map) {
			return this.dirOnPathTowardsAvoiding(other, map, null);
		}

		//next step in the walkable path from here to there
		this.dirOnPathTowardsAvoiding = function(other, map, avoidPos, dangerDistance) {

			if (this.equals(other)) {
				return dir.NONE;
			};

			//ok, here goes... calculate the cost to walk from every square to the other pos
			var thisStep = [];
			var nextStep = [];
			var closed = [];
			thisStep.push(other);
			var cost = 0;
			var finished = false;
			while (!finished && (thisStep.length > 0 || nextStep.length > 0)) {
				if (thisStep.length === 0) {
					thisStep = nextStep;
					nextStep = [];
					cost++;
				}
				var next = thisStep.pop();
				var key = next.x + ":" + next.y;
				var existingValue = closed[key];
				if (existingValue === null || existingValue === undefined || existingValue > cost) {
					if (map.canMove(next) && (avoidPos == null || avoidPos.trueDistanceTo(next) > dangerDistance)) {
						closed[key] = cost;
						nextStep.push(new Pos(next.x + 1, next.y));
						nextStep.push(new Pos(next.x - 1, next.y));
						nextStep.push(new Pos(next.x, next.y + 1));
						nextStep.push(new Pos(next.x, next.y - 1));
					}
				}
				if (next.equals(this)) {
					finished = true; //we have found the shortest path.
				}
			}
			//now we have our path, which of our possible moves is the best?
			var options = []; //the index of this array is special, it's the direction to move
			options[dir.NONE] = 10000;
			options[dir.UP] = closed[(this.x) + ":" + (this.y - 1)];
			options[dir.LEFT] = closed[(this.x - 1) + ":" + (this.y)];
			options[dir.DOWN] = closed[(this.x) + ":" + (this.y + 1)];
			options[dir.RIGHT] = closed[(this.x + 1) + ":" + (this.y)];

			var bestSoFar = 10000 - 1;
			var bestDir = 0;
			for (var i = 0; i < 5; i++) {
				if (options[i] != undefined && options[i] < bestSoFar) {
					bestSoFar = options[i];
					bestDir = i;
				}
			}
			return bestDir;
		}

		this.moveInDir = function (face, distance) {
			if (face === dir.UP) this.y -= distance;
			if (face === dir.RIGHT) this.x += distance;
			if (face === dir.DOWN) this.y += distance;
			if (face === dir.LEFT) this.x -= distance;
			return this; //for chaining
		}

		//warning: returns a non-integer //TODO: consider returning an int
		this.trueDistanceTo = function(other) {
			return Math.sqrt(
				(this.x-other.x)*(this.x-other.x) +
				(this.y-other.y)*(this.y-other.y)
				);
		}

		this.floor = function () {
			this.x = Math.floor(this.x);
			this.y = Math.floor(this.y);
			return this; //for chaining
		}

		this.toString = function () {
			return "(" + this.x + "," + this.y + ")";
		}


	}

	var Camera = function (startPos, mapWidth, mapHeight) {
		var pos = startPos.clone();
		var maxX = mapWidth;
		var maxY = mapHeight;

		var scrollSpeed = function(dist) {
			if (dist <1) return 0.1;
			if (dist < 5) return 0.2;
			if (dist < 9) return 0.3;
			return 0.5;
		};

		//public
		this.xOff = function () {
			var xOff = (pos.x - screen.width / 2);
			if (xOff < 0) xOff = 0;
			if (xOff > maxX - screen.width) xOff = maxX - screen.width;
			return Math.floor(xOff * screen.tileSize);
		};

		this.yOff = function() {
			var yOff = (pos.y - screen.height / 2);
			if (yOff < 0) yOff = 0;
			if (yOff > maxY - screen.height) yOff = maxY - screen.height;
			return Math.floor(yOff * screen.tileSize);
		};

		this.setPos = function(target) {
			pos = target.clone();
		}

		this.update = function(target) {
			var xDist = Math.abs(pos.x - target.x);
			var xSpeed = scrollSpeed(xDist);
			if (target.x > pos.x) pos.x += xSpeed;
			if (target.x < pos.x) pos.x -= xSpeed;

			var yDist = Math.abs(pos.y - target.y);
			var ySpeed = scrollSpeed(yDist);
			if (target.y > pos.y) pos.y += ySpeed;
			if (target.y < pos.y) pos.y -= ySpeed;
		}
	};

	var PlayerAI = function () {
		this.moveDir = dir.NONE;
		this.fireDir = dir.NONE;
		this.fireMode = -1;

		this.move = function(world) {
			return this.moveDir;
		}

		this.shoot = function(world) {
			return {dir: this.fireDir, mode: this.fireMode};
		}

		this.setOwner = function () {}; //ignore
		this.update = function () {}; //ignore
		this.setState = function () {}; //ignore
		this.makeAllAware = function () {};
	}

	/* AT States:

	    Waiting
	       |
	    Startled
	       |
	       V
		Pursuing  <-> Fighting <-> Surrounding

	When combat is over, any combat state transitions to Waiting
	If line of sight is lost, any combat state transitions to Pursuing

	*/

	//Waiting now includes patrolling as well...
	var Waiting = function () {

		var patrolPos = null;
		var patrolEndAction = "";

		this.name = "Waiting";
		this.update = function (ai, owner, world, target) {
			if (ai.isAwareOfEnemies(world)) {
				ai.setState(new Startled());
				if (!ai.isAllAware()) world.audio.playVoice(world.audio.seen);
			}
		}

		this.move = function (ai, owner, world, target) {
			if (patrolPos && patrolPos.equals(owner.pos)) {
				patrolPos = null;
				if (patrolEndAction === 'seek') {
					ai.makeAllAware();
				}
				patrolEndAction = '';
			}
			if (patrolPos === null) {
				return dir.NONE;
			}
			return owner.pos.dirOnPathTowards(patrolPos, world.map);
		}

		//only for Waiting state
		this.patrolTo = function (pos, endAction) {
			patrolPos = pos;
			patrolEndAction = endAction;
		}
	}

	var Startled = function () {
		this.name = "Startled";
		this.disableShooting = true;
		this.disableMoving = true;

		var timer = 0;
		this.update = function (ai, owner, world, target) {
			timer++;
			if (timer > 17 - owner.type.skill / 10) {
				ai.setState(new Pursuing());
			}
		}

		this.move = function (ai, world, target) {
			return dir.NONE;
		}
	}

	var Pursuing = function () {
		this.name = "Pursuing";
		this.update = function (ai, owner, world, target) {
			if (target === null || target.live === false) {
				ai.setState(new Waiting());
				return;
			}
			var distance = owner.pos.trueDistanceTo(target.pos);
			if (distance < owner.type.fightDistMax && ai.getCanSee(target.index) > 5) {
				ai.setState(new Fighting());
			}
		}

		this.move = function (ai, owner, world, target) {
			if (target == null) return dir.NONE;
			return owner.pos.dirOnPathTowards(target.pos, world.map);
		}
	}

	//must check isValid after construction
	var Surrounding = function (owner, world, target) {
		this.name = "Surrounding";

		//initialize, choose which way to surround
		var dirTowards = owner.pos.dirTowards(target.pos, false);
		var dirsToTry = dir.adjacentDirs(dirTowards);
		var clearDirs = [];
		var movesAllowed = 10; //abort after 10 moves, just to avoid us getting stuck
		var distanceRequired = 4;
		dirsToTry.forEach(function (face) {
			var pos = target.pos.clone();
			var clearDistanceFromTarget = 0;
			while (clearDistanceFromTarget < distanceRequired && world.map.canMove(pos)) {
				pos.moveInDir(face, 1);
				clearDistanceFromTarget++;
			}
			if (clearDistanceFromTarget === distanceRequired) clearDirs.push(face);
		});

		var failed = (clearDirs.length === 0); //if this fialed, we will abort this state on next update

		if (!failed) {
			var bestDir = clearDirs[Math.floor(Math.random() * clearDirs.length)];
			console.log("dir: " + dir.name(bestDir));
			var destination = target.pos.clone().moveInDir(bestDir, distanceRequired);
		}

		this.isValid = function () {
			return !failed;
		}

		this.update = function (ai, owner, world, target) {
			if (owner.pos.trueDistanceTo(destination) < 3 || movesAllowed <= 0) {
				ai.setState(new Fighting());
				return;
			}
			if (target === null || target.live === false) {
				ai.setState(new Waiting());
				return;
			}
		};

		this.move = function (ai, owner, world, target) {
			if (target == null) return dir.NONE;
			movesAllowed--;
			return owner.pos.dirOnPathTowardsAvoiding(destination, world.map, target.pos, 2);
		};
	}

	var Fighting = function () {
		var minMovesUntilTactics = 5;
		var movesUntilTactics = Math.floor(Math.random() * minMovesUntilTactics + minMovesUntilTactics);
		this.name = "Fighting";
		this.update = function (ai, owner, world, target) {
			if (target === null || target.live === false) {
				ai.setState(new Waiting());
				return;
			}

			var distance = owner.pos.trueDistanceTo(target.pos);
			if (distance > owner.type.fightDistMax + 4 || ai.getCanSee(target.index) < 1) {
				ai.setState(new Pursuing());
				return;
			}

			if (movesUntilTactics <= 0) {
				var tactic = new Surrounding(owner, world, target);
				if (tactic.isValid()) {
					ai.setState(tactic);
					return;
				} else {
					movesUntilTactics = minMovesUntilTactics * 2;
				}
			}
		};

		//We might move randomly in either of the given directions,
		//Or we might decide to close the difference and try to get in line with our opponent
		//if difference is > 0, that means dirUp will close the gap.
		//if difference is < 0, that means dirDown will close the gap.
		var dodgeMove = function (difference, dirUp, dirDown) {
			if (Math.random() > 0.75 || difference == 0) { //move randomly
				return (Math.random() > 0.5) ? dirUp : dirDown;
			} else { //or move towards the firing line
				return (difference > 0) ? dirUp : dirDown;
			}
		};

		this.move = function (ai, owner, world, target) {
			if (target == null) return dir.NONE;
			movesUntilTactics--;
			var dX = Math.abs(owner.pos.x - target.pos.x);
			var dY = Math.abs(owner.pos.y - target.pos.y);
			if (dX == dY) return dir.random();
			if (dX > dY) return dodgeMove(owner.pos.y - target.pos.y, dir.UP, dir.DOWN);
			return dodgeMove(owner.pos.x - target.pos.x, dir.LEFT, dir.RIGHT);
		};
	}

	var AI = function () {
		var owner = null; //must be set by Person

		var iCanSee = []; //how long we've had line of sight to player i
		var suspicion = []; //how much we suspect player i exists
		var aware = []; // Awareness type

		var state = null; //must be set by Person
		var allAware = false;

		var updateMyTarget = function (world) {

			var myEnemies = world.enemies.filter(function (e) { return e.live === true && e.team != owner.team && awareOf(e.index)});
			var bestDist = null;
			var bestNewTargetIndex = null;
			myEnemies.forEach(function (e) {
				var dist = owner.pos.trueDistanceTo(e.pos);
				//if it's our current target, it gets a selection bonus
				if (owner.targetIndex != null && owner.targetIndex == e.index) dist -= 4;
				//bonus for enemies we can see
				if (iCanSee[e.index] > 0) dist -= 4;
				if (bestDist == null || dist < bestDist) {
					bestDist = dist;
					bestNewTargetIndex = e.index;
				}
			});
			owner.targetIndex = bestNewTargetIndex;
		}

		//called by scripting
		this.patrolTo = function (pos, endAction) {
			if (state.patrolTo) {
				state.patrolTo(pos, endAction);
			}
		}

		this.setState = function (newState) {
			state = newState;
		}

		this.setOwner = function (o) {
			if (owner !== null) throw "Error, setting AI owner twice";
			owner = o;
		}

		this.makeAllAware = function () {
			allAware = true;
		}

		//methods used by AI states
		this.isAllAware = function () {
			return allAware;
		}

		//am I aware of any of my enemies
		this.isAwareOfEnemies = function (world) {
			var anyAware = false;
			var myEnemies = world.enemies.filter(function (e, i) { return e.live === true && e.team != owner.team});
			myEnemies.forEach(function (e) {
				var i = e.index;
				if (awareOf(i)) anyAware = true;
			});
			return anyAware;
		}

		this.getCanSee = function (i) {
			return iCanSee[i];
		}

		// end of

		var addSuspicion = function(amount, i) {
			suspicion[i] += amount;
			if (suspicion[i] >= 300 && aware[i] === false) {
				aware[i] = true;
			}
		}

		var reduceSuspicion = function(amount, i) {
			suspicion[i] -= amount;
			if (suspicion[i] < 0) suspicion[i] = 0;
		}

		var awareOf = function (whoIndex) {
			return aware[whoIndex];
		}

		//You have aleady done a line of sight check
		//this adds suspicion from 1 to 10 * the suspicousness argument, based on distance
		//suspicion is reduced if the thing is behind me
		this.seeSuspiciousThing = function (pos, suspicousness, suspectIndex) {
			var dist = owner.pos.trueDistanceTo(pos);
			var suspicionPoints = Math.max((10 - dist), 1) * suspicousness;
			if (owner.facingAwayFrom(pos)) suspicionPoints *= suspicionBehindMulti;
			addSuspicion(Math.floor(suspicionPoints), suspectIndex);
		};

		this.update = function (world) {

			var that = this;

			//for each enemy who's not me
			var people = world.enemies.filter(function (e, i) { return e.live === true && e != owner});
			people.forEach(function (e) {
				var i = e.index;
				//TODO: perf: only initialize once, then never do this check again.
				if (iCanSee[i] === undefined) {
					iCanSee[i] = 0;
					suspicion[i] = 0;
					aware[i] = false;
					//we are always aware of teammates
					if (e.team === owner.team) aware[i] = true;
				}

				//update canSee
				var canSeeNow = world.map.canSee(owner.pos, e.pos);
				if (canSeeNow) {
					if (iCanSee[i] < maxCanSee) iCanSee[i] += 1;
				} else {
					if (iCanSee[i] > 0) iCanSee[i] -= 1;
				}

				//update suspicion, unless we're already aware of them
				if (!awareOf(i)) {

					if (allAware) addSuspicion(999, i); //instant awareness.

					if (canSeeNow) {
						that.seeSuspiciousThing(e.pos, 6, i);
					} else {
						reduceSuspicion(1, i);
					}
				} else { //we are aware of them; are we aware of their target?
					if (e.targetIndex != null && aware[e.targetIndex] === false) {
						if (canSeeNow) {
							that.seeSuspiciousThing(e.pos, 6, e.targetIndex);
						}
					}
				}
			});

			world.shots.forEach(function (s) {
				if (s.live === false) return;
				if (s.ownerIndex === owner.index) return;

				//this if condition is just for performance
				if (!awareOf(s.ownerIndex) || s.targetIndex != null && !awareOf(s.targetIndex)) {
					var canSee = world.map.canSee(owner.pos, s.pos);
					if (canSee) {
						that.seeSuspiciousThing(s.pos, 50, s.ownerIndex);
						if (s.targetIndex != null) that.seeSuspiciousThing(s.pos, 50, s.targetIndex);
					}
				}
			});

			world.explosions.forEach(function (e) {
				if (e.live === false) return;
				if (e.ownerIndex === owner.index) return;
				if (awareOf(e.ownerIndex) && (e.targetIndex == null || awareOf(e.targetIndex))) return;

				var canSee = world.map.canSee(owner.pos, e.pos);
				if (canSee) {
					that.seeSuspiciousThing(e.pos, 25, e.ownerIndex);
				}
				if (e.age === 0) {
					//and sound (which travels through walls)
					var dist = owner.pos.trueDistanceTo(e.pos);
					var amount = Math.max(3.5 - dist, 0) * 210;
					addSuspicion(Math.floor(amount), e.ownerIndex);
					if (e.targetIndex != null) addSuspicion(Math.floor(amount), e.targetIndex);
				}
			});

			updateMyTarget(world);

			var myTarget = getMyTarget(world);
			state.update(this, owner, world, myTarget);
		}

		this.move = function(world) {
			var myTarget = getMyTarget(world);
			var plannedMove = state.move(this, owner, world, myTarget);
			if (state.disableMoving) return dir.NONE;
			//based on danger, we might decide not to use our planned move.
			var bestMove = 0;
			var bestScore = -999;
			var clumsy = (this.isAwareOfEnemies(world) === false) || (Math.random() * 110 > owner.type.skill);
			for (var i = 0; i <= 4; i++) {
				var movedPos = owner.pos.clone().moveInDir(i, 1);
				if (!world.map.canMove(movedPos) || (world.personAt(movedPos) && !movedPos.equals(owner.pos))) continue; //can't move here
				var moveScore = 0;
				if (i === dir.NONE && i != plannedMove) moveScore += 0.5; // standing still usually beats pointless movement.
				if (i === plannedMove) moveScore += 4;
				if (!clumsy) moveScore -= world.getDangerAt(owner.team, movedPos); //I usually spot danger, but occasionally forget to look

				//random variation
				moveScore += Math.random() * 1.0;
				if (moveScore > bestScore) {
					bestScore = moveScore;
					bestMove = i;
				}
			}
			//if (bestMove != plannedMove) console.log("dodged!");
			return bestMove;
		}

		var NO_SHOOT = {dir: dir.NONE, mode: -1};

		var getMyTarget = function (world) {
			return owner.targetIndex === null ? null : world.enemies[owner.targetIndex];
		}

		this.shoot = function(world) {
			var myTarget = getMyTarget(world);
			if (myTarget === null || myTarget.live === false) return NO_SHOOT;

			var shootDir = owner.pos.dirTowards(myTarget.pos, false);
			if (shootDir == dir.NONE) return NO_SHOOT;

			//From now on, even if we don't shoot, we'll face the right way
			var aimButDontShoot = {dir: shootDir, mode: -1};

			if (state.disableShooting) return aimButDontShoot;

			//1. Is there a clear shot? Is there a straight or L-shaped path from me to the player?
			if (shootDir == dir.LEFT || shootDir == dir.RIGHT) {
				var startX = owner.pos.x;
				var endX = myTarget.pos.x;
				var startPos = new Pos(startX, owner.pos.y);
				var midPos = new Pos(endX, owner.pos.y);
			} else {
				var startY = owner.pos.y;
				var endY = myTarget.pos.y;
				var startPos = new Pos(owner.pos.x, startY);
				var midPos = new Pos(owner.pos.x, endY);
			}
			var canSee1 = world.map.canSee(startPos, midPos);
			var canSee2 = world.map.canSee(midPos, myTarget.pos)
			if (!canSee1 || !canSee2) {
				//Cosmetic - we face the player if we can see them but otherwise look where we're going
				if (iCanSee[myTarget.index] < 5) {
					return NO_SHOOT;
				}
				return aimButDontShoot;
			}

			//2. Is this shot close enough? Either straight, or the player might walk sideways into it?
			var xDist = Math.abs(owner.pos.x - myTarget.pos.x);
			var yDist = Math.abs(owner.pos.y - myTarget.pos.y);
			if (shootDir == dir.LEFT || shootDir == dir.RIGHT) {
				var dist = xDist;
				var missAmount = yDist;
			} else {
				var dist = yDist;
				var missAmount = xDist;
			}
			if (dist < 5 && missAmount > 1) return aimButDontShoot;
			if (dist < 10 && missAmount > 2) return aimButDontShoot;
			if (dist < 15 && missAmount > 3) return aimButDontShoot;
			if (missAmount > 4) return aimButDontShoot;

			//Cool, let's shoot then.
			return {dir: shootDir, mode: 2};
		}
	}

	var shotTypes = [];
	shotTypes[0] = {damage: 4, moveSpeed: 1, skin: 0}; //blue normal player shot
	shotTypes[1] = {damage: 2, moveSpeed: 1, skin: 2}; //red tiny enemy shot
	shotTypes[2] = {damage: 5, moveSpeed: 0, skin: 3}; // purple supershot
	shotTypes[3] = {damage: 6, moveSpeed: 0, skin: 1}; // unused
	shotTypes[4] = {damage: 2, moveSpeed: -1, skin: 2}; // instant hit enemy shot

	//player
	var playerType = {health: 10, shootSpeed: 14, moveSpeed: 4, skin: 0, shotType: 0, skill: 99, fightDistMax: 10, fightDistMin: 3, team: 0};

	var playerGuns = [];
	playerGuns[0] = {heatIncrease: 20, shotType: 0, shootSpeed: 14, kick: 0};
	playerGuns[1] = {heatIncrease: 35, shotType: 2, shootSpeed: 22, kick: 15};

	var enemyTypes = [];
	enemyTypes[1] = {health:  4, shootSpeed: 40, moveSpeed: 8, skin: 1, shotType: 1, skill: 50, fightDistMax: 7, fightDistMin: 2, team: 1 }; //grunt
	enemyTypes[3] = {health: 10, shootSpeed: 40, moveSpeed: 8, skin: 2, shotType: 1, skill: 50, fightDistMax: 7, fightDistMin: 2, team: 1 }; //armoured
	enemyTypes[5] = {health:  4, shootSpeed: 15, moveSpeed: 8, skin: 3, shotType: 1, skill: 50, fightDistMax: 7, fightDistMin: 2, team: 1 }; //rapid fire
	enemyTypes[7] = {health: 10, shootSpeed: 30, moveSpeed: 8, skin: 4, shotType: 0, skill: 70, fightDistMax: 9, fightDistMin: 2, team: 1 }; //commando
	enemyTypes[9] = {health: 12, shootSpeed: 20, moveSpeed: 4, skin: 5, shotType: 2, skill: 85, fightDistMax: 10, fightDistMin: 3, team: 1}; //elite commando
	enemyTypes[11] = {health: 4, shootSpeed: 30, moveSpeed: 8, skin: 6, shotType: 4, skill: 65, fightDistMax: 20, fightDistMin: 4, team: 1}; //sniper
	//teammate
	enemyTypes[13] = {health: 10, shootSpeed: 16, moveSpeed: 5, skin: 8, shotType: 0, skill: 100, fightDistMax: 9, fightDistMin: 2, team: 0};

	var Person = function (pos, face, ai, type) {
		this.type = type;
		this.moved = 0;
		this.face = face;
		this.shot = 0;
		this.heat = 0;
		this.maxHeat = 120;
		this.pos = pos.clone();
		this.live = true;
		this.health = type.health;
		this.team = type.team;
		this.ai = ai;
		this.index = null;
		this.targetIndex = null;
		ai.setOwner(this);
		ai.setState(new Waiting());
		this.deadTimer = 0;

		this.idleTimer = 0;
	}

	Person.prototype.facingAwayFrom = function (pos) {
		switch (this.face) {
			case dir.UP: return pos.y < this.pos.y;
			case dir.DOWN: return pos.y > this.pos.y;
			case dir.LEFT: return pos.x > this.pos.x;
			case dir.RIGHT: return pos.x < this.pos.x;
			case dir.NONE: return false; //weird case
		}
	}

	Person.prototype.update = function (world) {
		if (this.health <= 0) {
			this.deadTimer--;
			if (this.deadTimer <= 0) {
				this.live = false;
			}
			return;
		}

		this.ai.update(world);

		if (this.moved > 0) {
			this.moved--;
		} else {
			var moveDir = this.ai.move(world);
			if (moveDir > 0) {
				tryMove(this, moveDir, world, false, false);
			}
		}
		if (moveDir > 0) this.face = moveDir;

		var shootAI = this.ai.shoot(world);
		if (shootAI.dir > 0) this.face = shootAI.dir;

		if (this.shot > 0) {
			this.shot--;
		} else {
			if (shootAI.mode >= 0) {
				this.fire(shootAI.mode, world);
			}
		}

		if (this.heat > 0) {
			this.heat -= 0.5; //TODO: double all heat values and make this 1
			if (this.heat > this.maxHeat) {
				this.heat = this.maxHeat;
			}
		}

		//enemies who are doing absolutely nothing might randomly face a different direction
		if (moveDir == dir.NONE && shootAI.dir == dir.NONE && this.moved == 0 && this.shot == 0 && this.targetIndex == null) {
			this.idleTimer++;
			if (this.idleTimer > 60 && Math.random() > 0.97) {
				this.idleTimer = 0;
				var newFace = dir.adjacentDirs(this.face)[Math.floor(Math.random()*2)];
				this.face = newFace;
			}
		} else {
			this.idleTimer = 0;
		}
	};

		//refire rate already checked, but heat not checked
	Person.prototype.fire = function (mode, world) {
		if (this.heat >= 100) {
			this.shot = 10;
			if (this.isLocalPlayer) world.audio.play(world.audio.overheat);
		} else {
			//we have different weapons
			if (this.guns) {
				var gun = this.guns[mode];
				var shot = world.createShot(gun.shotType, this.pos, this.face, this.team, this.index, this.targetIndex);
				this.heat += gun.heatIncrease;
				this.shot = gun.shootSpeed;
				world.audio.play(world.audio.shot, gun.shotType);
				if (gun.kick) {
					this.moved = Math.max(this.moved, gun.kick);
				}
			} else {
				//ignore mode, we only have one fire mode
				var shot = world.createShot(this.type.shotType, this.pos, this.face, this.team, this.index, this.targetIndex);
				this.heat += 0; //only people with guns can overheat
				this.shot = this.type.shootSpeed;
				world.audio.play(world.audio.shot, this.type.shotType);
			}

			if (this.moved < gunKick) {
				this.moved = gunKick;
			}
		}
	};

	Person.prototype.hurt = function (audio, damage, world) {
		if (!this.live || this.health <= 0) return;
		this.health -= damage;
		if (this.health <= 0) {

			this.deadTimer = maxDeadTime;

			if (this.isLocalPlayer) {
				audio.stopMusic();
				audio.play(audio.music, 1) //lose sound
			} else {
				audio.play(audio.dead);
				if (this.goalDie) world.kills++;
			}
		} else {
			if (this.isLocalPlayer) {
				audio.play(audio.thud, 1);
				//change to danger music
				var oldMusic = audio.getMusicIndexForHealth(this.health + damage);
				var newMusic = audio.getMusicIndexForHealth(this.health);
				if (oldMusic != newMusic) {
					audio.playMusic(audio.music, newMusic);
				}
			} else {
				audio.play(audio.thud, 0);
			}

		}
		this.heat += 25; //does not scale with damage; should it?
	}

	var explosionFrameRate = 1; //how many frames each image is shown for
	var explosionFrames = 5; //how many frames of animation there are

	var Explosion = function (skin, pos, ownerIndex, targetIndex, world) {
		this.live = true;
		this.skin = skin;
		//hack because art is out of order
		if (this.skin == 2) this.skin = 1;
		this.renderPos = pos.clone();
		this.pos = pos.clone().floor();
		this.ownerIndex = ownerIndex;
		this.targetIndex = targetIndex;
		world.explosions.push(this);
		this.age = -1; //hack: We're spawned and then updated in the same tick, before we're drawn
						//starting this from -1 means we are at frame 0 when we're first drawn.
	}
	Explosion.prototype.update = function (world) {
		if (this.live === false) return;
		this.age++;
		if (this.getAnimFrame() >= explosionFrames) {
			this.live = false;
		}
	}
	Explosion.prototype.getAnimFrame = function() {
		return Math.floor(this.age / explosionFrameRate);
	};

	var Decoration = function (pos, type, world, live) {
		this.live = live;
		this.pos = pos;
		this.type = type;
		world.decorations.push(this);
	}

	var KeySquare = function (pos, name, keySquares) {
		this.pos = pos;
		this.name = name
		keySquares.push(this);
	}

	var Shot = function (typeIndex, pos, face, team, ownerIndex, targetIndex, world) {
		this.live = true;
		this.type = shotTypes[typeIndex];
		this.typeIndex = typeIndex; //hack, used for sound effect
		this.pos = pos.clone();
		this.face = face;
		this.team = team;
		this.ownerIndex = ownerIndex;
		this.targetIndex = targetIndex;
		this.moved = 0;
		world.shots.push(this);
	};

	Shot.prototype.explode = function (world, hitWall) {

		//position so it looks correct
		var pos = this.pos.clone();
		switch (this.face) {
			case dir.LEFT: pos.y += 0.25; break;
			case dir.RIGHT: pos.y -= 0.25; break;
			case dir.UP: pos.x -= 0.25; break;
			case dir.DOWN: pos.x += 0.25; break;
		};
		if (hitWall) {
			switch (this.face) {
				case dir.LEFT: pos.x -= 0.5; break;
				case dir.RIGHT: pos.x += 0.5; break;
				case dir.UP: pos.y -= 0.5; break;
				case dir.DOWN: pos.y += 0.5; break;
			};
		}
		var explosion = new Explosion(this.type.skin, pos.clone(), this.ownerIndex, this.targetIndex, world);
		pos.x += Math.random() * 0.2 - 0.1;
		pos.y += Math.random() * 0.2 - 0.1;
		new Decoration(pos, 15 + Math.floor(Math.random() * 3), world, true);
		world.audio.play(world.audio.explosion, this.typeIndex);
	}

	Shot.prototype._checkHitPeople = function(people, world) {
		var that = this;
		var hit = false;
		people.forEach(function (e) {
			if (that.live === false) return; //we can only hit one person per turn
			if (e.pos.equals(that.pos) && e.live === true && e.health > 0 && e.team != that.team) {
				e.hurt(world.audio, that.type.damage, world);
				that.live = false;
				hit = true;
				that.explode(world, false);
			}
		});
		return hit;
	}

	//called by shot.update only
	Shot.prototype.shotTryMove = function(world) {
		var moved = tryMove(this, this.face, world, true, true);
		if (moved===false) {
			this.explode(world, true);
			this.live = false;
		}
		//if it moved off screen
		if (!world.map.isValid(this.pos)) {
			this.live = false;
		}

		//we check again after moving
		this._checkHitPeople(world.enemies, world);
	}

	Shot.prototype.update = function(world) {
		if (this.live === false) return;

		//We check for collisions before and after moving
		//when we implement piercing shots this will have to change - you only want to hit someone
		//if they moved into your square this frame, not if they were already there in the previous frame.
		this._checkHitPeople(world.enemies, world);
		if (this.live === false) return;

		if (this.moved > 0) {
			this.moved--;
		} else {
			this.shotTryMove(world);

			//instant hit weapons (negative movespeed) keep moving until they hit something
			while (this.type.moveSpeed < 0 && this.live) {
				this.shotTryMove(world);
			}
		}
	}

	var World = function(map) {

		this.healthBarPercent = 0;

		this.kills = 0;
		this.messages = [];
		this.hasEnded = false;

		this.shots = [];
		this.enemies = [];
		this.explosions = [];
		this.decorations = [];
		var keySquares = [];
		this.p = null;
		this.map = map;
		var scripting = new Scripting(Pos);
		var flags;
		var dangerMap = []; //one for each team.
		dangerMap[0] = make2DArray(map.width, map.height, 0);
		dangerMap[1] = make2DArray(map.width, map.height, 0);

		var endMissionTimer = 0;
		var missionIsEnding = false;
		var forceLose = false;

		this.enemyTemplates = [];

		//TOOD: move to separate Notes class
		var notesAreOpen = false;
		var currentNote = 0;
		var notes = [];
		var notesCollected = [];

		var notesWindow = document.getElementById("notes");
		var notesText= document.getElementById("notesText");
		var forwardButton = document.getElementById("forward");
		var backButton = document.getElementById("back");
		var closeButton = document.getElementById("close");

		this.setFlags = function (newFlags) {
			flags = newFlags.slice(0);;
			scripting.setFlags(flags);
		}

		this.getFlags = function () {
			return flags.slice(0);
		}

		this.getNotesCollected = function() {
			return notesCollected.slice(0);
		}

		this.hasLost = function () {
			if (forceLose) return true;
			return false;
		}

		//dir - the direction to move if the current note isn't found
		var validateCurrentNote = function (dir) {
			if (!notes.some(function (note, i) {
				return notesCollected[i] ? true : false;
			})) {
				currentNote = 0;
				setText(notesText, "There are no notes to display");
				return;
			}
			while (currentNote >= notes.length || currentNote < 0 || !notesCollected[currentNote]) {
				currentNote += dir;
				if (currentNote >= notes.length) currentNote = 0;
				if (currentNote < 0) currentNote = notes.length - 1;
			}
			setText(notesText, notes[currentNote].text);
		}

		this.setNotes = function (newNotes, newNotesCollected) {
			notes = newNotes;
			notesCollected = newNotesCollected.slice(0);
		};

		this.enableNote = function (i) {
			notesCollected[i] = true;
			currentNote = i;
			validateCurrentNote(1);
		};

		this.disableNote = function(i) {
			notesCollected[i] = false;
			validateCurrentNote(1);
		};

		this.notesAreOpen = function () {
			return notesAreOpen;
		}

		this.toggleNotes = function () {
			notesAreOpen = !notesAreOpen;
			if (notesAreOpen) {
				showElement(notesWindow);
				validateCurrentNote(1);
			} else {
				hideElement(notesWindow);
			}
		};

		this.nextNote = function () {
			currentNote++;
			validateCurrentNote(1);
		}

		this.previousNote = function () {
			currentNote--;
			validateCurrentNote(-1);
		}

		//

		//TODO: move to separate Briefing class
		var briefingPage = null;
		var missionText = [];
		var missionButtons = [];

		var briefingWindow = document.getElementById("briefing");
		var briefingText = document.getElementById("briefingText");
		var continueButton = document.getElementById("continueButton");
		var option0 = document.getElementById("option0");
		var option1 = document.getElementById("option1");

		this.setBriefing = function (briefing) {
			missionText = missionText.concat(briefing.text);
			missionButtons = missionButtons.concat(briefing.buttons);
			if (briefingPage == null) {
				briefingPage = 0;
			}
			this.updateBriefingDisplay();
		}

		var setText = function (el, text) {
			el.innerHTML = text;
		}

		var focusOn = function (el) {
			el.focus();
		}

		this.updateBriefingDisplay = function () {
			if (briefingPage == missionText.length || missionText[briefingPage].length == 0) {
				hideElement(briefing);
				briefingPage = null;
				missionText = [];
				missionButtons = [];
			} else {
				briefingWindow.classList.remove('small');
				showElement(briefingWindow);
				setText(briefingText, missionText[briefingPage]);
				if (missionButtons[briefingPage] === "losemission") {
					briefingWindow.classList.add('small');
				}
				if (missionButtons[briefingPage] === "losemission" || missionButtons[briefingPage].length == 0) {
					showElement(continueButton);
					focusOn(continueButton);
					hideElement(option0);
					hideElement(option1);
				} else {
					setText(option0, missionButtons[briefingPage][0].label);
					setText(option1, missionButtons[briefingPage][1].label);
					hideElement(continueButton);
					showElement(option0);
					showElement(option1);
					focusOn(option0);
				}
			}
		};

		this.updateBriefing = function (keyboard) {
			if (keyboard.isKeyHit(KeyEvent.DOM_VK_UP)
				|| keyboard.isKeyHit(KeyEvent.DOM_VK_DOWN)) {

				if (continueButton.style.display != "none") {
					focusOn(continueButton);
				} else if (document.activeElement == option0) {
					focusOn(option1);
				} else {
					focusOn(option0);
				}
			}
		}

		this.advanceBriefing = function (option) {
			if (briefingPage == null) return;
			if (option !== undefined) {
				var flag = missionButtons[briefingPage][option].flag;
				flags[flag] = !flags[flag];
			}
			briefingPage++;
			this.updateBriefingDisplay();
		};

		//

		this.endMission = function (timeDelay) {
			missionIsEnding = true;
			endMissionTimer = timeDelay;
		}

		this.loseMission = function (timeDelay) {
			track("TD_lose", this.level, null);
			forceLose = true;
			this.endMission(timeDelay);
		}

		this.addMessage = function (string) {
			this.messages.push({msg:string, age:0});
		}

		this.setTriggers = function (newTriggers) {
			scripting.setTriggers(newTriggers);
		}

		this.callWinMissionTriggers = function () {
			scripting.win(this);
		}

		this.createDecoration = function (pos, type, live) {
			new Decoration(pos, type, this, live);
		}

		this.createKeySquare = function (pos, name) {
			new KeySquare(pos, name, keySquares);
		}

		this.getKeySquare = function (name) {
			return keySquares.filter(function (keySquare) {
				return keySquare.name === name;
			})[0];
		}

		this.createShot = function(typeIndex, pos, face, team, ownerIndex, targetIndex) {
			var shot = new Shot(typeIndex, pos, face, team, ownerIndex, targetIndex, this);
		}

		this.createEnemy = function (pos, type, state, goalDie, tag) {

			//legacy hacks: offscreen enemies turn into templates for copy & paste
			if (pos.x < 0 || pos.y < 0) {
				this.enemyTemplates.push({type: type, state:state, goalDie: goalDie, tag:tag});
				return;
			}


			var e = new Person(pos, dir.random(), new AI(), enemyTypes[type]);
			e.index = this.enemies.length;
			e.goalDie = goalDie;
			e.tag = tag;
			e.moved = e.type.moveSpeed;
			//states are "standing", "waiting" and "seeking"
			//ignore "standing" and "waiting", but "seeking" makes them aware of everyone
			if (state === "seeking") {
				e.ai.makeAllAware();
			}
			this.enemies.push(e);

			return e;
		};

		this.createPlayer = function (pos, face) {
			this.p = new Person(pos, face, new PlayerAI(), playerType);
			this.p.guns = playerGuns;
			this.p.isLocalPlayer = true;
			this.p.index = this.enemies.length;
			this.enemies.push(this.p);
		};

		var setDangerAt = function (team, pos, value) {
			if (map.isValid(pos)) {
				if (dangerMap[team][pos.x][pos.y] < value) {
					dangerMap[team][pos.x][pos.y] = value;
				}
			}
		}

		//assumes only 2 teams
		var otherTeam = function (team) {
			if (team === 0) return 1;
			return 0;
		}

		var updateDangerMap = function () {

			this.map.forEach(function (pos, value) {
				//assumes only 2 teams.
				dangerMap[0][pos.x][pos.y] = 0;
				dangerMap[1][pos.x][pos.y] = 0;
			});

			//Danger around the player
			this.enemies.forEach(function (e) {
				if (e.live == false) return;
				var pos = e.pos;
				var team = otherTeam(e.team);
				setDangerAt(team, pos.clone().moveInDir(dir.UP, 1), 2);
				setDangerAt(team, pos.clone().moveInDir(dir.DOWN, 1), 2);
				setDangerAt(team, pos.clone().moveInDir(dir.LEFT, 1), 2);
				setDangerAt(team, pos.clone().moveInDir(dir.RIGHT, 1), 2);

				setDangerAt(team, pos.clone().moveInDir(dir.UP, 2), 1);
				setDangerAt(team, pos.clone().moveInDir(dir.DOWN, 2), 1);
				setDangerAt(team, pos.clone().moveInDir(dir.LEFT, 2), 1);
				setDangerAt(team, pos.clone().moveInDir(dir.RIGHT, 2), 1);
			});

			//Danger in front of shots that can hurt enemies
			this.shots.forEach(function (s) {
				if (s.live === false) return;
				var team = otherTeam(s.team);
				var pos = s.pos.clone();
				var danger = 100;
				while (map.isValid(pos) && danger > 0) {
					setDangerAt(team, pos, danger);
					pos.moveInDir(s.face, 1);
					danger -= 8;
				}
			});
		};

		this.getDangerAt = function (team, pos) {
			if (map.isValid(pos)) {
				return dangerMap[team][pos.x][pos.y];
			} else {
				return 0;
			}
		}

		this.personAt = function (pos) {
			return this.enemies.some(function (e) {
				return e.live && e.pos.equals(pos);
			});
		}

		var firstFrame = true;
		var paused = false;


		this.pause = function () {
			paused = true;
		}

		this.unpause = function () {
			paused = false;
			//we can still be paused even if this is false, if we're showing screens we control, like briefings or notes
		}

		this.isPaused = function () {
			return (briefingPage != null || notesAreOpen || paused);
		}

		this.update = function () {

			var desiredHealthBar = Math.floor(this.p.health * 100 / playerType.health);
			if (this.healthBarPercent > desiredHealthBar) this.healthBarPercent--;
			if (this.healthBarPercent < desiredHealthBar) this.healthBarPercent++;

			if (this.isPaused()) return; //pause while briefing is displayed

			if (this.p.health <= 0 && !this.hasLost()) {
				this.loseMission(30);
			}

			if (missionIsEnding) {
				endMissionTimer--;
				if (endMissionTimer <= 0) {
					missionIsEnding = false;
					this.hasEnded = true;
					this.audio.stopMusic();
					if (!this.hasLost()) {
						this.audio.play(this.audio.music, 2);
					} else {
						var loseBriefing = {text: ["Mission Failed"], buttons: ["losemission"]};
						this.setBriefing(loseBriefing);
					}
				}
			}

			var world = this;

			//done before scripting so scripting can override it
			this.camera.update(this.p.pos);

			if (firstFrame) {
				var musicIndex = this.audio.getMusicIndexForHealth(this.p.health);
				this.audio.playMusic(this.audio.music, musicIndex);
				scripting.newLev(this);
				firstFrame = false;
			} else if (this.hasEnded == true && !this.hasLost()) {
				world.callWinMissionTriggers();
			} else {
				scripting.update(this);
			}

			updateDangerMap.call(this); //ewww javascript.

			this.messages.forEach(function(m) {
				m.age++;
			});
			while (this.messages.length > 3 && this.messages[0].age > messageTextDelay) {
				this.messages.shift();
			}

			this.enemies.forEach(function(e) {
				e.update(world);
			});

			this.shots.forEach(function(shot) {
				shot.update(world);
			});

			this.explosions.forEach(function(exp) {
				exp.update(world);
			});

		}

	};

	var start = function () {

		track("open_game", null, null);
		canvas = document.getElementById('gamescreen');
		ctx = canvas.getContext("2d");
		canvas.width = screen.width * screen.tileSize;
		canvas.height = screen.height * screen.tileSize + screen.hudHeight;

		var keyboard = createKeyboard();
		var saves = new SavedGames(playerType.health);
		var audio = createAudio(saves);
		var assets = new Assets();

		var world = null;
		var camera = null;

		var notes = null;

		var savedGame = saves.load();

		var campaignLoader = new CampaignLoader(World, createGrid, Pos);

		var mainMenuShowing = false;
		var mainMenu = document.getElementById("mainmenu");
		var helpScreen = document.getElementById("helpscreen");
		var optionsScreen = document.getElementById("optionsscreen");
		var musicCheckbox = document.getElementById("musicCheckbox");

		var showMainMenu = function () {
			mainMenuShowing = true;
			if (world) world.pause();
			showElement(mainMenu);
		}

		var hideMainMenu = function () {
			mainMenuShowing = false;
			hideElement(mainMenu);
			if (world) world.unpause();
		}

		var loadMission = function () {
			track("TD_load_mission", savedGame.level, null);
			world = campaignLoader.loadMission(savedGame.level);
			world.setFlags(savedGame.flags);
			world.setNotes(notes, savedGame.notesCollected);
			world.audio = audio;
			camera = new Camera(world.p.pos, world.map.width, world.map.height);
			world.camera = camera;
			document.getElementById("briefing").style.display = null;
		};

		//Load the art assets, then the campaign, then the sounds, then start.
		assets.load(function () {
			campaignLoader.load("./res/01.tdm", function () {
				audio.load(function () {
					//first load
					notes = campaignLoader.loadNotes();
					showMainMenu();
				});
			});
		});

		//cross browser hacks
		var requestAnimationFrame = window.requestAnimationFrame || window.mozRequestAnimationFrame ||
			window.webkitRequestAnimationFrame || window.msRequestAnimationFrame;
	  	window.requestAnimationFrame = requestAnimationFrame;

		window.setInterval(function () {
			update(world, keyboard, camera, savedGame);
			requestAnimationFrame(function() {
				render(world, camera, assets);
			});

			if (world && world.hasEnded && !world.isPaused()) {

				if (world.hasLost()) {
					//restart
					loadMission();
					world.p.health = savedGame.playerHealth;
				} else {
					savedGame.level++;
					//heal the player
					var endingHealth = world.p.health;

					savedGame.notesCollected = world.getNotesCollected();
					savedGame.flags = world.getFlags();

					loadMission();

					savedGame.health = endingHealth + world.healAmount;
					if (savedGame.health > playerType.health) savedGame.health = playerType.health;

					saves.save(savedGame);

					world.p.health = savedGame.health;
				}
			}

		}, 40);

		//Briefing buttons:

		document.getElementById("continueButton").onclick = function () {
			if (world) {
				world.advanceBriefing();
			}
		};

		document.getElementById("option0").onclick = function () {
			if (world) {
				world.advanceBriefing(0);
			}
		};

		document.getElementById("option1").onclick = function () {
			if (world) {
				world.advanceBriefing(1);
			}
		};

		//Notes buttons

		document.getElementById("close").onclick = function () {
			if (world) {
				world.toggleNotes();
			}
		};

		document.getElementById("forward").onclick = function () {
			if (world) {
				world.nextNote();
			}
		};

		document.getElementById("back").onclick = function () {
			if (world) {
				world.previousNote();
			}
		};

		//main menu buttons
		document.getElementById("mainmenu_newgame").onclick = function () {
			savedGame = saves.newGame();
			loadMission();
			world.p.health = savedGame.playerHealth;
			hideMainMenu();
		}

		var continueGame = function () {
			if (world == null || world.hasLost()) {
				loadMission();
				world.p.health = savedGame.playerHealth;
				hideMainMenu();
			} else {
				hideMainMenu(); //resume currently running game
			}
		}

		document.getElementById("mainmenu_continue").onclick = continueGame;

		document.getElementById("mainmenu_help").onclick = function () {
			mainMenu.style.display = "none"; //hacky, hide it but don't let the game know it's hidden
			//the above is so you can't tab to it.
			showElement(helpScreen);
		}

		document.getElementById("closeHelp").onclick = function () {
			mainMenu.style.display = "block"; //hacky
			hideElement(helpScreen);
		}

		var updateOptionsMenu = function () {
			musicCheckbox.checked = !saves.loadSettings().musicDisabled;
		}

		document.getElementById("mainmenu_options").onclick = function () {
			mainMenu.style.display = "none"; //hacky, hide it but don't let the game know it's hidden
			//the above is so you can't tab to it.
			updateOptionsMenu();
			showElement(optionsScreen);
		}

		document.getElementById("closeOptions").onclick = function () {
			mainMenu.style.display = "block"; //hacky
			hideElement(optionsScreen);
		}

		musicCheckbox.onclick = function () {
			var settings = saves.loadSettings();
			audio.setMusicEnabled(musicCheckbox.checked);
			saves.saveSettings(settings);
		}


		var update = function (world, keyboard, camera, savedGame) {

			if (world === null) return;

			if (keyboard.isKeyHit(KeyEvent.DOM_VK_M)) {
				world.audio.toggleMusic();
				updateOptionsMenu();
			} else if (keyboard.isKeyHit(KeyEvent.DOM_VK_X)) {
				world.toggleNotes();
			} else if (keyboard.isKeyHit(KeyEvent.DOM_VK_L) && keyboard.isKeyDown(KeyEvent.DOM_VK_Q)) {
				world.hasEnded = true;
			} else if (keyboard.isKeyHit(KeyEvent.DOM_VK_ESCAPE)) {
				if (world.notesAreOpen()) {
					world.toggleNotes();
				} else if (!mainMenuShowing) {
					showMainMenu();
				} else {
					continueGame(); //hide main menu
				}
			}
			updatePlayerInput(keyboard, world.p.ai);
			world.updateBriefing(keyboard);
			world.update();
			keyboard.update();
		};

	};

	var updatePlayerInput = function (keyboard, playerAI) {

		//we face the last direction we fired in for a while, just as a cosmetic thing
		playerAI.timeSinceFired++;
		if (playerAI.timeSinceFired > 60) {
			playerAI.lastFireDir = -1;
		}

		var face = 0;
		if (keyboard.isKeyDown(KeyEvent.DOM_VK_UP)) face = dir.UP;
		if (keyboard.isKeyDown(KeyEvent.DOM_VK_RIGHT)) face = dir.RIGHT;
		if (keyboard.isKeyDown(KeyEvent.DOM_VK_DOWN)) face = dir.DOWN;
		if (keyboard.isKeyDown(KeyEvent.DOM_VK_LEFT)) face = dir.LEFT;

		var fireDir = -1;
		var fireMode = -1;
		if (keyboard.isKeyDown(KeyEvent.DOM_VK_W)) fireDir = dir.UP;
		if (keyboard.isKeyDown(KeyEvent.DOM_VK_D)) fireDir = dir.RIGHT;
		if (keyboard.isKeyDown(KeyEvent.DOM_VK_S)) fireDir = dir.DOWN;
		if (keyboard.isKeyDown(KeyEvent.DOM_VK_A)) fireDir = dir.LEFT;

		if (fireDir != -1) {
			if (keyboard.isKeyDown(KeyEvent.DOM_VK_SHIFT)) {
				fireMode = 1;
			} else {
				fireMode = 0;
			}
		}

		playerAI.moveDir = face;
		playerAI.fireMode = fireMode;
		if (fireDir == -1) {
			playerAI.fireDir = playerAI.lastFireDir == -1 ? face : playerAI.lastFireDir;
		} else {
			playerAI.fireDir = fireDir;
			playerAI.lastFireDir = fireDir;
			playerAI.timeSinceFired = 0;
		}
	}

	//global...
	var tryMove = function (o, face, world, allowOffScreen, allowThroughPeople) {
		var movedPos = o.pos.clone().moveInDir(face, 1);
		if (world.map.canMove(movedPos, allowOffScreen)) {
			if (!allowThroughPeople && world.personAt(movedPos)) return false;
			o.pos = movedPos;
			o.moved = o.type.moveSpeed;
			return true;
		}
		return false;
	};

	// Draw everything
	var render = function (world, camera, assets) {
		if (world === null) {
			ctx.fillStyle = "black";
			ctx.fillRect(0,0, screen.width * screen.tileSize, screen.height * screen.tileSize);
			ctx.fillStyle = "white";
			ctx.font = '32px Calibri, Candara, Segoe, "Segoe UI", Optima, Arial, sans-serif';
			ctx.fillText("Loading…", 40, screen.height * screen.tileSize - 32);
			return;
		}

		//draw grass everywhere
		world.map.forEach(function (pos, tile) {
			drawTile(assets.groundImage, pos, world.groundType, 0, camera);
		});

		//draw tiles
		world.map.forEach(function (pos, tile) {
			if (tile != 0) {
				drawTile(assets.groundImage, pos, tile+6, 0, camera);
			}
		});

		world.decorations.forEach(function (dec) {
			drawDec(dec, camera, assets);
		});

		world.shots.forEach(function (shot) {
			drawShot(shot, camera, assets);
		});

		world.enemies.forEach(function (e) {
			drawPerson(e, camera, assets);
		});

		world.explosions.forEach(function (e) {
			drawExplosion(e, camera, assets);
		});

		//HUD
		drawBar(0,screen.height * screen.tileSize,
			screen.width * screen.tileSize, screen.hudHeight,
			"rgb(30,30,30)", "grey", 2);

		ctx.fillStyle = (world.p.heat < 100)  ? "white" : "red";
		ctx.font = '32px Calibri, Candara, Segoe, "Segoe UI", Optima, Arial, sans-serif';
		ctx.fillText("Heat: " + Math.floor(world.p.heat), screen.width * screen.tileSize - 200, screen.height * screen.tileSize + 42);

		//health bar - 45 pixels off center to leave more room for the messages
		var healthX = screen.width * screen.tileSize / 2 - 100 + 45;
		var healthY = screen.height * screen.tileSize + 16;

		drawBar(healthX, healthY, 200, 32, "red", "white", 2);
		drawBar(healthX, healthY, 200 * world.healthBarPercent / 100, 32, "green", "white", 2);

		ctx.font = '16px Calibri, Candara, Segoe, "Segoe UI", Optima, Arial, sans-serif';
		for (var i = 0; i < 3; i++) {
			if (world.messages[i]) {
				ctx.fillStyle = (world.messages[i].age < messageTextDelay) ? "white" : "rgb(255, 255, 200)";
				ctx.fillText(world.messages[i].msg, 15, screen.height * screen.tileSize + 18 + i * 20);
			}
		}
	};

	var drawBar = function (x, y, width, height, color, borderColor, border) {
		ctx.fillStyle = borderColor;
		ctx.fillRect(x,y, width, height);
		if (width > border * 2 && height > border * 2) {
			ctx.fillStyle = color;
			ctx.fillRect(x + border,y + border, width - border*2, height - border*2);
		}
	}

	var drawDec = function (dec, camera, assets) {
		if (dec.live === false) return;
		var tX = dec.type;
		drawTile(assets.decImage, dec.pos, tX, 0, camera);
	}

	var drawShot = function (shot, camera, assets) {
		if (shot.live === false) return;
		var tX = shot.face - 1 + shot.type.skin*4;
		var tY = 0;
		drawTile(assets.shotImage, shot.pos, tX, tY, camera);
	}

	var drawExplosion = function (exp, camera, assets) {
		if (exp.live === false) return;
		var tX = exp.getAnimFrame() + exp.skin*5;
		var tY = 0;
		drawTile(assets.effectsImage, exp.renderPos, tX, tY, camera);
	}

	var drawTile = function (tilesImg, pos, tX, tY, camera) {
		var screenX = pos.x * screen.tileSize - camera.xOff();
		var screenY = pos.y * screen.tileSize - camera.yOff();
		if (screenX < -screen.tileSize) return;
		if (screenY < -screen.tileSize) return;
		if (screenX > screen.width * screen.tileSize) return;
		if (screenY > screen.height * screen.tileSize) return;
	    ctx.drawImage(tilesImg, tX*screen.tileSize, tY*screen.tileSize,
	    	screen.tileSize, screen.tileSize,
	    	screenX, screenY,
	    	screen.tileSize,screen.tileSize);
	};

	var drawPerson = function (person, camera, assets) {
		if (person.live === false) return;
		var pos = person.pos;
		if (person.health > 0) {
			var tX = person.face - 1;
			var tY = person.type.skin;
			drawTile(assets.humanImage, pos, tX, tY, camera);
		} else {
			drawTile(assets.deadImage, pos, 4 - Math.min(4, person.deadTimer), 0, camera);
		}
	}

	var make2DArray = function (width, height, defaultValue) {
		var array = [];
		for (var i = 0; i < width; i ++) {
			array[i] = [];
			for (var j = 0; j < height; j++) {
				array[i][j] = defaultValue;
			}
		}
		return array;
	}

	var createGrid = function (myWidth, myHeight) {
		var terrain = make2DArray(myWidth, myHeight, 0);
		var grid = {};
		grid.width = myWidth;
		grid.height = myHeight;

		grid.canMove = function (pos, allowOffScreen) {
			allowOffScreen = allowOffScreen ? true : false;
			if (this.isValid(pos) === false) return allowOffScreen;
			if (this.get(pos) > 0) return false;
			return true;
		}

		grid.isValid = function (pos) {
			if (pos.x < 0 || pos.x >= this.width) {
				return false;
			}
			if (pos.y < 0 || pos.y >= this.height) {
				return false;
			}
			return true;
		}

		grid.canSee = function (start, end) {
			//handle orthoginal directions first
			if (start.x == end.x) {
				var min = Math.min(start.y, end.y);
				var max = Math.max(start.y, end.y);
				for (var i = min; i <= max; i++) {
					if (!this.canMove(new Pos(start.x, i))) return false;
				}
				return true;
			}
			if (start.y == end.y) {
				var min = Math.min(start.x, end.x);
				var max = Math.max(start.x, end.x);
				for (var i = min; i <= max; i++) {
					if (!this.canMove(new Pos(i, start.y))) return false;
				}
				return true;
			}

			//OK, it's a diagonal. Both x and y are different.

			//Trace a line from start to end.
			//sweep along the line horizontally, for every x position
			//we check each vertical strip - which may be one cell, or more

			//A special case when peering through the crack between corners
			//aO     Ob			a is looking at b
			//Ob     aO 		if both Os are occupied, the view is blocked.

			//swap so X is always increasing.
			if (end.x < start.x) {
				var temp = end;
				end = start;
				start = temp;
			}

			var dX = (end.x - start.x); //always positive
			var dY = (end.y - start.y);
			var yRate = dY / dX; //when we add 1 to x, we must add yRate * 1 to y.

			var backwards = dY < 0;

			var x = start.x + 0.5;
			var y = start.y + 0.5;
			var firstHalf = null; //the value of the first half of the half-check. We need either side to be true to continue.

			while (x <= end.x) { //for each vertical strip of squares that the LOS passes through
				//console.log("x: " + x + ", y: " + y);

				var xCell = Math.floor(x);
				var top1 = Math.floor(y);
				var topIsCorner1 = (y===Math.floor(y));

				//the first and last step are half-cells, because the start and end are in the centre of a cell
				var xDist = (x < start.x + 1 || x == end.x) ? 0.5 : 1.0;
				y += yRate * xDist;

				var bottom1 = Math.floor(y);
				var bottomIsCorner1 = (y===Math.floor(y));

				//console.log("y from " + top1 + " to " + bottom1);

				//for simplicity, we swap so each strip is always done y-low to y-high
				var top = backwards ? bottom1 : top1;
				var bottom = backwards ? top1 : bottom1;
				var topIsCorner = backwards ? bottomIsCorner1 : topIsCorner1;
				var bottomIsCorner = backwards ? topIsCorner1 : bottomIsCorner1;

				if (topIsCorner) {
					//console.log("(" + xCell + "," + (top-1) + ") top");
					var thisHalf = (this.canMove(new Pos(xCell, top-1)));
					if (firstHalf === null) {
						firstHalf = thisHalf;
					} else {
						if (!firstHalf && !thisHalf) return false; //if both corners blocked our view
						firstHalf = null; //we saw past this pair of corners
					}
				}

				if (bottomIsCorner) bottom--;

				for (var yCell = top; yCell <= bottom; yCell++) {
					//console.log(xCell + "," + yCell);
					if (!this.canMove(new Pos(xCell, yCell))) return false;
				}

				if (bottomIsCorner) {
					//console.log("(" + xCell + "," + bottom+1 + ") bottom");
					var thisHalf = (this.canMove(new Pos(xCell, bottom+1)));
					if (firstHalf === null) {
						firstHalf = thisHalf;
					} else {
						if (!firstHalf && !thisHalf) return false; //if both corners blocked our view
						firstHalf = null; //we saw past this pair of corners
					}
				}

				x += xDist;
			}
			return true;
		}

		grid.get = function (pos) {
			if (!this.isValid(pos)) {
				return 0;
			}
			return terrain[pos.x][pos.y];
		};

		grid.set = function (pos, value) {
			if (!this.isValid(pos.x, pos.y)) {
				return;
			}
			terrain[pos.x][pos.y] = value;
		}

		grid.forEach = function (func) {
			for (var i = 0; i < this.width; i ++) {
				for (var j = 0; j < this.height; j++) {
					var pos = new Pos(i,j);
					func(pos, this.get(pos));
				}
			}
		}
		return grid;
	};

	if (typeof tests != "undefined") {
		window.onload = tests;
	} else {
		window.onload = start;
	}
};
new TakeDown();
