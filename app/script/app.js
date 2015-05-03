var gui = require('nw.gui'),
	win = gui.Window.get();

onload = function() { win.show(); }

var main = function() {
	win.on('restore', function() {
		win.resizeTo(850, 500);
	});
	gui.App.on('open', function(cmd) {
		audioPlayer.singleFile(cmd);
	});

	var appSettings = {
		minimizeToTray: false
	};
	var settingsChange = {
		save: function() {
			localStorage.setItem('app_settings', JSON.stringify(appSettings));
		}, 
		minimizeToTray: function() {
			if(appSettings.minimizeToTray === true) {
				appSettings.minimizeToTray = false;
				$('#mToTrayChecked').addClass('hide');
				$('#mToTrayUnchecked').removeClass('hide');
				settingsChange.save();
			} else {
				appSettings.minimizeToTray = true;
				$('#mToTrayChecked').removeClass('hide');
				$('#mToTrayUnchecked').addClass('hide');
				settingsChange.save();
			}
		}
	};
	var currentSong = {
		name: '',
		index: 0,
		path: '',
		volume: 1,
		shuffle: false,
		loop: false
	};
	var audio = new Audio();
	audio.loop = false;
	var notification;
	var musicList = [];
	var audioSeek = $('#audio-seek'),
		volumeControl = $('#volume-control'),
		fileList = $('#fileList'),
		playBtn = $('#play'),
		pauseBtn = $('#pause'),
		prevBtn = $('#prev'),
		nextBtn = $('#next'),
		getMusicBtn = $('#getMusic'),
		repeatAll = $('#repeatAll'),
		repeatTrack = $('#repeatTrack');
	var init = function() {
		// Window properties
		win.setMaximumSize(850, 500);
		win.setMinimumSize(850, 500);
		win.setResizable(false);

		// Playing music using default windows app
		var startFile = gui.App.argv;
		if(startFile.length === 1) {
			audioPlayer.windowResize('min');
			audioPlayer.singleFile(gui.App.argv);
		}

		// Persistent settings
		if( typeof localStorage.getItem('app_settings') === 'object' || localStorage.getItem('app_settings') === '' ) {
			localStorage.setItem('app_settings', JSON.stringify(appSettings));
		} else {
			appSettings = JSON.parse(localStorage.getItem('app_settings'));
		}
		if(appSettings.minimizeToTray === true) {
			$('#mToTrayChecked').removeClass('hide');
			$('#mToTrayUnchecked').addClass('hide');
		} else {
			$('#mToTrayChecked').addClass('hide');
			$('#mToTrayUnchecked').removeClass('hide');
		}

		var loop = localStorage.getItem('player_loop');
		var volume = localStorage.getItem('player_volume');
		var shuffle = localStorage.getItem('player_shuffle');
		if(typeof loop != 'object' && loop != '') {
			if(loop === 'true') {
				currentSong.loop = true;
				audio.loop = true;
				repeatAll.addClass('hide');
				repeatTrack.removeClass('hide');
			} else {
				currentSong.loop = false;
				audio.loop = false;
				repeatAll.removeClass('hide');
				repeatTrack.addClass('hide');
			}
		}
		if(typeof shuffle != 'object' && shuffle != '') {
			if(shuffle === 'true') {
				currentSong.shuffle = true;
				$('#shuffle').addClass('active');
			} else {
				currentSong.shuffle = false;
				$('#shuffle').removeClass('active');
			}
		}
		if(typeof volume != 'object' && volume != '') {
			volumeControl.val(Number(volume) * 100);
			audio.volume = Number(volume);
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
					var html = '<li data-index="'+index+'">'+musicList[i].name+'</li>';
					$('.playlist ul').append(html);
				}
			}
		} else {musicList = [];}
	};

	var audioPlayer = {
		windowResize: function(mode) {
			switch(mode) {
				case 'min':
					win.setMaximumSize(484, 69);
					win.setMinimumSize(484, 69);
					win.width = 484;
					win.height = 69;
					win.restore();
				break;

				case 'max':
					win.setMaximumSize(850, 500);
					win.setMinimumSize(850, 500);
					win.width = 850;
					win.height = 500;
					win.restore();
				break;
			}
		}, 
		singleFile: function(cmd) {
			var songPath, songName;
			if(cmd.length === 1) {
				songPath = cmd[0];
				songName = songPath.split('\\');
				songName = songName[songName.length - 1]
			} else {
				songPath = cmd.split('"');
				songPath = songPath[songPath.length - 2];
				songName = songPath.split('\\');
				songName = songName[songName.length - 1];
			}
			currentSong.name = songName;
			currentSong.path = songPath;
			
			playBtn.addClass('hide');
			pauseBtn.removeClass('hide');
			audioPlayer.currentSongTitle();
			audio.src = songPath;
			audio.play();
		}, 
		clearPlaylist: function() {
			$('.playlist ul').empty();
			$('.playlist ul').append('<h2>No song in playlist</h2>');
			musicList = [];
			localStorage.setItem('saved_playlist', '[]');
		}, 
		savePlayList: function() {
			localStorage.setItem('saved_playlist', JSON.stringify(musicList));
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
				localStorage.setItem('player_shuffle', false);
			} else {
				// Turn on shuffle
				$('#shuffle').addClass('active');
				currentSong.shuffle = true;
				localStorage.setItem('player_shuffle', true);
			}
		},
		songDuration: function() {
			audioSeek.attr("max", parseInt(audio.duration, 10));
		}, 
		songLoop: function(mode) {
			if(mode === 'track') {
				repeatAll.addClass('hide');
				repeatTrack.removeClass('hide');
				localStorage.setItem('player_loop', true);
				audio.loop = true;
			} else {
				repeatAll.removeClass('hide');
				repeatTrack.addClass('hide');
				localStorage.setItem('player_loop', false);
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

			playBtn.addClass('hide');
			pauseBtn.removeClass('hide');

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

			playBtn.addClass('hide');
			pauseBtn.removeClass('hide');

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
					var html = '<li data-index="'+index+'">'+musicList[i].name+'</li>';
					// var datalistHtml = '<option data-index="'+index+'" value="'+musicList[i].name+'">'+index+'</option>';
					// $('datalist#musicList').append(datalistHtml);
					$('.playlist ul').append(html);
				}
				if(currentSong.name != '' && currentSong.path != '') {
					audioPlayer.activeSong();
				}
				fileList.val('');
			});
			fileList.click();
		}, 
		activeSong: function() {
			$('[data-index="'+currentSong.index+'"]').addClass('active');
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

			case 'mToTrayChecked':
				settingsChange.minimizeToTray();
			break;

			case 'mToTrayUnchecked':
				settingsChange.minimizeToTray();
			break;

			case 'large':
				audioPlayer.windowResize('max');
			break;
		}
	});

	// Playlist context menu
	var contextMenu = new gui.Menu(), cmFileId
	contextMenu.append(new gui.MenuItem({
		label: 'Show in folder', 
		click: function() {
			var path = musicList[cmFileId].path;
			cmFileId = '';
			gui.Shell.showItemInFolder(path);
		}
	}));
	$('.playlist ul').on('contextmenu', function(e) {
		e.preventDefault();
		cmFileId = e.target.attributes['data-index'].value;
		contextMenu.popup(e.clientX, e.clientY);
	});

	// Audio player tray
	var tray = new gui.Tray({title: 'Trapster', icon: 'trapster.png'});
	var trayMenu = new gui.Menu();
	trayMenu.append(new gui.MenuItem({
		label: 'Play', 
		icon: 'app/media/buttons/play.png', 
		click: function() {
			audioPlayer.play();
		}
	}));
	trayMenu.append(new gui.MenuItem({
		label: 'Pause', 
		icon: 'app/media/buttons/pause.png', 
		click: function() {
			audioPlayer.pause();
		}
	}));
	trayMenu.append(new gui.MenuItem({
		label: 'Previous', 
		icon: 'app/media/buttons/prev.png', 
		click: function() {
			audioPlayer.prev();
		}
	}));
	trayMenu.append(new gui.MenuItem({
		label: 'Next', 
		icon: 'app/media/buttons/next.png', 
		click: function() {
			audioPlayer.next();
		}
	}));
	trayMenu.append(new gui.MenuItem({
		label: 'Stop', 
		icon: 'app/media/buttons/stop.png', 
		click: function() {
			audioPlayer.stop();
		}
	}));
	trayMenu.append(new gui.MenuItem({
		label: 'Exit', 
		icon: 'app/media/buttons/exit.png', 
		click: function() {
			win.close();
		}
	}));

	tray.menu = trayMenu;

	win.on('minimize', function() {
		if(appSettings.minimizeToTray === true) {
			win.hide();
		}
	});
	tray.on('click', function() {
		win.show();
		win.resizeTo(850, 500);
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
	volumeControl.on('change', function() {
		var volume = $('#volume-control').val() / 100;
		localStorage.setItem('player_volume', volume);
		currentSong.volume = volume;
		audio.volume = volume;
	});

	// Checking if the current song is finished
	setInterval(function() {
		if(audio.ended) { 
			audioPlayer.next();
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