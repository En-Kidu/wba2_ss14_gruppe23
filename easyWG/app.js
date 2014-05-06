/*********************************************************************************
*
* MODULE DEPENDENCIES & INITIALIZATIONS
*
*********************************************************************************/

var express = require('express');
var http = require('http');
//var url = require('url');
var path = require('path');
var faye = require('faye');

// Database enkiDB
var mongo = require('mongoskin');
var db = mongo.db("mongodb://localhost:27017/enkiDB", {native_parser:true});

db.collection('user').drop();
db.collection('gruppen').drop();
db.collection('mitglieder').drop(); // functionality not yet implemented
db.collection('leistungen').drop();
// {}

var uDaten = [
  { name: 'kevin' },
  { name: 'armin' },
  { name: 'eduard' },
  { name: 'marcel' }
];

var gDaten = [
  { name: 'DieWG' },
  { name: 'Lerngruppe WBA' }
];

/*
var lDaten = [
  { name:'Bananen',     gruppe:'DieWG',           von:'',     fuer:'kevin',   maxPreis:'5',   ekPreis:'', state:'bedarf'},
  { name:'Aepfel',      gruppe:'DieWG',           von:'',     fuer:'kevin',   maxPreis:'5',   ekPreis:'', state:'bedarf'},
  { name:'Weintrauben', gruppe:'DieWG',           von:'',     fuer:'kevin',   maxPreis:'5',   ekPreis:'', state:'bedarf'},
  { name:'Wasser',      gruppe:'DieWG',           von:'',     fuer:'armin',   maxPreis:'1',   ekPreis:'', state:'bedarf'},
  { name:'Cola',        gruppe:'DieWG',           von:'',     fuer:'armin',   maxPreis:'10',  ekPreis:'', state:'bedarf'},
  { name:'Brot',        gruppe:'DieWG',           von:'',     fuer:'armin',   maxPreis:'20',  ekPreis:'', state:'bedarf'},
  { name:'Bierkasten',  gruppe:'DieWG',           von:'',     fuer:'marcel',  maxPreis:'20',  ekPreis:'', state:'bedarf'},
  { name:'Tastatur',    gruppe:'Lerngruppe WBA',  von:'',     fuer:'kevin',   maxPreis:'50',  ekPreis:'', state:'bedarf'},
  { name:'Fernseher',   gruppe:'Lerngruppe WBA',  von:'',     fuer:'armin',   maxPreis:'99',  ekPreis:'', state:'bedarf'},
  { name:'Topfpflanze', gruppe:'Lerngruppe WBA',  von:'',     fuer:'armin',   maxPreis:'15',  ekPreis:'', state:'bedarf'}
]
*/

uDaten.forEach(function(p) {
  db.collection('user').insert({
    name: p.name
    }, function(err, dummy) {
            if (err) throw err;
  });
});

gDaten.forEach(function(p) {
  db.collection('gruppen').insert( { name: p.name }, function(err, dummy) {
      if (err) throw err;
  });
});

/*
lDaten.forEach(function(p) {
  db.collection('leistungen').insert( { name: p.name, gruppe: p.gruppe, von: p.von, fuer: p.fuer, maxPreis: p.maxPreis, ekPreis: p.ekPreis, state: p.state }, function(err, dummy) {
      if (err) throw err;
  });
});
*/

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

/*********************************************************************************
*
* ENVIRONMENTS
*
*********************************************************************************/
app.set('port', process.env.PORT || 3000); // env-variable-port OR 3000
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');

/*********************************************************************************
*
* MIDDLEWARE
*
*********************************************************************************/
//app.use(express.favicon()); //app.use(express.favicon(path.join(__dirname, 'public/images/favicon.ico'))); 
app.use(express.logger('dev'));
app.use(express.json());
app.use(express.urlencoded());
app.use(express.methodOverride()); // enables DELETE & PUT (readebility only)
//app.use(app.router); // use before static middleware // invokes callbacks
app.use(express.static(path.join(__dirname, 'public')));

// development only
if ('development' == app.get('env')) {
  app.use(express.errorHandler()); // sends 500 if something went wrong
}

/*********************************************************************************
*
* ROUTES
*
*********************************************************************************/

app.get('/', index);
app.get('/login', login);
app.get('/user/:username', home);
app.get('/user/:username/gruppen', gruppen);
app.get('/user/:username/profil', profil);
app.get('/user/:username/gruppen/:gruppenId', gruppenPanel);

app.get('/user/:username/gruppenDaten', gruppenDaten);
app.post('/user/:username/gruppenDaten', neueGruppe);

app.get('/user/:username/bedarf', einkaufsliste);

app.get('/gruppen/:gruppenId/bedarf', bedarfDaten);
app.post('/gruppen/:gruppenId/bedarf', neuerBedarf);
app.delete('/deleteL/:lToDelete', delLeistung);
app.put('/putL/:lToPut', putLeistung);

