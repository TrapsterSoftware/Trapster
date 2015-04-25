var gui = require('nw.gui'),
	win = gui.Window.get();

onload = function() { win.show(); }

var main = function() {
	win.on('restore', function() {
		win.resizeTo(850, 500);
	});

	var currentSong = {
		name: '',
		index: 0,
		path: '',
		volume: 1, 
		loop: false,
		shuffle: false
	};
	var audio = new Audio();
	var musicList = [];
	var audioSeek = $('#audio-seek'),
		fileList = $('#fileList'),
		playBtn = $('#play'),
		pauseBtn = $('#pause'),
		prevBtn = $('#prev'),
		nextBtn = $('#next'),
		volUpBtn = $('#volUp'),
		volDownBtn = $('#volDown'),
		getMusicBtn = $('#getMusic'),
		repeatAll = $('#repeatAll'),
		repeatTrack = $('#repeatTrack');
	var init = function() {
		// shuffle
		if(currentSong.shuffle === true) { $('#shuffle').addClass('active'); }

		// Audio volume
		$('#volume-control').val(currentSong.volume * 100);
		audio.volume = currentSong.volume;

		// Audio loop
		audio.loop = currentSong.loop;
		if(currentSong.loop) {
			repeatTrack.removeClass('hide');
			repeatAll.addClass('hide');
		} else {
			repeatTrack.addClass('hide');
			repeatAll.removeClass('hide');
		}

		// Importing saved playlist
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



		
	};
	var audioPlayer = {
		clearPlaylist: function() {
			$('.playlist ul').empty();
			$('.playlist ul').append('<h2>No song in playlist</h2>');
			musicList = [];
			localStorage.setItem('saved_playlist', '[]');
		}, 
		savePlayList: function() {
			localStorage.setItem('saved_playlist', JSON.stringify(musicList));
			console.log("Palylist saved!");
		}, 
		stop: function() {
			audio.pause();
			audio.currentTime = 0;
			$('.playlist ul li').removeClass('active');
			$('#play').removeClass('hide');
			$('#pause').addClass('hide');
			$('.song-title h3').text('No song currently playing');
			win.title = 'Trapster';
		}, 
		currentSongTitle: function() {
			$('.song-title h3').text(currentSong.name);
			win.title = 'Trapster' + ' - ' + currentSong.name;
		}, 
		shuffle: function(index) {
			if(currentSong.shuffle === true) {
				return Math.floor(Math.random() * (musicList.length - 0 + 1)) + 0;
			} else {
				return index;
			}
		}, 
		shuffleChange: function() {
			if(currentSong.shuffle === true) {
				// Stop shuffle
				$('#shuffle').removeClass('active');
				currentSong.shuffle = false;
			} else {
				// Turn on shuffle
				$('#shuffle').addClass('active');
				currentSong.shuffle = true;
			}
		},
		songDuration: function() {
			audioSeek.attr("max", parseInt(audio.duration, 10));
		}, 
		 songLoop: function(mode) {
			if(mode === 'track') {
				repeatAll.addClass('hide');
				repeatTrack.removeClass('hide');
				audio.loop = true;
			} else {
				repeatAll.removeClass('hide');
				repeatTrack.addClass('hide');
				audio.loop = false;
			}
			
		}, 
		play: function() {
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

			audioPlayer.currentSongTitle();

			audio.play();
		}, 
		pause: function() {
			pauseBtn.addClass('hide');
			playBtn.removeClass('hide');

			$('.playlist ul li').removeClass('active');

			audio.pause();
		},
		prev: function() {
			var prevIndex = currentSong.index - 1;

			prevIndex = audioPlayer.shuffle(prevIndex);

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

			audioPlayer.currentSongTitle();

			audio.play();
		},
		next: function() {
			var nextIndex = currentSong.index + 1;

			nextIndex = audioPlayer.shuffle(nextIndex);

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

			audioPlayer.currentSongTitle();

			audio.play();
		}, 
		getMusic: function() {
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
				fileList.val('');
			});
			fileList.click();
		}
	};

	$('body').on('click', '*', function() {
		var id = $(this).attr('id');
		// console.log(id);
		switch(id) {
			case 'prev': 
				audioPlayer.prev();
			break;

			case 'play': 
				audioPlayer.play();
			break;

			case 'pause': 
				audioPlayer.pause();
			break;

			case 'next': 
				audioPlayer.next();
			break;

			case 'getMusic': 
				audioPlayer.getMusic();
			break;

			case 'repeatAll': 
				audioPlayer.songLoop('track');
			break;

			case 'repeatTrack': 
				audioPlayer.songLoop();
			break;

			case 'shuffle': 
				audioPlayer.shuffleChange();
			break;

			case 'stop': 
				audioPlayer.stop();
			break;

			case 'savePlaylist': 
				audioPlayer.savePlayList();
			break;

			case 'clearPlaylist': 
				audioPlayer.clearPlaylist();
			break;

			case 'settings': 
				$('.modal-settings').removeClass('hide');
			break;

			case 'devTools': 
				win.showDevTools();
			break;

			case 'settingsClose': 
				$('.modal-settings').addClass('hide');
			break;

			case 'settingsSave': 
				
			break;
		}
	});

	// Play the song selected from the playlist
	$('.playlist ul').on('click', 'li', function(e) {
		e.preventDefault();

		currentSong.index = $(this).data('index');
		index = currentSong.index;

		playBtn.addClass('hide');
		pauseBtn.removeClass('hide');

		audio.src = musicList[index].path;
		currentSong.name = musicList[index].name;
		currentSong.path = musicList[index].path;
		
		audioPlayer.currentSongTitle();
		// notificationsSettings('display', "Playing " + currentSong.name);
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

	// Checking if the current song is finished
	setInterval(function() {
		if(audio.ended) { 
			audioPlayer.playerNext();
		}
		audioPlayer.songDuration();
	}, 1000);

	// Updating the seek bar
	audio.addEventListener('timeupdate', function() {
		audioSeek.val(parseInt(audio.currentTime, 10));
	}, false);

	// Updating the current time of the song 
	audioSeek.on('change', function() {
		audio.currentTime = audioSeek.val();
	});

	// Initializing some features of player
	init();

};

$(document).ready(main);