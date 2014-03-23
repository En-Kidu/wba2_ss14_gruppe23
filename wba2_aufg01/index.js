// index.js (start der Anwendung mittels 'node index.js')

var server = require('./server');
var router = require('./router');
var requestHandlers = require('./requestHandlers');

// handle ist eine Sammlung von URLs (Keys), die Funktionen im RequestHandler ansprechen
var handle = {}; // var handle = new Object();
handle['/'] = requestHandlers.start;
handle['/start'] = requestHandlers.start;
handle['/planeten'] = requestHandlers.listPlanets;

server.start(router.route, handle);