app.post('/user/:username/subscriptions', addSubGroup); // needs proper implementation

/********************************************************************************
* 404 Middleware
*********************************************************************************/
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

/********************************************************************************
*
* Request CALLBACKS
*
*********************************************************************************/

//================= Login ========================================================
function index(req, res) {
  console.log('GET Login');
  res.render('index', { title: 'Login' , userId: 'None'});
};


function login(req, res) {
  res.redirect('/user/' + req.query.username);
};

//================= HomeScreen ===================================================
function home(req, res) {
  db.collection('user').findOne( {name:req.params.username} , function (err, item) {
    if(item === null) {
      db.collection('user').insert({name:req.params.username}, function(err, result) {
        if (err) throw err;
      });
    };
    console.log('User: ' + req.params.username + ' just logged in.');
    res.render('home', { title: 'Home', userName: req.params.username});
  });
};

//================= Gruppenueberblick =============================================
function gruppen(req, res) {
  console.log('GET Gruppenuebersicht');
  res.render('gruppen', { title: 'Gruppen' , userName: req.params.username});
};


function gruppenDaten(req, res) {
  db.collection('gruppen').find().toArray(function (err, items) {
      console.log('Tabelle Gruppen geladen');
      res.json(items);
  });
}

function neueGruppe (req, res) {
  db.collection('gruppen').insert(req.body, function(err, result){
    console.log('Gruppe added!');

    pubClient.publish('/gruppenueberblick', {
    }).then(function() { // Publish OK
      res.send(
        (err === null) ? { msg: '' } : { msg: err }
      );
    }, function(error) { // Publish failed
      next(error);
    });

  });
}

// needs implemetation
function addSubGroup(req, res) {
  console.log(req.body.gruppe + ' ' + req.body.name);
  db.collection('mitglieder').findOne( { $and:[ {name:req.body.name} ,{gruppe:req.body.gruppe} ] } , function (err, item) {
    if(item===null) {
      db.collection('mitglieder').insert({name:req.body.name, gruppe:req.body.gruppe}, function(err, result) {
        if (err) throw err;
        res.send( { msg: '+' } );
      });
    } else {
      db.collection('mitglieder').removeById(item._id, function(err, result) {
        res.send( {msg: '-' });
      });
    }  
  });
}

//================= Profil =============================================
function profil(req, res) {
  console.log('GET Profil');
  res.render('profil', { title: 'pers. Einkaufsliste' , userName: req.params.username});
};

function einkaufsliste(req, res) {
  db.collection('leistungen').find( { $and:[ {von:req.params.username} ,{state: 'einkaufsliste'} ] } ).toArray(function (err, items) {
    console.log('User Einkaufsliste wird geladen');
    res.json(items);
  });
}

//================= GruppenPanel ========================================================
function gruppenPanel(req, res) {
  db.collection('gruppen').findById( req.params.gruppenId , function (err, item) {
    console.log('GET GruppenPanel');
    res.render('gruppenPanel', { title: 'GruppenPanel' , userName: req.params.username, gruppenId: req.params.gruppenId, gruppenName: item.name } );
  });
}

function bedarfDaten(req, res) {
  db.collection('leistungen').find( { gruppe:req.params.gruppenId } ).toArray(function (err, items) {
    console.log('Tabelle Bedarf geladen!');
    res.json(items);
  });
}

function neuerBedarf(req, res) {
  db.collection('leistungen').insert({ name:req.body.name, gruppe:req.body.gruppe, von:'', fuer: req.body.fuer, maxPreis: req.body.maxPreis, ekPreis:'', state:'bedarf'}, function(err, result) {
    if (err) throw err;
    console.log('Bedarf added');

    pubClient.publish('/leistungen/'+req.body.gruppe, {
    }).then(function() { // Publish OK
      res.send(
        (err === null) ? { msg: '' } : { msg: err }
      );
    }, function(error) { // Publish failed
      next(error);
    });

  });
}

function delLeistung(req, res) {
  db.collection('leistungen').removeById(req.params.lToDelete, function(err, result) {
    console.log('Eintrag Collection leistungen geloescht');
  
    pubClient.publish('/leistungen/'+req.body.gruppe, {
    }).then(function() { // Publish OK
      res.send((result === 1) ? { msg: '' } : { msg:'error: ' + err });
    }, function(error) { // Publish failed
      next(error);
    });

  });
}

function putLeistung(req, res) {
  console.log(req.body.user);
  db.collection('leistungen').updateById(req.params.lToPut, { $set: {state: req.body.to, von: req.body.user, ekPreis: req.body.ekpreis} } ,function(err, result) {
    console.log('Leistungsstatus geaendert!');
   
    pubClient.publish('/leistungen/'+req.body.gruppe, {
    }).then(function() { // Publish OK
      res.send((result === 1) ? { msg: '' } : { msg:'error: ' + err });
    }, function(error) { // Publish failed
        next(error);
    });

  });
}