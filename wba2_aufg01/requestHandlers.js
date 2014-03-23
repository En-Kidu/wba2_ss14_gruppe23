// requestHandler.js

var querystring = require('querystring');

// Temporäre Daten für für die Tabelle Planeten
var planeten = [
['Merkur', '4879', '59'],
['Venus', '12103', '108'],
['Erde', '12756', '150'],
['Mars', '6792', '228'],
['Jupiter', '142984', '778'],
['Saturn', '120536', '1427'],
['Uranus', '51118', '2870'],
['Neptun', '49528', '4497']
];

// Einfügen von 'planeten' in HTML-Template
function doTable() {

	var temp = '<html>'+
    '<head>'+
    '<meta http-equiv="Content-Type" content="text/html"; '+
    'charset="UTF-8" />'+
    '</head>'+
    '<body>'+
    '<table border="1">'+
	'<thead>'+
	'<tr>'+
	'<th>Planetenname</th>'+
	'<th>Durchmesser am Aequator in km</th>'+
	'<th>Entfernung zur Sonne in mio. km</th>'+
	'</tr>'+
	'</thead>';

	for(var i=0; i < planeten.length; i++) {
		temp += "<tr>"
		for(var j=0; j < planeten[i].length; j++) {
			temp += "<td>" + planeten[i][j] + "</td>";
		}
		temp += "</tr>";
	}
	temp += '</table>'+
	'</body>'+
    '</html>';
	return temp;
}


/* ============================
*      Request Handlers
*  ============================
*/

// handler für path request / & /start
function start(request, response) {
	console.log("Request handler 'start' was called.");

	var body = '<html>'+
    '<head>'+
    '<meta http-equiv="Content-Type" content="text/html"; '+
    'charset="UTF-8" />'+
    '</head>'+
    '<body>'+
    '<a href="/planeten">/Planeten</a>'+
    '</body>'+
    '</html>';

    response.writeHead(200, {"Content-Type": "text/html"});
    response.write(body);
    response.end();
}

// handler für path request /planeten
function listPlanets(request, response) {
	console.log("Request handler 'listPlanets' was called.");

	var body = '';

	// lies Inhalt der Seite aus und speichere ihn in 'body'
	request.on('data',function(data){
		body = body+data.toString();
	});
	

	request.on('end', function(){
		var daten = querystring.parse(body);
		
		// wenn Kommando POST aufgerufen wird und die Eingabefelder nicht leer sind, dann...
		if( (request.method == 'POST') && 
			(daten.pName !== '') && 
			(daten.pDurchmesser !== '') && 
			(daten.pEntfernung !== '') ) {
			
			// ... füge die Daten des Eingabefeldes dem Array 'planeten' hinzu.
			planeten.push([daten.pName,daten.pDurchmesser,daten.pEntfernung]);
		}

		response.writeHead(200, {"Content-Type": "text/html"});

		// Erstelle die Tabelle...
		response.write(doTable());
		//... und füge die Eingabefelder hinzu.
		response.write('<form action="" method="post">' +
			'<p>Planetenname:<br><input name="pName"></p>'+
			'<p>Durchmesser:<br><input name="pDurchmesser"</p>'+
			'<p>Entfernung:<br><input name="pEntfernung"</p>'+
			'<p><input type="submit" value=" Submit "></p>'+
			'</form>'
		);
	  	response.end();
	});
}

exports.start = start;
exports.listPlanets = listPlanets;