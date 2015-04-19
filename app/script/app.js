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

	// var tray = new gui.Tray({title: 'Trapster'});

	var musicList = [],
		audioSeek = $('#audio-seek'),
		fileList = $('#fileList'),
		playBtn = $('#play'),
		pauseBtn = $('#pause'),
		prevBtn = $('#prev'),
		nextBtn = $('#next'),
		volUpBtn = $('#volUp'),
		volDownBtn = $('#volDown'),
		getMusicBtn = $('#getMusic'),
		currentSong = {
			name: '',
			index: 0,
			path: '',
			volume: 1
		},
		audio = new Audio();

	// Setting player volume from the currentSong object
	audio.volume = currentSong.volume;

	// Song duration
	var songDuration = function() {
		audioSeek.attr("max", parseInt(audio.duration, 10));
	};

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
				$('.playlist ul').append(html);
			}
			var not = new Notification("Music added to your list");
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
		
		var not = new Notification("Playing " + currentSong.name);
		audio.play();

		$('.playlist ul li').removeClass('active');
		$(this).addClass('active');
	});

	// Volume control
	var playerVolUp = function() {
		if(audio.volume < 1) {
			audio.volume += 0.1;
			currentSong.volume = audio.volume;
		}
	};
	volUpBtn.click(function() { playerVolUp(); });

	var playerVolDown = function() {
		if(audio.volume > 0) {
			audio.volume -= 0.1;
			currentSong.volume = audio.volume;
		}
	};
	volDownBtn.click(function(e) { playerVolDown(); });

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

		var not = new Notification("Playing " + currentSong.name);

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

		var not = new Notification("Playing " + currentSong.name);

		audio.play();
	};
	prevBtn.click(function(e) { playerPrev(); });

	// Next control
	var playerNext = function() {
		var nextIndex = currentSong.index + 1;

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

		var not = new Notification("Playing " + currentSong.name);

		audio.play();
	}
	nextBtn.click(function() { playerNext(); });

	// Remote control functionality
	peer.on('connection', function(conn) {
		conn.on('data', function(command){
	 		switch(command) {
	 			case 'play':
	 				playerPlay();
 				break;

 				case 'pause':
	 				playerPause();
 				break;

 				case 'next':
	 				playerNext();
 				break;

 				case 'prev':
	 				playerPrev();
 				break;

 				case 'volUp':
	 				playerVolUp();
 				break;

 				case 'volDown':
	 				playerVolDown();
 				break;
	 		}
		});
	});

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