define(["Actions", "Creature"], function (Actions, Creature) {

	var Story = function () {
		var allActions = [Actions.Shoot, Actions.FindCover, Actions.Charge, Actions.Protect];
		var antisocialActions = [Actions.Shoot, Actions.FindCover, Actions.Charge];

		var gobnit = {name: "Gobnit", pic: "gobnit.png", greeting: "'Garble garble'", cover: 3, actions: antisocialActions, isAI:true, speed: 0.5};
		var weewit = {name: "Weewit", pic: "weewit.png", greeting: "'Target assigned.", cover: 4, actions: antisocialActions, isAI:true, speed: 0.75};
		var leepig = {name: "Leepig", pic: "leepig.png", greeting: "'Leave me alone!'", cover: 5, actions: allActions, isAI:true, speed: 0.5};
		var dopnot = {name: "Dopnot", pic: "dopnot.png", greeting: "'Grr! Zeek!'", cover: 6, actions: antisocialActions, isAI:true, speed: 0.75};

		var chapters = [];
		chapters.push({
			name: "Ambush",
			start: "Look out – it's an ambush!",
			end: "We made it. But we're running late. We'll have to take a shortcut...",
			enemies: [gobnit, weewit]
		});
		chapters.push({
			name:"Crime Zone",
			start:"The Crime Zone has tunnels to every major sector. But the Alvani gang is going to be waiting for us. They're still furious that we stopped their smuggling ring.",
			end:"Good work! We're through the Crime Zone.",
			enemies: [gobnit, weewit, gobnit, leepig, weewit, gobnit, dopnot]
		});
		chapters.push({
			name:"Water Zone",
			start:"Finally, the Water Zone! But it's full of robots?!",
			end:"The water's full of slime. The purifier must be broken.",
			enemies: [dopnot, dopnot, weewit, dopnot, weewit, leepig, weewit, dopnot, gobnit]
		});
		chapters.push({
			name:"Slime Zone",
			start:"This is where the purifier should be. If we can get to it, we can fix it.",
			end:"Found the purifier! Someone forgot to turn it on. One switch, and we're good!",
			enemies: [gobnit, gobnit, gobnit]
		});

		var chapterNum = 0;

		this.start = function (storyPopover) {
			chapterNum = 0;
			return this.next(storyPopover);
		}

		this.next = function (storyPopover) {
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

				document.querySelector('.storyText').innerHTML = storyStart;
				storyPopover.show();
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