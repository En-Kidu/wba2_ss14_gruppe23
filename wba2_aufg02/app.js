var express = require('express');
var app = express();
var url = require('url');
var planeten =[
            {"name" : "Merkur","entfernung" : "0.39","durchmesser" : "4879"},    
            {"name" : "Venus", "entfernung" : "0.72","durchmesser" : "12103"},    
            {"name" : "Erde","entfernung" : "1","durchmesser" : "12734"},    
            {"name" : "Mars","entfernung" : "1.52","durchmesser" : "6772"},    
            {"name" : "Jupiter","entfernung" : "5.2","durchmesser" : "138346"},    
            {"name" : "Saturn","entfernung" : "9.54","durchmesser" : "114632"},    
            {"name" : "Uranus","entfernung" : "19.18","durchmesser" : "50532"},   
            {"name" : "Neptun","entfernung" : "30.06","durchmesser" : "49105"}
];

app.configure(function(){
    app.use(express.static(__dirname + '/public'));  
    app.use(express.json());
    app.use(express.urlencoded());
});
    
app.get('/planeten',function(req,res){
	console.log("neuer HTTP-Request");
	console.log("Methode: "+req.method);
	var body = '';

	req.on('data',function(data){
		body = body+data.toString();
	});


	req.on('end',function(){
		var daten = req.body
		var pfad = url.parse(req.url).pathname;
		console.log(body);        
        var	pfad	=	url.parse(req.url).pathname;	
        console.log('Pfad:	'+pfad);	
        console.log(daten);	

        res.write('<h1> Sonnensystemtabelle </h1><table border="1"><tr> <th> Planeten</th> <th> Entfernung in AE</th> <th> Durchmesser in km</th> </tr>');
        for(var i=0; i<planeten.length; i++){      // Array wird ausgegeben und tabelle wird erzeugt bis keine inhalte mehr vorhanden sind
            res.write("<tr>"+
                        "<td> "+planeten[i].name+"</td>"+
                        "<td>"+planeten[i].entfernung+"</td>"+
                        "<td>"+planeten[i].durchmesser+"</td>"+
                      "</tr>");
            }
            res.write("</table>");
            res.write('<a href="/"> index.html </a>');
            res.end();
	});
});

app.post('/planeten',function(req,res){
	console.log("neuer HTTP-Request");
	console.log("Methode: "+req.method);
	var body = '';
    
    req.on('data',function(data){
        body = body+data.toString();
    });
    
    var daten = req.body
    var pfad = url.parse(req.url).pathname;
    console.log(body);
    var	pfad	=	url.parse(req.url).pathname;	
    console.log('Pfad:	'+pfad);	
    console.log(daten);	
    planeten.push({"name" : daten.name,"entfernung" : daten.entfernung,"durchmesser" : daten.durchmesser});  
    res.end();
});

console.log("Server gestartet.");
app.listen(3000);