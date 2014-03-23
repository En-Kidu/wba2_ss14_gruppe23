// server.js

var http = require('http');
var url = require('url');

// Wrapper-Function 'start' für externen Zugriff.
function start(route, handle) {

	// Request Handling.
	function onRequest(request, response) {
		// parse den URL-Pfad...
		var pathname = url.parse(request.url).pathname;
		console.log('Request for ' + pathname + ' received.');
		// und übergebe ihn dem router.
		route(handle, pathname, request, response);

		console.log('');
	}
	/* 
	 * 1. Erstelle  Server.
	 * 2. Rufe Callback-Function 'onRequest' auf.
	 * 3. Höre Port 8888 ab.
	 */
	http.createServer(onRequest).listen(8888);
	console.log('Server has started.');
}

//Bekanntmachen der Wrapper-Function.
exports.start = start;