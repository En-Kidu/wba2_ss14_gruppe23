
/**
 * Module dependencies.
 */

var express = require('express');
var routes = require('./routes');
var info = require('./routes/info')
var http = require('http');
var path = require('path');
var faye = require('faye');

// timeStamper
var currentTime = new Date();

// Database enkiDB
var mongo = require('mongoskin');
var db = mongo.db("mongodb://localhost:27017/enkiDB", {native_parser:true});

db.collection('leistungen').drop();
db.collection('leistungen').insert({bezeichnung:'Tee', preis:3, von:"Uwe", fuer:"Max", year: currentTime.getFullYear(), month: currentTime.getMonth()+1, day: currentTime.getDate()}, function(err, result) {
    if (err) throw err;
});
db.collection('leistungen').insert({bezeichnung:'Obst', preis:5, von:"Max", fuer:"Uwe", year: currentTime.getFullYear(), month: currentTime.getMonth()+1, day: currentTime.getDate()}, function(err, result) {
    if (err) throw err;
});
db.collection('leistungen').insert({bezeichnung:'Putzmittel', preis:2, von:"Karl", fuer:"Max", year: currentTime.getFullYear(), month: currentTime.getMonth()+1, day: currentTime.getDate()}, function(err, result) {
    if (err) throw err;
});
db.collection('leistungen').insert({bezeichnung:'Cola', preis:3, von:"Alex", fuer:"Eddie", year: currentTime.getFullYear(), month: currentTime.getMonth()+1, day: currentTime.getDate()}, function(err, result) {
    if (err) throw err;
});
db.collection('leistungen').insert({bezeichnung:'Pepsi', preis:5, von:"Alex", fuer:"Uwe", year: currentTime.getFullYear(), month: currentTime.getMonth()+1, day: currentTime.getDate()}, function(err, result) {
    if (err) throw err;
});
db.collection('leistungen').insert({bezeichnung:'Popcorn', preis:2, von:"Max", fuer:"Malte", year: currentTime.getFullYear(), month: currentTime.getMonth()+1, day: currentTime.getDate()}, function(err, result) {
    if (err) throw err;
});
db.collection('leistungen').insert({bezeichnung:'Handy', preis:3, von:"Malte", fuer:"Max", year: currentTime.getFullYear(), month: currentTime.getMonth()+1, day: currentTime.getDate()}, function(err, result) {
    if (err) throw err;
});
db.collection('leistungen').insert({bezeichnung:'Fahrrad', preis:5, von:"Alex", fuer:"Malte", year: currentTime.getFullYear(), month: currentTime.getMonth()+1, day: currentTime.getDate()}, function(err, result) {
    if (err) throw err;
});
db.collection('leistungen').insert({bezeichnung:'Auto', preis:2, von:"Eddie", fuer:"Alex", year: currentTime.getFullYear(), month: currentTime.getMonth()+1, day: currentTime.getDate()}, function(err, result) {
    if (err) throw err;
});

db.collection('leistungen').insert({bezeichnung:'Transporter', preis:3, von:"Uwe", fuer:"Malte", year: currentTime.getFullYear(), month: currentTime.getMonth()+1, day: currentTime.getDate()}, function(err, result) {
    if (err) throw err;
});
db.collection('leistungen').insert({bezeichnung:'Porsche', preis:5, von:"Max", fuer:"Alex", year: currentTime.getFullYear(), month: currentTime.getMonth()+1, day: currentTime.getDate()}, function(err, result) {
    if (err) throw err;
});
db.collection('leistungen').insert({bezeichnung:'Topfpflanze', preis:2, von:"Uwe", fuer:"Eddie", year: currentTime.getFullYear(), month: currentTime.getMonth()+1, day: currentTime.getDate()}, function(err, result) {
    if (err) throw err;
});
db.collection('leistungen').insert({bezeichnung:'Vita Malz', preis:3, von:"Eddie", fuer:"Malte", year: currentTime.getFullYear(), month: currentTime.getMonth()+1, day: currentTime.getDate()}, function(err, result) {
    if (err) throw err;
});
db.collection('leistungen').insert({bezeichnung:'Papierblock', preis:5, von:"Alvin", fuer:"Peter", year: currentTime.getFullYear(), month: currentTime.getMonth()+1, day: currentTime.getDate()}, function(err, result) {
    if (err) throw err;
});
db.collection('leistungen').insert({bezeichnung:'Kugelschreiber', preis:2, von:"Marius", fuer:"Max", year: currentTime.getFullYear(), month: currentTime.getMonth()+1, day: currentTime.getDate()}, function(err, result) {
    if (err) throw err;
});

var app = express();

//Nodeadapter config
var bayeux = new faye.NodeAdapter({
    mount: '/faye',
    timeout: 45
});

var server = http.createServer(app);

// add Nodeadapter to http-server
bayeux.attach(server);

// create PubSub-Client
var pubClient = bayeux.getClient();

// all environments
app.set('port', process.env.PORT || 3000); // env-variable-port OR 3000
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');

// middleware
//app.use(express.favicon()); //app.use(express.favicon(path.join(__dirname, 'public/images/favicon.ico'))); 
app.use(express.logger('dev'));
app.use(express.json());
app.use(express.urlencoded());
app.use(express.methodOverride()); // enables DELETE & PUT (readebility only)
app.use(app.router); // use before static middleware // invokes callbacks
app.use(express.static(path.join(__dirname, 'public')));

// development only
if ('development' == app.get('env')) {
  app.use(express.errorHandler()); // sends 500 if something went wrong
}

// routes
app.get('/', routes.index);
app.get('/leistungen', info.lList(db));
app.post('/leistungen', info.lAdd(db, pubClient));
app.delete('/deleteL/:id', info.deleteL(db, pubClient));
app.put('/updateL/:id', info.updateL(db, pubClient));
app.get('/userLeistungen', info.userL(db));

app.use(function(req, res, next){
  res.status(404);

  // respond with html page
  if (req.accepts('html')) {
    res.render('404', { url: req.url });
    return;
  }

  // respond with json
  if (req.accepts('json')) {
    res.send({ error: 'Not found' });
    return;
  }

  // default to plain-text. send()
  res.type('txt').send('Not found');
});

// server start
server.listen(app.get('port'), function(){
  console.log('Server listening on port ' + app.get('port'));
});
