//Requires
var express = require('express');
var mongo = require('mongoskin');
var http = require('http');
var faye = require('faye');

//JSON-Array wird erstellt.
var planeten = [
	{ name:'Merkur', durchmesser:4840, entfernung:58000000 },
	{ name:'Venus', durchmesser:12400, entfernung:108000000 },
	{ name:'Erde', durchmesser:12742, entfernung:150000000 },
	{ name:'Mars', durchmesser:6800, entfernung:280000000 },
	{ name:'Jupiter', durchmesser:142800, entfernung:775000000 },
	{ name:'Saturn', durchmesser:120800, entfernung:1440000000 },
	{ name:'Uranus', durchmesser:47600, entfernung:2870000000 },
	{ name:'Neptun', durchmesser:44600, entfernung:4500000000 }
];

//Zugriff auf DB
var db = mongo.db('mongodb://localhost/planets?auto_reconnect=true', {safe:true});
db.bind('planeten');

var planetenCollection = db.planeten;
planetenCollection.drop();

//Express und http-Server erstellen
var app = express();
var server = http.createServer(app);

//Nodeadapter konfigurieren
var bayeux = new faye.NodeAdapter({
	mount: '/faye',
	timeout: 45
});

//Nodeadapter zu http-Server hinzufuegen
bayeux.attach(server);

//PubSub-Client erzeugen
var pubClient = bayeux.getClient();

app.configure(function(){
    //Verzeichniss fuer den direkten Zugriff von Außen freigeben.
    app.use(express.static(__dirname + '/public'));
            
    //wird benötigt, um Informationen des Requests zu parsen.
    app.use(express.json());
    app.use(express.urlencoded());
});

//Fehlerbehandlung
app.use(function(err, req, resp, next) {
	console.error(err.stack);
	resp.end(err.messages);
});

//Fuer das erstmalige Einfuegen in die DB (unter Benutzung des JSON-Arrays)
planeten.forEach(function(p) {
	planetenCollection.insert({
		name: p.name,
		durchmesser: p.durchmesser,
		entfernung: p.entfernung
	}, function(err, dummy) {
	});
});

//GET auf planeten
app.get('/planeten', function(req, resp, next) {
	//Daten aus DB abrufen
	planetenCollection.findItems(function(err, result) {
		//Fehlerbehandlung
		if(err) {
			next(err);
		}
		//JSON-File an Client uebertragen
		else {
			resp.writeHead(200, {'Content-Type': 'applicatio/json'});
			resp.end(JSON.stringify(result));
		}
	});
});

//POST auf planeten
app.post('/planeten', function(req, resp, next){
	//Daten in DB schreiben
    planetenCollection.insert(req.body, function(err, result) {
		//Fehlerbehandlung
		if(err) {
			//next(err);
		}
		//JSON-File an Client uebertragen
		else {
			//resp.writeHead(200, 'OK');
			//resp.write('Daten wurden gespeichert.');
			//resp.end();
		}
	});
	
	//Nachricht an Topic 'planeten' publishen
	pubClient.publish('/planeten', {
		'name': req.body.name,
		'durchmesser': req.body.durchmesser,
		'entfernung': req.body.entfernung
	}).then(function() { //Publish erfolgreich
		resp.writeHead(200, 'OK');
		resp.write('Daten wurden gesendet.');
		resp.end();
	}, function(error) { //Publish fehlgeschlagen
		next(error);
	});
});

//'server.listen' anstatt 'app.listen' (faye)
server.listen(3000, function() {
	console.log('Server listens on port 3000.');
});