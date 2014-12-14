var net = require('net');
var events = require('events');
var util = require('util');
var Speaker = require('speaker');

function Server(opts) {
	if (!(this instanceof Server)) return new Server(opts);
	events.EventEmitter.call(this);

	var that = this;

	this.server = net.createServer(function (conn) {
		that.emit('connection', conn);

		if (that.speaker) { // Another client already connected
			conn.end();
			return;
		}

		var speaker = new Speaker({
			channels: 2,          // 2 channels
			bitDepth: 16,         // 16-bit samples
			sampleRate: 44100     // 44,100 Hz sample rate
		});
		that.speaker = speaker;

		// PCM data from conn gets piped into the speaker
		conn.pipe(speaker);

		conn.on('end', function () {
			speaker.end();
			that.speaker = null;
		});
	}).listen(opts.port);
}
util.inherits(Server, events.EventEmitter);

module.exports = Server;