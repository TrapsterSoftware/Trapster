'use strict';
var gui = require('nw.gui'),
	win = gui.Window.get(),
	app = gui.App,
	path = require("path");
window.onload = function() { win.show(); }

var main = function() {
	function classHelper(r, a, c) {
		c = c || 'hide';
		if(r != '') { $(r).removeClass(c); }
		if(a != '') { $(a).addClass(c); }
	}
	win.on('restore', function() {
		win.resizeTo(870, 630);
	});
	gui.App.on('open', function(cmd) {
		audioPlayer.singleFile(cmd);
	});

	var appSettings = {
		minimizeToTray: false,
		alwaysOnTop: false,
		progressBar: false,
		autoUpdate: false,
		updateCheckInterval: 1
	};
	var settingsChange = {
		save: function() {
			localStorage.setItem('app_settings', JSON.stringify(appSettings));
		},
		minimizeToTray: function() {
			if(appSettings.minimizeToTray === true) {
				appSettings.minimizeToTray = false;
				classHelper('#mToTrayUnchecked', '#mToTrayChecked');
				settingsChange.save();
			} else {
				appSettings.minimizeToTray = true;
				classHelper('#mToTrayChecked', '#mToTrayUnchecked');
				settingsChange.save();
			}
		},
		alwaysOnTop: function() {
			if(appSettings.alwaysOnTop === true) {
				appSettings.alwaysOnTop = false;
				classHelper('#alwaysTopUnch', '#alwaysTopCh');
				win.setAlwaysOnTop(false);
				settingsChange.save();
			} else {
				appSettings.alwaysOnTop = true;
				classHelper('#alwaysTopCh', '#alwaysTopUnch');
				win.setAlwaysOnTop(true);
				settingsChange.save();
			}
		},
		progressBar: function() {
			if(appSettings.progressBar === true) {
				appSettings.progressBar = false;
				classHelper('#progressBarUnch', '#progressBarCh');
				win.setProgressBar(0);
				settingsChange.save();
			} else {
				appSettings.progressBar = true;
				classHelper('#progressBarCh', '#progressBarUnch');
				settingsChange.save();
			}
		},
		autoUpdate: function() {
			if(appSettings.autoUpdate === true) {
				appSettings.autoUpdate = false;
				classHelper('#autoUpdateUnch', '#autoUpdateCh');
				settingsChange.save();
			} else {
				appSettings.autoUpdate = true;
				classHelper('#autoUpdateCh', '#autoUpdateUnch');
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
		loop: false,
		singleFile: false
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
		win.setMaximumSize(870, 630);
		win.setMinimumSize(870, 630);
		win.setResizable(false);

		// Playing music using default windows app
		var startFile = gui.App.argv;
		if(startFile.length === 1) {
			currentSong.singleFile = true;
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
			classHelper('#mToTrayChecked', '#mToTrayUnchecked');
		} else {
			classHelper('#mToTrayUnchecked', '#mToTrayChecked');
		}
		if(appSettings.alwaysOnTop === true) {
			classHelper('#alwaysTopCh', '#alwaysTopUnch');
			win.setAlwaysOnTop(true);
		} else {
			classHelper('#alwaysTopUnch', '#alwaysTopCh');
			win.setAlwaysOnTop(false);
		}
		if(appSettings.progressBar === true) {
			classHelper('#progressBarCh', '#progressBarUnch');
		} else {
			classHelper('#progressBarUnch', '#progressBarCh');
		}
		if(appSettings.autoUpdate === true) {
			classHelper('#autoUpdateCh', '#autoUpdateUnch');
		} else {
			classHelper('#autoUpdateUnch', '#autoUpdateCh');
		}
		$('#check-interval').val(appSettings.updateCheckInterval);

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
				classHelper('', '#shuffle', 'active');
			} else {
				currentSong.shuffle = false;
				classHelper('#shuffle', '', 'active');
			}
		}
		if(typeof volume != 'object' && volume != '') {
			volumeControl.val(Number(volume) * 100);
			audio.volume = Number(volume);
		}

		// Importing saved playlist
		if(typeof localStorage.getItem('saved_playlist') === 'string') {
			if(localStorage.getItem('saved_playlist') === '[]') {
				$('.playlist #list').empty();
				$('.playlist #list').append('<h2>No song in playlist</h2>');
			} else {
				musicList = JSON.parse(localStorage.getItem('saved_playlist'));
				$('.playlist #list').empty();
				for(var i = 0; i < musicList.length; i++) {
					var index = i;
					var html = '<li data-index="'+index+'">'+musicList[i].name+'</li>';
					$('.playlist #list').append(html);
				}
			}
		} else {musicList = [];}
	};

	var audioPlayer = {
		windowResize: function(mode) {
			switch(mode) {
				case 'min':
					win.setMaximumSize(484, 110);
					win.setMinimumSize(484, 110);
					win.width = 484;
					win.height = 110;
					win.restore();
				break;

				case 'max':
					win.setMaximumSize(870, 630);
					win.setMinimumSize(870, 630);
					win.width = 870;
					win.height = 630;
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

			currentSong.singleFile = true;

			playBtn.addClass('hide');
			pauseBtn.removeClass('hide');
			audioPlayer.currentSongTitle();
			audio.src = songPath;
			audio.play();
		},
		clearPlaylist: function() {
			$('.playlist #list').empty().append('<h2>No song in playlist</h2>');
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
			classHelper('#play', '#pause');
			$('.song-title h4').text('No song currently playing');
			win.title = 'Trapster';
			$('.title-bar .title').text(win.title);
		},
		currentSongTitle: function() {
			if(currentSong.name.length > 45 && currentSong.singleFile === true) {
				var title = currentSong.name.slice(0, 45) + '...';
				$('.song-title h4').text(title);
				win.title = 'Trapster' + ' - ' + title;
				$('.title-bar .title').text(win.title);
			} else {
				$('.song-title h4').text(currentSong.name);
				win.title = 'Trapster' + ' - ' + currentSong.name;
				$('.title-bar .title').text(win.title);
			}
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
				classHelper('#repeatTrackMin', '#repeatAllMin');
				classHelper('#repeatTrack', '#repeatAll');
				localStorage.setItem('player_loop', true);
				currentSong.loop = true;
				audio.loop = true;
			} else {
				classHelper('#repeatAllMin', '#repeatTrackMin');
				classHelper('#repeatAll', '#repeatTrack');
				localStorage.setItem('player_loop', false);
				currentSong.loop = false;
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

				$('.playlist #list').empty();

				var files = fileList[0].files;
				for(var i = 0; i < files.length; i++) {
					musicList.push(files[i]);
				}
				for(var i = 0; i < musicList.length; i++) {
					var index = i;
					var html = '<li data-index="'+index+'">'+musicList[i].name+'</li>';
					$('.playlist #list').append(html);
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
		},
		playSearched: function(song) {
			for(var i = 0; i < musicList.length; i++) {
				if(musicList[i].name == song) {
					currentSong.name = musicList[i].name;
					currentSong.index = i;
					currentSong.path = musicList[i].path;
					audio.src = musicList[i].path;
				}
			}
			audioPlayer.play();
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
			case 'repeatAllMin':
				audioPlayer.songLoop('track');
			break;

			case 'repeatTrack':
			case 'repeatTrackMin':
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
			case 'mToTrayUnchecked':
				settingsChange.minimizeToTray();
			break;

			case 'alwaysTopCh':
			case 'alwaysTopUnch':
				settingsChange.alwaysOnTop();
			break;

			case 'progressBarCh':
			case 'progressBarUnch':
				settingsChange.progressBar();
			break;

			case 'large':
				audioPlayer.windowResize('max');
				currentSong.singleFile = false;
			break;

			case 'update':
				update();
			break;

			case 'checkForUpdate':
				update_check();
			break;

			case 'autoUpdateCh':
			case 'autoUpdateUnch':
				settingsChange.autoUpdate();
			break;

			case 'exit-app':
				win.close();
			break;
		}
	});

	// Playlist context menu
	var contextMenu = new gui.Menu(), cmFileId;
	contextMenu.append(new gui.MenuItem({
		label: 'Show in folder',
		click: function() {
			var path = musicList[cmFileId].path;
			cmFileId = '';
			gui.Shell.showItemInFolder(path);
		}
	}));
	$('.playlist #list').on('contextmenu', function(e) {
		e.preventDefault();
		cmFileId = e.target.attributes['data-index'].value;
		contextMenu.popup(e.clientX, e.clientY);
	});

	// Audio player tray
	var tray = new gui.Tray({title: 'Trapster', icon: 'app/trapster.png'});
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
		win.resizeTo(870, 630);
	});

	// Music search
	$('input#musicSearch').keypress(function() {
		$('.playlist #searched').empty();
		var value = $('#musicSearch').val().toLowerCase();;
		for(var i = 0; i < musicList.length; i++) {
			var name = musicList[i].name.toLowerCase();
			name = name.search(value);
			if(name != -1) {
				var html = '<li data-index="'+i+'">'+musicList[i].name+'</li>';
				$('.playlist #searched').append(html);
			}
		}
		$('.playlist #list').addClass('hide');
		$('.playlist #searched').removeClass('hide');
	}).focusin(function() {
		$('.playlist #list').addClass('hide');
	});

	// Play the song selected from the playlist
	$('.playlist ul').on('click', 'li', function(e) {
		e.preventDefault();

		currentSong.index = $(this).data('index');
		var index = currentSong.index;

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
		currentSong.singleFile = false;
		$('.playlist #list').removeClass('hide');
		$('.playlist #searched').addClass('hide');
		$('#musicSearch').val('');
		audioPlayer.activeSong();
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
		if(currentSong.singleFile === false) {
			if(audio.ended) { audioPlayer.next(); }
		}
		if(audio.ended && currentSong.singleFile === true) { audioPlayer.stop(); }
		audioPlayer.songDuration();
	}, 1000);

	// Updating the seek bar
	audio.addEventListener('timeupdate', function() {
		audioSeek.val(parseInt(audio.currentTime, 10));

		if(appSettings.progressBar === true) {
			var songProgress;
			songProgress = parseInt(audio.currentTime, 10) / parseInt(audio.duration, 10);
			songProgress = songProgress * 100;
			songProgress = songProgress / 100;
			songProgress = songProgress * 1;
			win.setProgressBar(songProgress);
		}
	}, false);

	// Updating the current time of the song
	audioSeek.on('change', function() {
		audio.currentTime = audioSeek.val();
	});

	// Checking for update
	$('#check-interval').on('change', function(e) {
		e.preventDefault();
		appSettings.updateCheckInterval = $(this).val();
		settingsChange.save();
	});
	setInterval(function() {
		update_check();
		if(appSettings.autoUpdate === true) {
			update();
		}
	}, (appSettings.updateCheckInterval * 3600) * 1000);

	// Initializing some features of player
	init();
};

$(document).ready(main);

// var fs = require('fs');
function dev() {
	win.reloadDev();
}

// function ss(name) {
// 	win.capturePage(function(img) {
// 		var base64Data = img.replace(/^data:image\/(png|jpg|jpeg);base64,/, "");
// 		fs.writeFile(name + ".png", base64Data, 'base64', function(err) {
// 			console.log(err);
// 		});
// 	}, 'png');
// 	console.log('snapshot taken');
// }
function log(log) {
	console.log(log);
}
function update() {
	gui.Window.open('app://trapster/app/updater.html', {
        position: 'center',
        width: 250,
        height: 170,
        frame: false,
        toolbar: false,
        resizable: false,
        focus: true
    });
    win.hide();
}
function update_check() {
	var request = new XMLHttpRequest();
	request.open('GET', 'https://api.github.com/repos/TrapsterMusic/Updater/releases/latest', false);
	request.send();
	var json = JSON.parse(request.response);
	var tag = json.tag_name;
	if(tag > app.manifest.version) {
		$('#update').removeClass('hide');
		var notification = new Notification('A newer version is available');
	} else {
		console.log('No update found');
	}
}
