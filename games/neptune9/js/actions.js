"use strict";
define(function () {
	var Actions = {};

	Actions.Shoot = new function () {
		this.buttonLabel = "Shoot";
		this.name = "Shooting"
		this.verb = " fire at ";
		this.needsTarget = true;
		this.cooldown = 40;
		this.coverDamage = 1;
		this.isFatal = true;

		this.addIdeas = function (c, ideas, enemies, friend) {
			var that = this;
			enemies.forEach(function (enemy) {
				if (enemy.alive) {
					ideas.push({move: that, score: 10 + Math.random(), target: enemy.id});
				}
			});
		};
	}

	Actions.FindCover = new function () {
		this.buttonLabel = "Find Cover";
		this.name = "Taking Cover"
		this.verb = " move back to find cover.";
		this.needsTarget = false;
		this.cooldown = 90; //Must be slower than 2 shots
		this.coverCost = -2;

		this.addIdeas = function (c, ideas, enemies, friend) {
			if (c.cover >= c.maxCover) return;

			if (c.cover === 0 && Math.random() > 0.2) {
				ideas.push({score: 30, move: this});
				return;
			}

			if (c.cover === 1 && Math.random() > 0.5) {
				ideas.push({score: 20, move: this});
				return;
			}
			ideas.push({score: 1, move: this});	
		};
	}

	Actions.Charge = new function () {
		this.buttonLabel = "Advance";
		this.name = "Charging"
		this.verb = " charge forwards!";
		this.needsTarget = false;
		this.cooldown = 60; //Should be quicker than 2 shots?
		this.coverCost = 4;
		this.targets = "both enemies";
		this.coverDamage = 2;

		this.addIdeas = function (c, ideas, enemies, friend) {
			if (c.cover > 4 && enemies[0].cover >= 2 && enemies[1].cover >= 2
				&& Math.random() > 0.7) {
				ideas.push({score: 15, move: this});
			}
		};	
	}

	Actions.Protect = new function () {
		this.buttonLabel = "Protect";
		this.name = "Protect $teammate";
		this.verb = " protects a teammate.";
		this.needsTarget = false;
		this.cooldown = 40;
		this.coverCost = 2;
		this.teammateCoverCost = -2;

		this.addIdeas = function (c, ideas, enemies, friend) {
			if (friend.alive && friend.cover < friend.maxCover) {
				if (friend.cover === 0 && c.cover > 2) {
					ideas.push({score: 25, move:this});
					return;
				} else if (friend.cover <= friend.maxCover - 4
					&& friend.cover <= 3 
					&& friend.cover <= c.cover - 4) {
					if (Math.random() > 0.7) {
						ideas.push({score: 19, move:this});
						return;
					} else {
						ideas.push({score: 2, move:this});
						return;
					}
				}
			}
		};
	}
	return Actions;
});