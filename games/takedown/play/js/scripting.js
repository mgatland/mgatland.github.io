var Scripting = function () {
	var triggers = [];
	var timers = [];
	var flags;

	this.setFlags = function (newFlags) {
		flags = newFlags;
	}

	var updateTimers = function () {
		timers.forEach(function (timer) {
			timer.value--;
		});
	};

	var isTimerBelow = function (index, value) {
		var timer = timers[index];
		if (timer) {
			return (timer.value <= value);
		}
	}

	var spawnEnemy = function (eIndex, pos, world) {
		var template = world.enemyTemplates[eIndex];
		world.createEnemy(pos, template.type, template.state, template.goalDie, template.tag);
	}

	// flag1, flag2, rule
	// The rule is a 2 character string that specifies the required state of each flag
	// + means it must be true, - means it must be false, ? means it is not checked
	// e.g. "10, 20, +-" means "flag 10 must be true, flag 20 must be false"
	var flagCondition = function (cond) {
		var matches = 0;
		for (var i = 0; i < 2; i++) {
			var flagState = flags[cond.val[i]] ? true : false;
			switch (cond.val[2][i]) {
				case "+":
					if (flagState == true ) matches++;
					break;
				case "-":
					if (flagState == false) matches++;
					break;
				case "?":
					matches++; //anything
					break;
				default:
					console.log("Error in flagCondition: " + cond.val[2]);
					console.log(cond);
			}
		}
		return (matches == 2);
	}

	var enemyLivesCondition = function (cond, world) {
		var group = cond.val[0];
		var countRequired =toInt(cond.val[1]);
		var liveCount = world.enemies.filter(function (e) {
			return (e != world.p && e.live && (group === "any" || e.tag === group));
		}).length;
		return liveCount >= countRequired;
	}

	var awareCondition = function (cond, world) {
		var mode = cond.val[0];
		var group = cond.val[1]; //only if mode is "group"
		var countRequired = toInt(cond.val[2]);
		if (mode != "any" && mode != "group") console.log("WARNING: We don't support awareness mode of " + group + " yet");
		var awareCount = world.enemies.filter(function (e) {
			return (e != world.p && e.live && (mode === "any" || e.tag === group)
				&& e.ai.isAwareOfEnemies(world));
		}).length;
		return awareCount >= countRequired;
	}

	var delayCondition = function (cond) {
		if (cond.timer == undefined) {
			cond.timer = toInt(cond.val[0]);
		}
		cond.timer--;
		return (cond.timer <= 0);
	}

	var checkAllTriggers = function (scriptEvent, world) {
		triggers.forEach(function (trigger, triggerIndex) {
			if (!trigger.live) return;
			var condsTrue = [];
			trigger.cond.forEach(function (cond, i) {
				condsTrue[i] = checkCondition(cond, scriptEvent, world);
			});
			if (trigger.actWhen === "and") {
				if (condsTrue[0] && condsTrue[1]) fireTrigger(trigger, triggerIndex, world);
			} else if (trigger.actWhen === "+-") {
				if (condsTrue[0] && !condsTrue[1]) fireTrigger(trigger, triggerIndex, world);
			} else if (trigger.actWhen === "none") {
				if (!condsTrue[0] && !condsTrue[1]) fireTrigger(trigger, triggerIndex, world);
			}
		});
	}

	var checkCondition = function (cond, scriptEvent, world) {
		var result;
		switch (cond.type) {
			case "aware":
				result = awareCondition(cond, world);
				break;
			case "timer_ch":
				var timerIndex = toInt(cond.val[0]);
				var value = toInt(cond.val[1]);
				result = isTimerBelow(timerIndex, value);
				break;
			case "delay":
				result = delayCondition(cond);
				break;
			case "enemylives":
				result = enemyLivesCondition(cond, world);
				break;
			case "false":
				result = false;
				break;
			case "true":
				result = true;
				break;
			case "newlev":
				result = (scriptEvent === "newlev");
				break;
			case "win":
				result = (scriptEvent === "win");
				break;
			case "flag":
				result = flagCondition(cond);
				break;
			case "playerhealth":
				var lowerBound = toInt(cond.val[0]);
				var upperOrEqualBound = toInt(cond.val[1]);
				result = (world.p.health > lowerBound && world.p.health <= upperOrEqualBound);
				break;
			case "kills":
				result = (world.kills >= toInt(cond.val[0]));
				break;
			case "playerxy":
				result = (world.p.pos.x == toInt(cond.val[0])
					&& world.p.pos.y == toInt(cond.val[1]));
				break;
			default:
				console.log("Unsupported condition " + cond.type);
		}
		return result;
	}

	var processAction = function (action, world) {
		switch (action.type) {
			case "alarm":
				console.log("an alarm goes off");
				world.enemies.forEach(function (e) {
					e.ai.makeAllAware();
				});
				break;
			case "screenxy":
				if (world.hasLost()) return;
				var x = toInt(action.val[0]);
				var y = toInt(action.val[1]);
				world.camera.setPos(new Pos(x, y));
				break;
			case "e_patrolto":
				var enemyIndex = toInt(action.val[0]);
				var keySquare = world.getKeySquare(action.val[1]);
				var nextAction = action.val[2];
				//NextState can be 'seek', or empy\anything else to do nothing.
				world.enemies[enemyIndex].ai.patrolTo(keySquare.pos, nextAction);
				break;
			case "speech":
				var speaker = toInt(action.val[0]); //unused
				var soundNumber = toInt(action.val[1]);
				world.audio.playVoice(world.audio.mis, soundNumber);
				break;
			case "timer_set":
				var timerIndex = toInt(action.val[0]);
				var startValue = toInt(action.val[1]);
				var type = action.val[2];
				if (type != "down") console.log("WARNING: timer_set must use 'down' as the type, you used " + type);
				timers[timerIndex] = {value: startValue};
				break;
			case "mistxt":
				if (world.hasLost()) return;
				var notePage = toInt(action.val[0]);
				var noteValue = toInt(action.val[1]);
				if (noteValue >= 0) {
					world.enableNote(notePage);
				} else {
					world.disableNote(notePage);
				}
				break;
			case "enemy":
				var enemyNum = toInt(action.val[0]);
				var x = toInt(action.val[1]);
				var y = toInt(action.val[2]);
				spawnEnemy(enemyNum, new Pos(x, y), world);
				break;
			case "flag_setval":
				var flagNumber = toInt(action.val[0]);
				var flagValue = toInt(action.val[1]);
				flags[flagNumber] = flagValue;
				break;
			case "briefing":
				if (world.hasLost()) return;
				var briefing = createBriefing(action.val);
				world.setBriefing(briefing);
				break;
			case "text":
				if (world.hasLost()) return;
				world.audio.play(world.audio.msg);
				action.val.forEach(function (string) {
					if (string && string.length > 0) world.addMessage(string);
				});
				break;
			case "endmission":
				if (world.hasLost()) return;
				var timeDelay = parseInt(action.val[0]);
				//ignore the other parameters
				world.endMission(timeDelay);
				break;
			case "losemission":
				if (world.hasLost()) return;
				var timeDelay = parseInt(action.val[0]);
				world.loseMission(timeDelay);
				break;
			case "null": //noop
				break;
			case "dec":
				var decNum = toInt(action.val[0]);
				var rawDecValue = toInt(action.val[1]);
				var decValue = rawDecValue == 1 ? true: false;
				//-1 is meant to toggle but it's not used in the main campaign so i don't support it
				if (rawDecValue != 0 && rawDecValue != 1) console.log("WARNING: we do not support a 'dec' action with a value of " + rawDecValue);
				world.decorations[decNum].live = decValue;
				break;
			default:
				console.log("Firing unknown action " + action.type);
		}
	}

	var fireTrigger = function (trigger, i, world) {
		console.log("Firing trigger (" + trigger.cond[0].type + "," + trigger.cond[1].type + " -- " + trigger.act[0].type + "," + trigger.act[1].type + ")");

		trigger.act.forEach(function (action) {
			processAction(action, world);
		});
		if (!trigger.repeating) {
			trigger.live = false;
		} else {
			//update the delay conditions
			//This behaviour is never used in the main campaign
			trigger.cond.forEach(function (cond) {
				if (cond.type == "delay") {
					cond.timer = toInt(cond.val[1]);
				}
			});
		}
	}

	this.setTriggers = function (newTriggers) {
		triggers = newTriggers;
	}

	this.newLev = function (world) {
		checkAllTriggers("newlev", world);
	}

	this.win = function (world) {
		checkAllTriggers("win", world);
	}

	this.update = function (world) {
		updateTimers();
		checkAllTriggers("tick", world);
	}
}