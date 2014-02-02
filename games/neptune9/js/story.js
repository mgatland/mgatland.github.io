define(["actions", "creature"], function (Actions, Creature) {

	var Story = function (creatures) {
		var allActions = [Actions.Shoot, Actions.FindCover, Actions.Charge, Actions.Protect];
		var antisocialActions = [Actions.Shoot, Actions.FindCover, Actions.Charge];

		var gobnit = {name: "Gobnit", pic: "gobnit.png", greeting: "'Garble garble'", cover: 1, actions: antisocialActions, isAI:true, speed: 0.5};
		var weewit = {name: "Weewit", pic: "weewit.png", greeting: "'Target assigned.", cover: 3, actions: antisocialActions, isAI:true, speed: 0.75};
		var leepig = {name: "Leepig", pic: "leepig.png", greeting: "'Leave me alone!'", cover: 4, actions: allActions, isAI:true, speed: 0.5};
		var dopnot = {name: "Dopnot", pic: "dopnot.png", greeting: "'Grr! Zeek!'", cover: 5, actions: antisocialActions, isAI:true, speed: 0.75};

		//generate dialogue strings
		var dialogue = function (speakerNum, line) {
			return "<p><span class='chatLabel p" + speakerNum + "'>" + creatures[speakerNum].name + ":</span> " + line + "</p>";
		}

		var chapters = [];
		chapters.push({
			name: "Ambush",
			start: "",
			end: dialogue(1, "Only two of them. What were they doing in the city?") +
				dialogue(0, "Someone must have scared them out of the sewers. Let's check it out."),
			enemies: [gobnit, weewit]
		});
		chapters.push({
			name:"Crime Zone",
			start:dialogue(0, "The Crime Zone. Fastest way to the sewers, or anywhere. We'll sneak through.") +
				dialogue(1, "Too late! We've been spotted."),
			end:dialogue(1, "They were waiting for us.") +
				dialogue(0, "Maybe they were waiting for someone else. Someone worse."),
			enemies: [gobnit, weewit, gobnit, leepig, weewit, leepig]
		});
		chapters.push({
			name:"Sewer Tunnel",
			start:dialogue(0, "The sewer entrance. There's a whole army in here!") +
				dialogue(1, "Planning to invade the crime zone. We need to stop them."),
			end:dialogue(1, "I've got an idea. If we open the dams, this whole tunnel floods with sewerage.") +
				dialogue(0, "Robots hate sewerage! OK, let's get to a control valve."),
			enemies: [dopnot, dopnot, weewit, weewit, dopnot, weewit]
		});
		chapters.push({
			name:"Sewer side room",
			start:"",
			end:dialogue(0, "That's the valve.") +
				dialogue(1, "Eat sewerage, robot army!"),
			enemies: [gobnit, gobnit, gobnit, dopnot]
		});

		var chapterNum = 0;

		this.start = function (storyPopover) {
			chapterNum = 0;
			return this.next(storyPopover);
		}

		this.next = function (storyPopover) {
			track("startChapter", chapterNum);
			if (chapterNum === chapters.length) return null;

			var chapter = new Chapter(chapters[chapterNum], storyPopover);
			chapterNum++;
			return chapter;
		}

		var Chapter = function (data, storyPopover) {
			var name = data.name;
			var enemiesList = data.enemies.slice();
			var storyStart = data.start;
			var storyEnd = data.end;
			var isEnded = false;
			var isStarted = false;

			var getEnemiesLeft = function (creatures) {
				var count = enemiesList.length;
				creatures.forEach(function (c) {
					if (c.alive && !c.isHero) count++;
				});
				return count;
			}

			var canMakeEnemy = function () { return enemiesList.length > 0; };

			var makeEnemy = function (slot, creatures) {
				return new Creature(slot, enemiesList.shift(), creatures);
			}

			var endChapter = function () {
				if (isEnded) return;
				document.querySelector('.storyText').innerHTML = storyEnd;
				storyPopover.show();
				isEnded = true;
			}

			this.isEnded = function () {
				return isEnded;
			}

			this.start = function (creatures) {
				creatures.forEach(function (creature) {
					if (creature.isHero) {
						creature.recover();
						creature.draw("hideHints");
					}
				});

				if (typeof storyStart === "string" && storyStart.length > 0) {
					document.querySelector('.storyText').innerHTML = storyStart;
					storyPopover.show();
				} else {
					//no intro text
					this.reallyStart(creatures);
				}

			}

			this.cleanUp = function () {
				storyPopover.hide();
			}

			this.reallyStart = function (creatures) {
				isStarted = true;
				storyPopover.hide();
				creatures.forEach(function (creature) {
					if (creature.isHero) {
						creature.idleAction();
					}
				});

			}

			this.update = function (creatures) {
				if (!isStarted) return;
				document.querySelector('.chapterName').innerHTML = name;
				var enemiesLeft = getEnemiesLeft(creatures);
				if (enemiesLeft === 0) {
					var message = "CLEAR";
				} else if (enemiesLeft === 1) {
					var message = "1 enemy left."
				} else {
					message = enemiesLeft + " enemies left.";
				}
				document.querySelector('.enemiesLeft').innerHTML = message;

				creatures.forEach(function (c, index) {
					if (c.alive === false && c.deadTimer === 0 && !c.isHero && canMakeEnemy()) {
						creatures[index] = makeEnemy(index, creatures);
						creatures[index].draw();
					}
				});

				if (enemiesLeft === 0 && creatures[2].deadTimer === 0 && creatures[3].deadTimer === 0) {
					endChapter();
				}
			}
		};
	};
	return Story;
});