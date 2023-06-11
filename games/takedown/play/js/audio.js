"use strict";

//mostly from http://www.html5rocks.com/en/tutorials/webaudio/intro/
function createAudio(saves) {
	var audio = {};
	var music = null;

	var defaultMusicVolume = 0.5;

	var voiceChannelAvailableTime = 0;

	var init = function () {
	  try {
	    // Fix up for prefixing
	    window.AudioContext = window.AudioContext||window.webkitAudioContext;
	    return new AudioContext();
	  }
	  catch(e) {
	    console.log('Web Audio API is not supported in this browser');
	    console.log(e.stack);
	  }
	};

	function playSound(set, index, loop, voice) {
	  var buffer;
	  if (set.length === 1) {
	  	buffer = set[0];
	  } else if (index === undefined || index === null) {
	  	buffer = set[Math.floor(Math.random() * set.length)];
	  } else {
	  	buffer = set[index];
	  }
	  if (buffer === undefined) {
	  	console.log("Error: attempt to play sound which hasn't loaded");
	  	return;
	  }

	  var source = context.createBufferSource();
	  source.buffer = buffer;
	  if (loop) {
	  	source.connect(musicVolumeNode);
	  } else {
	  	source.connect(context.destination);
	  }

	  if (loop) source.loop = true;

	  if (voice) { //don't let voices overlap
	  	var currentTime = context.currentTime;
	  	if (voiceChannelAvailableTime < currentTime) voiceChannelAvailableTime = currentTime;
	  	source.start(voiceChannelAvailableTime);
	  	voiceChannelAvailableTime += buffer.duration;
	  } else {
	  	source.start(0);
	  }
	  return source;
	}

	var context = init();

	var settings = saves.loadSettings();
	settings.musicDisabled = settings.musicDisabled ? true : false;

	if (context) {
	 	var musicVolumeNode = context.createGain();
		musicVolumeNode.connect(context.destination);
		musicVolumeNode.gain.value = defaultMusicVolume;
		if (settings.musicDisabled) musicVolumeNode.gain.value = 0;
	}

    audio.load = function (callback) {
    	if (!context) {
    		callback(); //just immediately continue
    		return;
    	}
    	var soundsToLoad = 0;

    	var checkIfAllHaveLoaded = function () {
    		if (soundsToLoad == 0) {
				callback();
    		}
    	};

		var onLoadError = function () {
			console.log("Error loading sound");
			soundsToLoad--;
			checkIfAllHaveLoaded();
		}

		var loadSound = function (name, index, url) {
		  soundsToLoad++;
		  var request = new XMLHttpRequest();
		  request.open('GET', url, true);
		  request.responseType = 'arraybuffer';
		  // Decode asynchronously
		  request.onload = function() {
		    context.decodeAudioData(request.response, function(buffer) {
		      if (audio[name] == undefined) audio[name] = [];
		      audio[name][index] = buffer;
		      soundsToLoad--;
		      checkIfAllHaveLoaded();
		    }, onLoadError);
		  }
		  request.send();
		}

		for (var i = 0; i < 5; i++) {
			loadSound("shot", i, "res/snd/shot" + i + ".wav");
		}
		for (var i = 0; i < 2; i++) {
			loadSound("thud", i, "res/snd/thud" + i + ".wav");
		}
		for (var i = 0; i < 4; i++) {
			loadSound("explosion", i, "res/snd/exp" + i + ".wav");
		}
		loadSound("dead", 0, "res/snd/dead0.wav");
		loadSound("overheat", 0, "res/snd/overheat0.wav");
		loadSound("msg", 0, "res/snd/msg0.wav");

		//music0 is normal background music
		//music1 is the lose level sfx
		//music2 is 'win level'
		//music3 is danger
		//music4 is extreme danger
		for (var i = 0; i < 5; i++) {
			loadSound("music", i, "res/snd/music" + i + ".ogg");
		}

		//voices
		for (var i = 0; i < 2; i++) {
			loadSound("seen", i, "res/snd/seen" + i + ".wav");
		}
		for (var i = 0; i < 2; i++) {
			loadSound("mis", i, "res/snd/mis" + i + ".wav");
		}

    };

	audio.play = function (set, index) {
		if (!context) return;
		playSound(set, index);
	};

	audio.playVoice = function (set, index) {
		if (!context) return;
		playSound(set, index, false, true);
	}

	audio.playMusic = function (set, index) {
		if (!context) return;
		this.stopMusic();
		music = playSound(set, index, true);
	};

	audio.stopMusic = function () {
		if (!context) return;
		if (music != null) {
			music.stop(0);
			music = null;
		}
	}

	audio.setMusicEnabled = function (state) {
		settings.musicDisabled = !state;
		saves.saveSettings(settings);
		if (!context) return;
		if (settings.musicDisabled) {
			musicVolumeNode.gain.value = 0;
		} else {
			musicVolumeNode.gain.value = defaultMusicVolume;
		}
	}

	audio.toggleMusic = function () {
		this.setMusicEnabled(settings.musicDisabled);
	}

	audio.getMusicIndexForHealth = function(health) {
		if (health <= 2) return 4;
		if (health <= 6) return 3;
		return 0;
	}

	return audio;
};