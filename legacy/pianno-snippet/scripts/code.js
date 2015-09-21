var iframe = document.getElementById("piano_snippet_iframe");
(function() {
	var textbox = document.getElementById("searchText"),
	recording_url = document.getElementById("recording_url"),
	start_record_button = document.getElementById("record_button"),
	stop_record_button = document.getElementById("stop_record_button"),
	playback_button = document.getElementById("playback_button"),
	enable_button = document.getElementById('enable_piano'),
	piano_controls = document.getElementById('piano_controls'),

	channels = {},
	recordingBuffer = [],
	is_recording = false,
	delay_start = 0,

	keymap = {
		65: 'c',  // a
		87: 'cs', // w
		83: 'd',  // s
		69: 'eb', // e
		68: 'e',  // d
		70: 'f',  // f
		84: 'fs', // t
		71: 'g',  // g
		89: 'gs', // y
		72: 'a',  // h
		85: 'bb', // u
		74: 'b',  // j
	};

	function getCurrentTime() {
		return (new Date()).getTime();
	}

	function receiveAudioData(e) {
	    loadAudioData(JSON.parse(e.data));
	}

	function loadAudioData(data) {
		for (note in data) {
			channels[note] = new Audio("data:audio/ogg;base64," + data[note]);
		}
	}

	function keyDownCallback(e) {
		if (e.keyCode in keymap) {
			var key_str = keymap[e.keyCode];
			playNote(key_str);
		}
	}

	function playNote(note) {
		var key = channels[note];
		key.pause();
		key.currentTime = 0;
		key.play();

		if (is_recording) {
			var cur_time = (new Date()).getTime();
			recordingBuffer.push(cur_time - delay_start);
			delay_start = cur_time;
			recordingBuffer.push(note);
		}
	}

	function startRecording() {
		is_recording = true;
		recordingBuffer = [];
		delay_start = (new Date()).getTime();
	}

	function stopRecording() {
		is_recording = false;
		recording_url.value = recordingBuffer.join(";");
	}

	function playbackCallback() {
		playbackRecording(recording_url.value.split(";"));
	}

	function playbackRecording(rec_actions) {
		if (rec_actions.length > 1) {
			var delay = rec_actions.shift();
			var note = rec_actions.shift();
			var last_event = getCurrentTime();;

			var playback_interval = setInterval(function() {
				var current_time = getCurrentTime();
				if (current_time - last_event > delay) {
					playNote(note);
					last_event = current_time;

					if (rec_actions.length > 1) {
						delay = rec_actions.shift();
						note = rec_actions.shift();
					} else {
						clearInterval(playback_interval);
					}
				}
			}, 15);
		}
	}

	enable_button.addEventListener('click', function() {
		window.addEventListener('keydown', keyDownCallback, false);
		piano_controls.style.display = 'block';
		enable_button.style.display = 'none';
	}, false);

	window.addEventListener('message', receiveAudioData, false);
	start_record_button.addEventListener('click', startRecording, false);
	stop_record_button.addEventListener('click', stopRecording, false);
	playback_button.addEventListener('click', playbackCallback, false);
})();