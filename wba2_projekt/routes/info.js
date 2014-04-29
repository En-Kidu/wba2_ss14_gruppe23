/*
 * GET /leistungen.
 */

exports.lList = function(db) {
  return function(req, res) {
    db.collection('leistungen').find().toArray(function (err, items) {
      res.json(items);
    })
  }
};

/*
 * POST to /leistungen.
 */

exports.lAdd = function(db, pubClient) {
  return function(req, res) {
    db.collection('leistungen').insert(req.body, function(err, result){
      res.send(
        (err === null) ? { msg: '' } : { msg: err }
      );
    });
      // publish message to Topic /leistungen
    pubClient.publish('/leistungen', {
      'bezeichnung': req.body.bezeichnung,
      'preis': req.body.preis,
      'von': req.body.von,
      'fuer': req.body.fuer


    }).then(function() { // Publish OK
      resp.writeHead(200, 'OK');
      resp.write('Daten wurden gesendet.');
      resp.end();
    }, function(error) { // Publish failed
      next(error);
    });
  }
};

/*
 * DELETE to /deleteL/:id.
 */

exports.deleteL = function(db, pubClient) {
  return function(req, res) {
    var vToDelete = req.params.id;
    db.collection('leistungen').removeById(vToDelete, function(err, result) {
      res.send((result === 1) ? { msg: '' } : { msg:'error: ' + err });
    });
      //Nachricht an Topic 'planeten' publishen
    pubClient.publish('/leistungen', {

    }).then(function() { // Publish OK
      resp.writeHead(200, 'OK');
      resp.write('Daten wurden gesendet.');
      resp.end();
    }, function(error) { // Publish failed
      next(error);
    });
  }
};

exports.updateL = function(db, pubClient) {
  return function(req, res) {
    var LToUpdate = req.params.id;
      var doc = { $set: req.body};
    db.collection('leistungen').updateById(LToUpdate, doc ,function(err, result) {
      res.send((result === 1) ? { msg: '' } : { msg:'error: ' + err });
    });
    //Nachricht an Topic 'planeten' publishen
    pubClient.publish('/leistungen', {

    }).then(function() { // Publish OK
      res.writeHead(200, 'OK');
      res.write('Daten wurden gesendet.');
      res.end();
    }, function(error) { // Publish failed
      next(error);
    });
  }
};

exports.userL = function(db) {
  return function(req, res) {
        console.log(req.query.username);
        db.collection('leistungen').find( { $or:[ {von:req.query.username} ,{fuer:req.query.username} ] } ).sort( { von: -1 } ).toArray(function (err, items) {
      res.json(items);
    });
  };
};