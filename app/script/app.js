var gui = require('nw.gui'),
	win = gui.Window.get();

onload = function() { win.show(); }

var main = function() {
	win.on('restore', function() {
		win.resizeTo(850, 500);
	});
	$('#devTools').click(function() {
		win.showDevTools();
	});

	// $('#musicSearch').on('change', function(e) {
	// 	console.log("Event: ", e);
	// 	console.log($(this).val());
	// });

	// var tray = new gui.Tray({title: 'Trapster'});

	// Control the options dialog
	$('#settings').click(function() {
		$('.modal-settings').removeClass('hide');
	});
	$('#settingsClose').click(function() {
		$('.modal-settings').addClass('hide');
	});

	var appSettings = {
			notifications: false
		},
		musicList = [],
		audioSeek = $('#audio-seek'),
		fileList = $('#fileList'),
		playBtn = $('#play'),
		pauseBtn = $('#pause'),
		prevBtn = $('#prev'),
		nextBtn = $('#next'),
		volUpBtn = $('#volUp'),
		volDownBtn = $('#volDown'),
		getMusicBtn = $('#getMusic'),
		repeatAll = $('#repeatAll'),
		repeatTrack = $('#repeatTrack'),
		currentSong = {
			name: '',
			index: 0,
			path: '',
			volume: 1.0, 
			loop: false,
			shuffle: false
		},
		audio = new Audio();

	// Clear playlist
	var clearPlaylist = function() {
		$('.playlist ul').empty();
		$('.playlist ul').append('<h2>No song in playlist</h2>');
		musicList = [];
		localStorage.setItem('saved_playlist', '[]');
	};
	$('#clearPlaylist').click(function() { clearPlaylist(); });

	// Save playlist
	var savePlayList = function() {
		localStorage.setItem('saved_playlist', JSON.stringify(musicList));
		console.log("Palylist saved!");
	};
	$('#savePlaylist').click(function() { savePlayList(); });

	// Stop button
	var stop = function() {
		audio.pause();
		audio.currentTime = 0;
		$('#play').removeClass('hide');
		$('#pause').addClass('hide');
	};
	$('#stop').click(function() { stop(); });

	// Notifications settings
	var notificationSettings = function(mode) {
		if(mode === 'on' && appSettings.notifications === false) {
			appSettings.notifications = true;
			$('#notificationOn').addClass('hide');
			$('#notificationOff').removeClass('hide');
		} else if(mode === 'off' && appSettings.notifications === true) {
			appSettings.notifications = false;
			$('#notificationOn').removeClass('hide');
			$('#notificationOff').addClass('hide');
		}
	};
	if(appSettings.notifications === true) {
		$('#notificationOn').addClass('hide');
		$('#notificationOff').removeClass('hide');
	} else {
		$('#notificationOn').removeClass('hide');
		$('#notificationOff').addClass('hide');
	}
	$('#notificationOn').click(function() { notificationSettings('on'); });
	$('#notificationOff').click(function() { notificationSettings('off'); });

	// Current song title
	var currentSongTitle = function() {
		$('.song-title h3').text(currentSong.name);
		win.title = 'Trapster' + ' - ' + currentSong.name;
	};

	// Shuffle play
	var shuffle = function(index) {
		if(currentSong.shuffle === true) {
			return Math.floor(Math.random() * (musicList.length - 0 + 1)) + 0;
		} else {
			return index;
		}
	};
	var shuffleChange = function() {
		if(currentSong.shuffle === true) {
			// Stop shuffle
			$('#shuffle').removeClass('active');
			currentSong.shuffle = false;
		} else {
			// Turn on shuffle
			$('#shuffle').addClass('active');
			currentSong.shuffle = true;
		}
	};
	if(currentSong.shuffle === true) { $('#shuffle').addClass('active'); }
	$('#shuffle').click(function() { shuffleChange(); })

	// Setting player settings from the currentSong object
	$('#volume-control').val(currentSong.volume);
	audio.volume = currentSong.volume;
	audio.loop = currentSong.loop;
	if(currentSong.loop) {
		repeatTrack.removeClass('hide');
		repeatAll.addClass('hide');
	} else {
		repeatTrack.addClass('hide');
		repeatAll.removeClass('hide');
	}
	$('#volume-control').val(currentSong.volume * 100);
	if(typeof localStorage.getItem('saved_playlist') === 'string') {
		if(localStorage.getItem('saved_playlist') === '[]') {
			$('.playlist ul').empty();
			$('.playlist ul').append('<h2>No song in playlist</h2>');
		} else {
			musicList = JSON.parse(localStorage.getItem('saved_playlist'));
			$('.playlist ul').empty();
			for(var i = 0; i < musicList.length; i++) {
				var index = i;
				var html = '<li data-index="'+index+'"><span class="title">'+musicList[i].name+'</span></li>';
				$('.playlist ul').append(html);
			}
		}
	} else {musicList = [];}

	// Notifications
	var notificationsSettings = function(mode, text) {
		var currSeting = appSettings.notifications;
		if(mode === 'on' && currSeting === false) {
			appSettings.notifications = true;
		} else if(mode === 'off' && currSeting === true) {
			appSettings.notifications = false;
		} else { }
		if(mode === 'display' && appSettings.notifications === true) {
			var not = new Notification(text);
		}
	};

	// Song duration
	var songDuration = function() {
		audioSeek.attr("max", parseInt(audio.duration, 10));
	};

	// Song loop
	var songLoop = function(mode) {
		if(mode === 'track') {
			repeatAll.addClass('hide');
			repeatTrack.removeClass('hide');
			audio.loop = true;
		} else {
			repeatAll.removeClass('hide');
			repeatTrack.addClass('hide');
			audio.loop = false;
		}
		
	};
	repeatAll.click(function() { songLoop('track'); });
	repeatTrack.click(function() { songLoop(); });

	// Get music list
	getMusicBtn.click(function() {
		fileList.change(function(e){
			e.preventDefault();

			$('.playlist ul').empty();

			var files = fileList[0].files;
			for(var i = 0; i < files.length; i++) {
				musicList.push(files[i]);
			}
			for(var i = 0; i < musicList.length; i++) {
				var index = i;
				var html = '<li data-index="'+index+'"><span class="title">'+musicList[i].name+'</span></li>';
				// var datalistHtml = '<option data-index="'+index+'" value="'+musicList[i].name+'">'+index+'</option>';
				// $('datalist#musicList').append(datalistHtml);
				$('.playlist ul').append(html);
			}
			notificationsSettings('display', "Music added to your list");
			fileList.val('');
		});
		fileList.click();
	});

	// Player select
	$('.playlist ul').on('click', 'li', function(e) {
		e.preventDefault();

		currentSong.index = $(this).data('index');
		index = currentSong.index;

		playBtn.addClass('hide');
		pauseBtn.removeClass('hide');

		audio.src = musicList[index].path;
		currentSong.name = musicList[index].name;
		currentSong.path = musicList[index].path;
		
		currentSongTitle();
		notificationsSettings('display', "Playing " + currentSong.name);
		audio.play();

		$('.playlist ul li').removeClass('active');
		$(this).addClass('active');
	});

	// Volume control
	$('#volume-control').on('change', function() {
		var volume = $('#volume-control').val() / 100;
		currentSong.volume = volume;
		audio.volume = volume;
	});

	// Play control
	var playerPlay = function() {
		playBtn.addClass('hide');
		pauseBtn.removeClass('hide');

		$('.playlist ul li').removeClass('active');
		$('[data-index="'+currentSong.index+'"]').addClass('active');

		if(currentSong.name === '') {
			currentSong.name = musicList[0].name;
			currentSong.index = 0;
			currentSong.path = musicList[0].path;
			audio.src = musicList[0].path;
		}

		currentSongTitle();
		notificationsSettings('display', "Playing " + currentSong.name);

		audio.play();
	};
	playBtn.click(function(e) { playerPlay(); });

	// Pause control
	var playerPause = function() {
		pauseBtn.addClass('hide');
		playBtn.removeClass('hide');

		$('.playlist ul li').removeClass('active');

		audio.pause();
	};
	pauseBtn.click(function(e) { playerPause(); });

	// Prev control
	var playerPrev = function() {
		var prevIndex = currentSong.index - 1;

		prevIndex = shuffle(prevIndex);

		if(currentSong.index === 0) {
			prevIndex = musicList.length - 1;
		} 

		var prev = musicList[prevIndex];
		currentSong.name = prev.name;
		currentSong.path = prev.path;
		currentSong.index = prevIndex;
		audio.src = prev.path;

		$('.playlist ul li').removeClass('active');
		$('[data-index="'+prevIndex+'"]').addClass('active');

		currentSongTitle();
		notificationsSettings('display', "Playing " + currentSong.name);

		audio.play();
	};
	prevBtn.click(function(e) { playerPrev(); });

	// Next control
	var playerNext = function() {
		var nextIndex = currentSong.index + 1;

		nextIndex = shuffle(nextIndex);

		if(nextIndex === musicList.length) {
			nextIndex = 0;
		}

		var next = musicList[nextIndex];
		currentSong.name = next.name;
		currentSong.path = next.path;
		currentSong.index = nextIndex;
		audio.src = next.path;

		$('.playlist ul li').removeClass('active');
		$('[data-index="'+nextIndex+'"]').addClass('active');

		currentSongTitle();
		notificationsSettings('display', "Playing " + currentSong.name);

		audio.play();
	}
	nextBtn.click(function() { playerNext(); });

	// Remote control functionality
	// peer.on('connection', function(conn) {
	// 	conn.on('data', function(command){
	//  		switch(command) {
	//  			case 'play':
	//  				playerPlay();
 // 				break;

 // 				case 'pause':
	//  				playerPause();
 // 				break;

 // 				case 'next':
	//  				playerNext();
 // 				break;

 // 				case 'prev':
	//  				playerPrev();
 // 				break;

 // 				case 'volUp':
	//  				playerVolUp();
 // 				break;

 // 				case 'volDown':
	//  				playerVolDown();
 // 				break;
	//  		}
	// 	});
	// });

	// Checking if the current song is finished
	setInterval(function() {
		if(audio.ended) { 
			playerNext();
		}
		songDuration();
	}, 1000);

	// Updating the seek bar
	audio.addEventListener('timeupdate', function() {
		audioSeek.val(parseInt(audio.currentTime, 10));
	}, false);

	// Updating the current time of the song 
	audioSeek.on('change', function() {
		audio.currentTime = audioSeek.val();
	});
};

$(document).ready(main);
