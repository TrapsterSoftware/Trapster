var fs = require('fs');

fs.watchFile('app/index.html', function(){ win.reload(); });
fs.watchFile('app/js/app.js', function(){ win.reload(); });
fs.watchFile('app/stylesheets/main.css', function(){ win.reload(); });
fs.watchFile('app/stylesheets/toolbar.css', function(){ win.reload(); });
fs.watchFile('app/stylesheets/playlist.css', function(){ win.reload(); });
fs.watchFile('app/stylesheets/player.css', function(){ win.reload(); });