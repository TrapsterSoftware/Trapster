var fs, http, gui, win, main, app, path;

fs = require('fs');
gui = require('nw.gui');
app = gui.App;
shell = gui.Shell;
win = gui.Window.get();
http = require('https');
path = require("path")

main = function() {
    $.ajax({
        method: 'GET',
        url: 'https://api.github.com/repos/TrapsterMusic/Updater/releases/latest',
        type: 'json'
    }).done(function(data) {
        var asset = data.assets[0];
        // $('progress').attr('max', asset.size);
        var url = asset.browser_download_url;
        var file = fs.createWriteStream(path.dirname(process.execPath) + '/update/update.zip');
        var request = http.get(url, function(response) {
            http.get(response.headers.location, function(res) {
                res.pipe(file);
                file.on('finish', function() {
                    file.close();
                    console.log('finished');
                    shell.openItem('updater.bat');
                    app.closeAllWindows();
                });
                file.on('error', function() {
                    app.closeAllWindows();
                    console.log('error');
                });
            });
        });
        // setInterval(function() {
        //     fs.stat('update/update.zip', function(err, stats) {
        //         console.log(stats);
        //         $('progress').val(stats.size);
        //         shell.openItem('updater.bat');
        //         app.closeAllWindows();
        //     });
        // }, 1000);
    });
}

$(document).ready(main);
