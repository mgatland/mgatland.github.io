// synth.js and waveshaper.js were copied from https://github.com/cwilso/midi-synth
// Please see the original code there.
// This code is derived from code Copyright (c) 2014 Chris Wilson
// which was released under the MIT licence

function AudioUtil() {


	var voices = new Array();
	var audioContext = null;

	// This is the "initial patch"
	var currentModWaveform = "sine";
	var currentModFrequency = 21; // Hz * 10 = 2.1
	var currentModOsc1 = 15;
	var currentModOsc2 = 17;

	var currentOsc1Waveform = "sawtooth";
	var currentOsc1Octave = 0;  // 32'
	var currentOsc1Detune = 0;	// 0
	var currentOsc1Mix = 50.0;	// 50%

	var currentOsc2Waveform = "sawtooth";
	var currentOsc2Octave = 0;  // 16'
	var currentOsc2Detune = -25;	// fat detune makes pretty analogue-y sound.  :)
	var currentOsc2Mix = 50.0;	// 0%

	var currentFilterCutoff = 19.0;
	var currentFilterQ = 7.0;
	var currentFilterMod = 21;
	var currentFilterEnv = 56;

	var currentEnvA = 2;
	var currentEnvD = 15;
	var currentEnvS = 68;
	var currentEnvR = 5;

	var currentFilterEnvA = 5;
	var currentFilterEnvD = 6;
	var currentFilterEnvS = 5;
	var currentFilterEnvR = 7;

	var currentDrive = 38;
	var currentRev = 32;
	var currentVol = 75;
	// end initial patch

	var keys = new Array( 256 );
	keys[65] = 60; // = C4 ("middle C")
	keys[87] = 61;
	keys[83] = 62;
	keys[69] = 63;
	keys[68] = 64;
	keys[70] = 65; // = F4
	keys[84] = 66;
	keys[71] = 67;
	keys[89] = 68;
	keys[72] = 69;
	keys[85] = 70;
	keys[74] = 71;
	keys[75] = 72; // = C5
	keys[79] = 73;
	keys[76] = 74;
	keys[80] = 75;
	keys[186] = 76;
	keys[222] = 77; // = F5
	keys[221] = 78;
	keys[13] = 79;
	keys[220] = 80;

	var effectChain = null;
	var waveshaper = null;
	var volNode = null;
	var revNode = null;
	var revGain = null;
	var revBypassGain = null;

	function frequencyFromNoteNumber( note ) {
		return 440 * Math.pow(2,(note-69)/12);
	}

	function noteOn( note, velocity, now, volume ) {
		if (voices[note] == null) {
			// Create a new synth node
			voices[note] = new Voice(note, velocity, now, volume);
		}
	}

	function noteOff( note, now ) {
		if (voices[note] != null) {
			// Shut off the note playing and clear it
			voices[note].noteOff(now);
			voices[note] = null;
		}
	}

	// 'value' is normalized to 0..1.
	function controller( number, value ) {
	  if (number == 1) {
	    currentFilterCutoff = 100 * value;
	    $("#fFreq").val( currentFilterCutoff );
	    $("#fFreq").trigger('change');
	    onUpdateFilterCutoff( currentFilterCutoff );
	    return;
	  } else if (number == 0x0a) {
	    currentFilterQ = 20 * value;
	    $("#fQ").val( currentFilterQ );
	    $("#fQ").trigger('change');
	    onUpdateFilterQ( currentFilterQ );
	  } else if (number == 0x49) {
	    currentDrive = 100 * value;
	    $("#drive").val( currentDrive );
	    $("#drive").trigger('change');
	    onUpdateDrive( currentDrive );
	  } else if (number == 0x48) {
	    currentRev = 100 * value;
	    $("#reverb").val( currentRev );
	    $("#reverb").trigger('change');
	    onUpdateReverb( currentRev );
	  } else if (number == 0x4a) {
	    currentModOsc1 = 100 * value;
	    $("#modOsc1").val( currentModOsc1 );
	    $("#modOsc1").trigger('change');
	    onUpdateModOsc1( currentModOsc1 );
	  } else if (number == 0x47) {
	    currentModOsc2 = 100 * value;
	    $("#modOsc2").val( currentModOsc2 );
	    $("#modOsc2").trigger('change');
	    onUpdateModOsc2( currentModOsc2 );
	  } else if (number == 7) {
	    currentModFrequency = 100 * value;
	    $("#mFreq").val( currentModFrequency );
	    $("#mFreq").trigger('change');
	    onUpdateModFrequency( currentModFrequency );
	  } else if (number == 0x5b) {
	    currentVol = 100 * value;
	    $("#volume").val( currentVol );
	    $("#volume").trigger('change');
	    onUpdateVolume( currentVol );
	  } else if (number == 0x33) { // "1" button
		moDouble = (value > 0);
		changeModMultiplier();
	  } else if (number == 0x34) { // "2" button
		moQuadruple = (value > 0);
		changeModMultiplier();
	  }
	}

	var currentPitchWheel = 0.0;
	// 'value' is normalized to [-1,1]
	function pitchWheel( value ) {
		var i;

		currentPitchWheel = value;
		for (var i=0; i<255; i++) {
			if (voices[i]) {
				if (voices[i].osc1)
					voices[i].osc1.detune.value = currentOsc1Detune + currentPitchWheel * 500;	// value in cents - detune major fifth.
				if (voices[i].osc2)
					voices[i].osc2.detune.value = currentOsc2Detune + currentPitchWheel * 500;	// value in cents - detune major fifth.
			}
		}
	}

	function onUpdateModWaveform( ev ) {
		currentModWaveform = ev.target.selectedIndex;
		for (var i=0; i<255; i++) {
			if (voices[i] != null) {
				voices[i].setModWaveform( currentModWaveform );
			}
		}
	}

	function onUpdateModFrequency( value ) {
		if (value.currentTarget)
			value = value.currentTarget.value;
		currentModFrequency = value;
		var oscFreq = currentModFrequency * modOscFreqMultiplier;
		for (var i=0; i<255; i++) {
			if (voices[i] != null) {
				voices[i].updateModFrequency( oscFreq );
			}
		}
	}

	function onUpdateModOsc1( value ) {
		if (value.currentTarget)
			value = value.currentTarget.value;
		currentModOsc1 = value;
		for (var i=0; i<255; i++) {
			if (voices[i] != null) {
				voices[i].updateModOsc1( value );
			}
		}
	}

	function onUpdateModOsc2( value ) {
		if (value.currentTarget)
			value = value.currentTarget.value;
		currentModOsc2 = value;
		for (var i=0; i<255; i++) {
			if (voices[i] != null) {
				voices[i].updateModOsc2( value );
			}
		}
	}

	function onUpdateFilterCutoff( value ) {
		if (value.currentTarget)
			value = value.currentTarget.value;
		currentFilterCutoff = value;
		for (var i=0; i<255; i++) {
			if (voices[i] != null) {
				voices[i].setFilterCutoff( value );
			}
		}
	}

	function onUpdateFilterQ( value ) {
		if (value.currentTarget)
			value = value.currentTarget.value;
		currentFilterQ = value;
		for (var i=0; i<255; i++) {
			if (voices[i] != null) {
				voices[i].setFilterQ( value );
			}
		}
	}

	function onUpdateFilterMod( value ) {
		if (value.currentTarget)
			value = value.currentTarget.value;
		currentFilterMod = value;
		for (var i=0; i<255; i++) {
			if (voices[i] != null) {
				voices[i].setFilterMod( value );
			}
		}
	}

	function onUpdateFilterEnv( value ) {
		currentFilterEnv = value;
	}

	function onUpdateOsc1Wave( ev ) {
		currentOsc1Waveform = ev.target.selectedIndex;
		for (var i=0; i<255; i++) {
			if (voices[i] != null) {
				voices[i].setOsc1Waveform( currentOsc1Waveform );
			}
		}
	}

	function onUpdateOsc1Octave( ev ) {
		currentOsc1Octave = ev.target.selectedIndex;
		for (var i=0; i<255; i++) {
			if (voices[i] != null) {
				voices[i].updateOsc1Frequency();
			}
		}
	}

	function onUpdateOsc1Detune( value ) {
		if (value.currentTarget)
			value = value.currentTarget.value;
		currentOsc1Detune = value;
		for (var i=0; i<255; i++) {
			if (voices[i] != null) {
				voices[i].updateOsc1Frequency();
			}
		}
	}

	function onUpdateOsc1Mix( value ) {
		if (value.currentTarget)
			value = value.currentTarget.value;
		currentOsc1Mix = value;
		for (var i=0; i<255; i++) {
			if (voices[i] != null) {
				voices[i].updateOsc1Mix( value );
			}
		}
	}

	function onUpdateOsc2Wave( ev ) {
		currentOsc2Waveform = ev.target.selectedIndex;
		for (var i=0; i<255; i++) {
			if (voices[i] != null) {
				voices[i].setOsc2Waveform( currentOsc2Waveform );
			}
		}
	}

	function onUpdateOsc2Octave( ev ) {
		currentOsc2Octave = ev.target.selectedIndex;
		for (var i=0; i<255; i++) {
			if (voices[i] != null) {
				voices[i].updateOsc2Frequency();
			}
		}
	}

	function onUpdateOsc2Detune( value ) {
		if (value.currentTarget)
			value = value.currentTarget.value;
		currentOsc2Detune = value;
		for (var i=0; i<255; i++) {
			if (voices[i] != null) {
				voices[i].updateOsc2Frequency();
			}
		}
	}

	function onUpdateOsc2Mix( value ) {
		if (value.currentTarget)
			value = value.currentTarget.value;
		currentOsc2Mix = value;
		for (var i=0; i<255; i++) {
			if (voices[i] != null) {
				voices[i].updateOsc2Mix( value );
			}
		}
	}

	function onUpdateEnvA( value ) {
		currentEnvA = value;
	}

	function onUpdateEnvD( value ) {
		currentEnvD = value;
	}

	function onUpdateEnvS( value ) {
		currentEnvS = value;
	}

	function onUpdateEnvR( value ) {
		currentEnvR = value;
	}

	function onUpdateFilterEnvA( value ) {
		currentFilterEnvA = value;
	}

	function onUpdateFilterEnvD( value ) {
		currentFilterEnvD = value;
	}

	function onUpdateFilterEnvS( value ) {
		currentFilterEnvS = value;
	}

	function onUpdateFilterEnvR( value ) {
		currentFilterEnvR = value;
	}

	function onUpdateDrive( value ) {
		currentDrive = value;
	    waveshaper.setDrive( 0.01 + (currentDrive*currentDrive/500.0) );
	}

	function onUpdateVolume( value ) {
		volNode.gain.value = value/100.0;
	}

	function onUpdateReverb( value ) {
		value = value/100;

		// equal-power crossfade
		var gain1 = Math.cos(value * 0.5*Math.PI);
		var gain2 = Math.cos((1.0-value) * 0.5*Math.PI);

		revBypassGain.gain.value = gain1;
		revGain.gain.value = gain2;
	}

	/*
	var FOURIER_SIZE = 4096;
	var wave = false;

		if ( wave ) {
			var real = new Float32Array(FOURIER_SIZE);
			var imag = new Float32Array(FOURIER_SIZE);
			real[0] = 0.0;
			imag[0] = 0.0;

			for (var i=1; i<FOURIER_SIZE; i++) {
				real[i]=1.0;
				imag[i]=1.0;
			}

			var wavetable = audioContext.createPeriodicWave(real, imag);
			oscillatorNode.setPeriodicWave(wavetable);
		} else {

	*/

	function filterFrequencyFromCutoff( pitch, cutoff ) {
	    var nyquist = 0.5 * audioContext.sampleRate;

	    var filterFrequency = Math.pow(2, (9 * cutoff) - 1) * pitch;
	    if (filterFrequency > nyquist)
	        filterFrequency = nyquist;
		return filterFrequency;
	}

	function Voice( note, velocity, now, volume ) {
		this.originalFrequency = frequencyFromNoteNumber( note );

		// create osc 1
		this.osc1 = audioContext.createOscillator();
		this.updateOsc1Frequency();
		this.osc1.type = currentOsc1Waveform;

		this.osc1Gain = audioContext.createGain();
		this.osc1Gain.gain.value = 0.005 * currentOsc1Mix;
	//	this.gain.gain.value = 0.05 + (0.33 * velocity);
		this.osc1.connect( this.osc1Gain );

		// create osc 2
		this.osc2 = audioContext.createOscillator();
		this.updateOsc2Frequency();
		this.osc2.type = currentOsc2Waveform;

		this.osc2Gain = audioContext.createGain();
		this.osc2Gain.gain.value = 0.005 * currentOsc2Mix;
		this.osc2.connect( this.osc2Gain );

		// create modulator osc
		this.modOsc = audioContext.createOscillator();
		this.modOsc.type = currentModWaveform;
		this.modOsc.frequency.value = currentModFrequency/10 * modOscFreqMultiplier;

		this.modOsc1Gain = audioContext.createGain();
		this.modOsc.connect( this.modOsc1Gain );
		this.modOsc1Gain.gain.value = currentModOsc1/10;
		this.modOsc1Gain.connect( this.osc1.frequency );	// tremolo

		this.modOsc2Gain = audioContext.createGain();
		this.modOsc.connect( this.modOsc2Gain );
		this.modOsc2Gain.gain.value = currentModOsc2/10;
		this.modOsc2Gain.connect( this.osc2.frequency );	// tremolo

		// create the LP filter
		this.filter1 = audioContext.createBiquadFilter();
		this.filter1.type = "lowpass";
		this.filter1.Q.value = currentFilterQ;
		this.filter2 = audioContext.createBiquadFilter();
		this.filter2.type = "lowpass";
		this.filter2.Q.value = currentFilterQ;

		this.osc1Gain.connect( this.filter1 );
		this.osc2Gain.connect( this.filter1 );
		this.filter1.connect( this.filter2 );

		// connect the modulator to the filters
		this.modFilterGain = audioContext.createGain();
		this.modOsc.connect( this.modFilterGain );
		this.modFilterGain.gain.value = currentFilterMod*10;
		this.modFilterGain.connect( this.filter1.detune );	// filter tremolo
		this.modFilterGain.connect( this.filter2.detune );	// filter tremolo

		// create the volume envelope
		this.envelope = audioContext.createGain();
		this.filter2.connect( this.envelope );

		if (volume == undefined || volume == null) {
			this.envelope.connect( effectChain );
		} else {
			this.extraVolumeNode = audioContext.createGain();
			this.envelope.connect(this.extraVolumeNode);
			this.extraVolumeNode.connect(effectChain);
			this.extraVolumeNode.gain.value = volume;
		}

		// set up the volume and filter envelopes
		var now = now ? now : audioContext.currentTime;
		var envAttackEnd = now + (currentEnvA/20.0);

		this.envelope.gain.value = 0.0;
		this.envelope.gain.setValueAtTime( 0.0, now );
		this.envelope.gain.linearRampToValueAtTime( 1.0, envAttackEnd );
		this.envelope.gain.setTargetAtTime( (currentEnvS/100.0), envAttackEnd, (currentEnvD/100.0)+0.001 );

	    var pitchFrequency = this.originalFrequency;
	    var filterInitLevel = filterFrequencyFromCutoff( pitchFrequency, currentFilterCutoff/100 );
		var filterAttackLevel = filterFrequencyFromCutoff( pitchFrequency, currentFilterCutoff/100 +
			(currentFilterEnv/120) );
		var filterSustainLevel = filterFrequencyFromCutoff( pitchFrequency, currentFilterCutoff/100 +
			((currentFilterEnv/120) * (currentFilterEnvS/100.0)) );
		var filterAttackEnd = now + (currentFilterEnvA/20.0);

	//	console.log( "pitchFrequency: " + pitchFrequency + " filterInitLevel: " + filterInitLevel +
	//				 " filterAttackLevel: " + filterAttackLevel + " filterSustainLevel: " + filterSustainLevel );
		this.filter1.frequency.value = filterInitLevel;
		this.filter1.frequency.setValueAtTime( filterInitLevel, now );
		this.filter1.frequency.linearRampToValueAtTime( filterAttackLevel, filterAttackEnd );
		this.filter1.frequency.setTargetAtTime( filterSustainLevel, filterAttackEnd, (currentFilterEnvD/100.0) );
		this.filter2.frequency.value = filterInitLevel;
		this.filter2.frequency.setValueAtTime( filterInitLevel, now );
		this.filter2.frequency.linearRampToValueAtTime( filterAttackLevel, filterAttackEnd );
		this.filter2.frequency.setTargetAtTime( filterSustainLevel, filterAttackEnd, (currentFilterEnvD/100.0) );

		this.osc1.start(now);
		this.osc2.start(now);
		this.modOsc.start(now);
	}


	Voice.prototype.setModWaveform = function( value ) {
		this.modOsc.type = value;
	}

	Voice.prototype.updateModFrequency = function( value ) {
		this.modOsc.frequency.value = value/10;
	}

	Voice.prototype.updateModOsc1 = function( value ) {
		this.modOsc1Gain.gain.value = value/10;
	}

	Voice.prototype.updateModOsc2 = function( value ) {
		this.modOsc2Gain.gain.value = value/10;
	}

	Voice.prototype.setOsc1Waveform = function( value ) {
		this.osc1.type = value;
	}

	Voice.prototype.updateOsc1Frequency = function( value ) {
		this.osc1.frequency.value = (this.originalFrequency*Math.pow(2,currentOsc1Octave-2));  // -2 because osc1 is 32', 16', 8'
		this.osc1.detune.value = currentOsc1Detune + currentPitchWheel * 500;	// value in cents - detune major fifth.
	}

	Voice.prototype.updateOsc1Mix = function( value ) {
		this.osc1Gain.gain.value = 0.005 * value;
	}

	Voice.prototype.setOsc2Waveform = function( value ) {
		this.osc2.type = value;
	}

	Voice.prototype.updateOsc2Frequency = function( value ) {
		this.osc2.frequency.value = (this.originalFrequency*Math.pow(2,currentOsc2Octave-1));
		this.osc2.detune.value = currentOsc2Detune + currentPitchWheel * 500;	// value in cents - detune major fifth.
	}

	Voice.prototype.updateOsc2Mix = function( value ) {
		this.osc2Gain.gain.value = 0.005 * value;
	}

	Voice.prototype.setFilterCutoff = function( value ) {
		var now =  audioContext.currentTime;
		var filterFrequency = filterFrequencyFromCutoff( this.originalFrequency, value/100 );
		this.filter1.frequency.cancelScheduledValues( now );
		this.filter1.frequency.setValueAtTime( filterFrequency, now );
		this.filter2.frequency.cancelScheduledValues( now );
		this.filter2.frequency.setValueAtTime( filterFrequency, now );
	}

	Voice.prototype.setFilterQ = function( value ) {
		this.filter1.Q.value = value;
		this.filter2.Q.value = value;
	}

	Voice.prototype.setFilterMod = function( value ) {
		this.modFilterGain.gain.value = currentFilterMod*10;
	}

	Voice.prototype.noteOff = function(now) {
		var now = now ? now : audioContext.currentTime;
		var release = now + (currentEnvR/10.0);
	    var initFilter = filterFrequencyFromCutoff( this.originalFrequency, currentFilterCutoff/100 * (1.0-(currentFilterEnv/100.0)) );

	//    console.log("noteoff: now: " + now + " val: " + this.filter1.frequency.value + " initF: " + initFilter + " fR: " + currentFilterEnvR/100 );
		this.envelope.gain.cancelScheduledValues(now);
		this.envelope.gain.setValueAtTime( this.envelope.gain.value, now );  // this is necessary because of the linear ramp
		this.envelope.gain.setTargetAtTime(0.0, now, (currentEnvR/100));
		this.filter1.frequency.cancelScheduledValues(now);
		this.filter1.frequency.setValueAtTime( this.filter1.frequency.value, now );  // this is necessary because of the linear ramp
		this.filter1.frequency.setTargetAtTime( initFilter, now, (currentFilterEnvR/100.0) );
		this.filter2.frequency.cancelScheduledValues(now);
		this.filter2.frequency.setValueAtTime( this.filter2.frequency.value, now );  // this is necessary because of the linear ramp
		this.filter2.frequency.setTargetAtTime( initFilter, now, (currentFilterEnvR/100.0) );

		this.osc1.stop( release );
		this.osc2.stop( release );
	}

	var currentOctave = 3;
	var modOscFreqMultiplier = 1;
	var moDouble = false;
	var moQuadruple = false;

	function changeModMultiplier() {
		modOscFreqMultiplier = (moDouble?2:1)*(moQuadruple?4:1);
		onUpdateModFrequency( currentModFrequency );
	}

	function keyDown( ev ) {
		return; //disable for now
		if ((ev.keyCode==49)||(ev.keyCode==50)) {
			if (ev.keyCode==49)
				moDouble = true;
			else if (ev.keyCode==50)
				moQuadruple = true;
			changeModMultiplier();
		}

		var note = keys[ev.keyCode];
		if (note) {
			noteOn( note + 12*(3-currentOctave), 0.75 );
			console.log( "played: " + (note + 12*(3-currentOctave)) );
		}
		return false;
	}

	function keyUp( ev ) {
		if ((ev.keyCode==49)||(ev.keyCode==50)) {
			if (ev.keyCode==49)
				moDouble = false;
			else if (ev.keyCode==50)
				moQuadruple = false;
			changeModMultiplier();
		}

		var note = keys[ev.keyCode];
		if (note)
			noteOff( note + 12*(3-currentOctave) );
	//	console.log( "key up: " + ev.keyCode );

		return false;
	}

	function pointerDown( ev ) {
		var note = parseInt( ev.target.id.substring( 1 ) );
		if (note != NaN)
			noteOn( note + 12*(3-currentOctave), 0.75 );
	//	console.log( "mouse down: " + note );
		ev.target.classList.add("pressed");
		return false;
	}

	function pointerUp( ev ) {
		var note = parseInt( ev.target.id.substring( 1 ) );
		if (note != NaN)
			noteOff( note + 12*(3-currentOctave) );
	//	console.log( "mouse up: " + note );
		ev.target.classList.remove("pressed");
		return false;
	}

	function onChangeOctave( ev ) {
		currentOctave = ev.target.selectedIndex;
	}

	function start() {
		try {
			window.AudioContext = window.AudioContext||window.webkitAudioContext;
	    	audioContext = new AudioContext();
	  	}
	  	catch(e) {
	    	alert('The Web Audio API is apparently not supported in this browser.');
	  	}

		window.addEventListener('keydown', keyDown, false);
		window.addEventListener('keyup', keyUp, false);

		// set up the master effects chain for all voices to connect to.
		effectChain = audioContext.createGain();
		waveshaper = new WaveShaper( audioContext );
	    effectChain.connect( waveshaper.input );
	    onUpdateDrive( currentDrive );

	   	revNode = audioContext.createGain(); //this should be a convolver but I removed it

		revGain = audioContext.createGain();
		revBypassGain = audioContext.createGain();

	    volNode = audioContext.createGain();
	    volNode.gain.value = currentVol;
	    waveshaper.output.connect( revNode );
	    waveshaper.output.connect( revBypassGain );
	    revNode.connect( revGain );
	    revGain.connect( volNode );
	    revBypassGain.connect( volNode );
	    onUpdateReverb( currentRev );

	    volNode.connect( audioContext.destination );
	    onUpdateVolume( currentVol );
	}

	start();

	//expose an interface to the game

	//charging:
	var wasCharging = false;
	var chargeNote = 45;
	this.setCharging = function (isCharging) {
		if (isCharging && !wasCharging) {
			noteOn(chargeNote, 0.75);
		}

		if (!isCharging && wasCharging) {
			noteOff(chargeNote);
		}

		if (isCharging && wasCharging) {
			var voice = voices[chargeNote];
			voice.osc1Gain.gain.value += 0.002;
		}

		wasCharging = isCharging;
	}
	this.playerResetCharge = function () {
		this.setCharging(false);
		this.setCharging(true);
	}

	//enemy attacks:
	var enemyAttackTimer = 0;
	var enemyAttackNote = 61;
	this.enemyAttack = function () {
		if (enemyAttackTimer == 0) {
			enemyAttackTimer = 1;
			noteOn(enemyAttackNote, 0.75);
		}
	}

	//player damage:
	this.shotHitPlayer = function (healthLeft) {
			var now = audioContext.currentTime;
			//var lowNotes = [62, 62, 62, 62, 62, 62];
			//scheduleNote(lowNotes[healthLeft], now, 0.15, 0.5, 0.7);
			scheduleNote(68, now, 0.15, 0.5, 1.7);
			scheduleNote(76, now, 0.15, 0.5, 1.7);
			scheduleNote(77, now, 0.15, 0.5, 1.7);
	}
	this.playerDied = function () {
		var now = audioContext.currentTime;
		scheduleNote(68, now, 1.2, 0.6, 1.3);
		scheduleNote(61, now, 1.2, 0.6, 1.3);
		scheduleNote(64, now, 1.2, 0.6, 1.3);
	}

	var bitCollectionTimer = 0;
	this.playerCollectedBit = function () {
		if (bitCollectionTimer == 0 && playerAttackTimer == 0) {
			bitCollectionTimer = 1;
			noteOn(playerAttackNote2, 1.0);
		}
	}

	//player attack:
	var playerAttackTimer = 0;
	var playerAttackNote1 = 62;
	var playerAttackNote2 = 69;
	var playerAttackNote3 = 74;
	this.playerAttack = function (damagePercent, gotKills) {
		if (playerAttackTimer == 0) {
			playerAttackTimer = Math.floor(10 + damagePercent*50);
			noteOn(playerAttackNote1, 1.0);
			noteOn(playerAttackNote2, 1.0);
			if (gotKills) {
				noteOn(74, 1.0);
			}
		}
	}

	var scheduleNote = function (note, start, duration, attack, volume) {
		attack = attack ? attack : 0.75;
		volume = volume ? volume : null;
		noteOn(note, attack, start, volume);
		noteOff(note, start+duration);
	}

	this.playGotItem = function (type) {
		var bpm = 240;
		var beat = 60 / bpm;
		var extra = beat / 10;
		var now = audioContext.currentTime;
		scheduleNote(60, now, beat*1 + extra);
		var note2 = type == 1 ? 65 : 63;
		scheduleNote(note2, now+beat*1, beat*4 + extra);
	}

	this.playIntro = function () {
		var bpm = 180;
		var beat = 60 / bpm;
		var extra = beat / 10;
		var now = audioContext.currentTime;
		scheduleNote(64, now, beat*2 + extra);
		scheduleNote(67, now+beat*2, beat*1 + extra);
		scheduleNote(69, now+beat*3, beat*1 + extra);
		scheduleNote(72, now+beat*4, beat*2 + extra);
		scheduleNote(71, now+beat*6, beat*2 + extra);
		scheduleNote(69, now+beat*8, beat*1 + extra);
		scheduleNote(71, now+beat*9, beat*1 + extra);
		scheduleNote(67, now+beat*10, beat*2 + extra);
		scheduleNote(69, now+beat*12, beat*3 + extra);
	}

	this.playEnding = function () {
		var bpm = 180;
		var beat = 60 / bpm;
		var extra = beat / 10;
		var now = audioContext.currentTime;
		scheduleNote(64, now, beat*2 + extra);
		scheduleNote(67, now+beat*2, beat*1 + extra);
		scheduleNote(71, now+beat*3, beat*1 + extra);
		scheduleNote(69, now+beat*4, beat*2 + extra);
		scheduleNote(67, now+beat*6, beat*1 + extra);
		scheduleNote(69, now+beat*7, beat*1 + extra);
		scheduleNote(71, now+beat*8, beat*2 + extra);
		scheduleNote(74, now+beat*10, beat*2 + extra);
		scheduleNote(76, now+beat*12, beat*4 + extra);
	}

	this.playAddMessage = function () {
		var beat = 0.11;
		var extra = beat / 10;
		var now = audioContext.currentTime;
		scheduleNote(53, now, beat, 0.75, 0.5);
		scheduleNote(53, now+beat*1.1, beat,  0.75, 0.5);
	}

	this.update = function () {
	}

	window.up = function() {
		currentOctave++;
	}

	window.down = function() {
		currentOctave--;
	}

    return this;
}
