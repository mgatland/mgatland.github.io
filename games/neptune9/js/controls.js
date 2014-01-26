"use strict";
define(function () {
	var Controls = function (i, creature) {
		var controls = this; //for private methods
		this.i = i;
		var state = "";
		var selectedAction = "";
		
		var ele = document.querySelector(".p" + i + ".controls");
		var cardsEle = document.querySelector(".cards");

		var tryKeys = function (up, down, left, right) {
			if (state === "chooseAction") {
				if (up) controls.actionSelected(0);
				if (down) controls.actionSelected(1);
				if (left) controls.actionSelected(2);
				if (right) controls.actionSelected(3);
			} else if (state === "chooseTarget") {
				if (left) controls.cardSelected(2);
				if (right) controls.cardSelected(3);	
			}
		}

		this.update = function (up, down, left, right) {

			if (!creature.alive) {
				setState("dead");
				return;
			}

			tryKeys(up, down, left, right);
			if (state === "wait") {
				var cooldown = creature.cooldown;
				if (cooldown <= 0) {
					setState("chooseAction");
				}
			}
		}

		this.actionSelected = function (act) {
			if (state !== "chooseAction") return;
			selectedAction = act;
			if (creature.doesActionNeedTarget(act)) {
				setState("chooseTarget");	
			} else {
				useAction(act, null);
			}
			
		}

		var useAction = function (action, targetNum) {
			var coolDownTime = creature.useAction(action, targetNum);

			selectedAction = "";
			setState("wait");
		}

		this.cardSelected = function (num) {
			if ( state !== "chooseTarget") {
				return;
			}
			useAction(selectedAction, num);
		}

		var setState = function (newState) {
			if (state === newState) return;
			state = newState;
			if (state === "chooseTarget") {
				ele.classList.add("chooseTarget");
				ele.classList.add("enabled");
				ele.classList.remove("chooseAction");
				ele.classList.remove("wait");
				ele.classList.remove("dead");
				ele.classList.toggle("keyhints", false);
				cardsEle.classList.toggle("keyhints" + i, true);
			}
			if (state === "chooseAction") {
				ele.classList.remove("chooseTarget");
				ele.classList.remove("enabled");
				ele.classList.add("chooseAction");
				ele.classList.remove("wait");
				ele.classList.remove("dead");
				ele.classList.toggle("keyhints", true);
				cardsEle.classList.toggle("keyhints" + i, false);
			}
			if (state === "wait") {
				ele.classList.remove("chooseTarget");
				ele.classList.remove("enabled");
				ele.classList.remove("chooseAction");
				ele.classList.add("wait");
				ele.classList.remove("dead");
				ele.classList.toggle("keyhints", false);
				cardsEle.classList.toggle("keyhints" + i, false);
			}
			if (state === "dead") {
				ele.classList.remove("chooseTarget");
				ele.classList.remove("enabled");
				ele.classList.remove("chooseAction");
				ele.classList.remove("wait");
				ele.classList.add("dead");
				ele.classList.toggle("keyhints", false);
				cardsEle.classList.toggle("keyhints" + i, false);
			}
		}
		setState("chooseAction");
	}

	return Controls;
});