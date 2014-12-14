var Client = require('..').Client;

// Create client
var client = Client({
	host: 'raspberrypi',
	port: 9000
});

// Start streaming
client.start();

//client.stop();