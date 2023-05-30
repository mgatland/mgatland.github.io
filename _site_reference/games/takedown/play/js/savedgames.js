var SavedGames = function (defaultHealth) {

	var supports_html5_storage = function () {
	  try {
	    return 'localStorage' in window && window['localStorage'] !== null;
	  } catch (e) {
	    return false;
	  }
	}

	var SavedGame = function() {
		this.level = 1;
		this.flags = [];
		this.notesCollected = [];
		this.playerHealth = defaultHealth;
	}

	this.newGame = function () {
		return new SavedGame();
	}

	if (!supports_html5_storage()) {
		alert("Your browser doesn't support saving your game, so your progress will be lost if you refresh the page.");
		this.load = function () { return this.newGame();};
		this.save = function () { console.log("cannot save")};
		this.loadSettings = function () { return {}};
		this.saveSettings = function () {};
		return;
	}

	var localStorage = window.localStorage;

	this.load = function () {
		var savedGame = localStorage.getItem("takedown_save0");
		if (savedGame == null) return this.newGame();
		return JSON.parse(savedGame);
	}

	this.save = function (savedGame) {
		localStorage.setItem("takedown_save0", JSON.stringify(savedGame));
	}

	this.loadSettings = function () {
		var settings = localStorage.getItem("takedown_settings");
		if (settings == null) return {};
		return JSON.parse(settings);
	}

	this.saveSettings = function (settings) {
		localStorage.setItem("takedown_settings", JSON.stringify(settings));
	}
}
