var net = require('net');
var events = require('events');
var util = require('util');
var PulseAudio = require('pulseaudio');

function Client(opts) {
	if (!(this instanceof Client)) return new Client(opts);
	events.EventEmitter.call(this);

	this.opts = opts;
}
util.inherits(Client, events.EventEmitter);

Client.prototype.start = function (done) {
	var that = this;
	done = done || function () {};
	
	var context = PulseAudio();
	that.context = context;

	context.on('connection', function() {
		context.source(function (list) {
			// Select device
			var devName = '';
			for (var i = 0; i < list.length; i++) {
				var dev = list[i];
				if (dev.name.indexOf('alsa_output.pci-') == 0) {
					devName = dev.name;
					break;
				}
			}

			if (!devName) {
				return done('No device found');
			}

			// Record output
			var stream = context.record({
				device: devName
			});
			that.stream = stream;
			stream.on('state', function (state) {
				that.emit('stream'+state, stream);
			});
			stream.on('connection', function () {
				that.emit('stream', stream);
			});
			stream.on('error', function (err) {
				done(err || 'Unknown Pulseaudio error');
			});

			var client = net.connect(that.opts, function () {
				stream.pipe(client);
				that.emit('connect');
			});
			that.client = client;
		});
	});
};

Client.prototype.stop = function () {
	this.client.end();
	this.stream.end();
	this.context.end();
};

module.exports = Client;