"use strict";
require(["creature", "controls", "keyboard", "popover", "actions", "story"],
	function(Creature, Controls, Keyboard, Popover, Actions, Story) {

var startNeptune9 = function(event) {

	track("pageload");

	var isGameRunning = false;
	var DEBUG = {};
	if (location.search) {
		if (location.search.indexOf("1hit") >= 0) {
			DEBUG.oneHit = true;
		}
		if (location.search.indexOf("aiparty") >= 0) {
			DEBUG.aiParty = true;
		}
		if (location.search.indexOf("pfast") >= 0) {
			DEBUG.pFast = true;
		}
	}

	var allActions = [Actions.Shoot, Actions.FindCover, Actions.Charge, Actions.Protect];
	var rylie = {name: "Rylie", pic: "warrior.png", greeting: "Here comes trouble.", cover: 10, isAI:false, actions: allActions, isHero: true};
	var brooklyn = {name: "Brooklyn", pic: "missionary.png", greeting: "Let's go!", cover: 10, isAI:false, actions: allActions, isHero: true};

	if (DEBUG.oneHit) {
		rylie.cover = 1;
		brooklyn.cover = 1;
	}
	if (DEBUG.aiParty) {
		rylie.isAI = true;
		brooklyn.isAI = true;
	}
	if (DEBUG.pFast) {
		rylie.speed = 6;
		brooklyn.speed = 6;
	}

	var advanceStory = function () {
		if (chapter.isEnded()) {
			chapter.cleanUp();

			controls[0].setNewbieMode(false);
			controls[1].setNewbieMode(false);

			var nextChapter = story.next(storyPopover);
			if (nextChapter === null) {
				document.querySelector('.restartText').innerHTML = "Mission Accomplished!<br><br>Neptune 9 is safe once again...<br><br>...but for how long?";
				restartPopover.show();
			} else {
				chapter = nextChapter;
				chapter.start(creatures);
			}
		} else {
			chapter.reallyStart(creatures);
		}
	}

	var keyboard = new Keyboard();
	var creatures = [];
	var controls = [];
	var story = null;
	var chapter = null;

	var hardMode = false;

	controls[0] = new Controls(0);
	controls[1] = new Controls(1);
	var restartPopover = new Popover("restart");
	var startGamePopover = new Popover("startgame");
	var storyPopover = new Popover("storyPopover");
	var popoverDelayTimer = 0;

	var restartGame = function () {
		restartPopover.hide();
		startGamePopover.show();
		creatures[2].die();
		creatures[3].die();
		creatures[2].draw();
		creatures[3].draw();
		controls[0].setNewbieMode(true);
		controls[1].setNewbieMode(true);
	}

	var toggleHardMode = function () {
		hardMode = !hardMode;
		document.querySelector('.hardModeLabel').innerHTML = hardMode ? "ON" : "OFF";
	}

	var startGame = function (noOfPlayers) {
		track("startGameWithNPlayers", noOfPlayers);
		startGamePopover.hide();
		popoverDelayTimer = 0;

		if (noOfPlayers === 1) {
			rylie.isAI = true;
		} else {
			rylie.isAI = false;
		}

		if (hardMode) {
			rylie.cover = 3;
			brooklyn.cover = 3;
			rylie.actions[2] = Actions.CheapCharge;
			brooklyn.actions[2] = Actions.CheapCharge;
		} else {
			rylie.cover = 10;
			brooklyn.cover = 10;
			rylie.actions[2] = Actions.Charge;
			brooklyn.actions[2] = Actions.Charge;
		}

		creatures[0] = new Creature(0, rylie, creatures);
		creatures[1] = new Creature(1, brooklyn, creatures);
		creatures[2] = new Creature(2, Creature.placeHolder, creatures);
		creatures[3] = new Creature(2, Creature.placeHolder, creatures);

		story = new Story(creatures);
		chapter = story.start(storyPopover);
		chapter.start(creatures);


		creatures.forEach(function (c) {
			c.draw();
		});

		controls[0].setCreature(creatures[0]);
		controls[1].setCreature(creatures[1]);

		isGameRunning = true;
	}

	var firstParentWithClass = function (startNode, className) {
		var node = startNode;
		while(node && node.classList && !node.classList.contains(className)) {
	    	node = node.parentNode;
	    	if (!node.classList) return null; //we clicked outside a card.
		}
		return node;
	}

	var addControlsEventListener = function (i) {
		var controlsEle = document.querySelector('.controls.p' + i);
		controlsEle.addEventListener('click', function (event) {
			var node = firstParentWithClass(event.target, 'actionbutton');
		    if (node) {
		        var action = node.className.replace("actionbutton", "").replace(" ", "").replace("act", "");
		        controls[i].actionSelected(action);
		    }
		}, false);
	}

	for (var i = 0; i < 2; i++) {
		addControlsEventListener(i);
	}

	var cardSelected = function(num) {
		console.log("Card selected: " + num);
		controls[0].cardSelected(num);
		controls[1].cardSelected(num);
	}

	var cardsEle = document.querySelector('.cards');
	cardsEle.addEventListener('click', function (event) {
		var node = firstParentWithClass(event.target, 'card');
		if (!node) return;
		var num = 0;
		for (var i = 0; i < 4; i++) {
			if (node.classList.contains("p" + i)) num = i;
		}
		cardSelected(num);
	}, false);

	window.setInterval(function () {

		var left = (keyboard.isKeyHit(KeyEvent.DOM_VK_LEFT));
		var right = (keyboard.isKeyHit(KeyEvent.DOM_VK_RIGHT));
		var up = (keyboard.isKeyHit(KeyEvent.DOM_VK_UP));
		var down = (keyboard.isKeyHit(KeyEvent.DOM_VK_DOWN));
		var left2 = (keyboard.isKeyHit(KeyEvent.DOM_VK_A));
		var right2 = (keyboard.isKeyHit(KeyEvent.DOM_VK_D));
		var up2 = (keyboard.isKeyHit(KeyEvent.DOM_VK_W));
		var down2 = (keyboard.isKeyHit(KeyEvent.DOM_VK_S));
		var enter = (keyboard.isKeyHit(KeyEvent.DOM_VK_ENTER)) || (keyboard.isKeyHit(KeyEvent.DOM_VK_RETURN));

		//Up also counts as enter in every situation
		enter = (enter || up || up2);

		keyboard.update();

		if (enter && restartPopover.isShown()) {
			restartGame();
		}

		if (enter && storyPopover.isShown()) {
			advanceStory();
		}

		if ((left || left2) && startGamePopover.isShown()) {
			startGame(1);
		}

		if ((right || right2) && startGamePopover.isShown()) {
			startGame(2);
		}

		if ((up || up2) && startGamePopover.isShown()) {
			toggleHardMode();
		}

		if (!isGameRunning || storyPopover.isShown() || restartPopover.isShown() || startGamePopover.isShown()) return;

		controls[0].update(up2, down2, left2, right2);
		controls[1].update(up, down, left, right);

		if (creatures[0].alive === false && creatures[1].alive === false) {
			popoverDelayTimer++;
			if (popoverDelayTimer === 60) {
				document.querySelector('.restartText').innerHTML = "Game Over";
				restartPopover.show();
			}
		}

		creatures.forEach(function (c, index) {
			c.update();
		});

		chapter.update(creatures);
	}, 1000/30);

	var addClickEventListener = function (buttonClass, action, arg) {
		var buttonEle = document.querySelector(buttonClass);
		buttonEle.addEventListener('click', function (event) {
		    action(arg);
		}, false);
	}

	addClickEventListener('.restartButton', restartGame);
	addClickEventListener('.hardModeButton', toggleHardMode);
	addClickEventListener('.onePlayerButton', startGame, 1);
	addClickEventListener('.twoPlayerButton', startGame, 2);
	addClickEventListener('.storyButton', advanceStory);
};
if (document.readyState !== "loading") {
	startNeptune9();
} else {
	document.addEventListener("DOMContentLoaded", function(event) {
		startNeptune9();
	});
}
});


var track = function (action, label, number) {
	console.log("_trackEvent: " + action + ", " + label + ", " + number);
	try {
		_gaq.push(['_trackEvent',"neptune9", action, ""+label, number]);;
	} catch (e) {

	}
}