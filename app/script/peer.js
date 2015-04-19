var PeerServer = require('peer').PeerServer;
var server = PeerServer({port: 8080});
var peer = new Peer('audio-player', {host: 'localhost', port: 8080});