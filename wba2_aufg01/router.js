// router.js

function route(handle, pathname, request, response) {
	console.log('About to route a request for ' + pathname + '.');
	// wenn der übergebene Pfad auf eine Funktion im Objekt 'handle' verweist, dann...
	if(typeof handle[pathname] === 'function') {
		// ...rufe die entsprechende Funktion auf.
		handle[pathname](request, response);
	} else {
		// ...sonst gib 404 aus und beende die bearbeitung.
		console.log('No request handler found for ' + pathname);
		response.writeHead(404, {'Content-Type': 'text/plain'});
    	response.write('404 Not found');
    	response.end();
	}
}

exports.route = route;