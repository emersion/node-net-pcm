var net = require('net');
var events = require('events');
var util = require('util');
var Speaker = require('speaker');

function Server(opts) {
	if (!(this instanceof Server)) return new Server(opts);
	events.EventEmitter.call(this);

	var that = this;

	var speaker = new Speaker({
		channels: 2,          // 2 channels
		bitDepth: 16,         // 16-bit samples
		sampleRate: 44100     // 44,100 Hz sample rate
	});
	this.speaker = speaker;

	this.connected = false;

	this.server = net.createServer(function (conn) {
		that.emit('connection', conn);

		if (that.connected) { // Another client already connected
			conn.end();
			return;
		}

		// PCM data from conn gets piped into the speaker
		conn.pipe(speaker);

		that.connected = true;

		conn.on('end', function () {
			conn.unpipe(speaker);
			that.connected = false;
		});
	}).listen(opts.port);
}
util.inherits(Server, events.EventEmitter);

module.exports = Server;