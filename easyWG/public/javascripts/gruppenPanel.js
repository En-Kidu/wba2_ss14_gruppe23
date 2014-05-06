$(document).ready( function() {
  
  populateTable();

  // create PubSub-Client
  var client = new Faye.Client('/faye');
  // subscribe to topic /leistungen
  client.subscribe('/leistungen/'+$('#main').attr('rel'), function(message) {
      populateTable();
  });
  

	$('#newBedarfButton').on('click', newBedarf);

	$('#bedarfsliste tbody').on('click', 'td button.delBedarfButton', delLeistung);
  $('#einkaeufe tbody').on('click', 'td button.delEinkaufButton', delLeistung);

  $('#bedarfsliste tbody').on('click', 'td button.putBedarfButton', {to: "einkaufsliste"}, putLeistung);
  $('#einkaufsliste tbody').on('click', 'td button.pushToBedarfButton', {to: "bedarf"}, putLeistung);
  $('#einkaufsliste tbody').on('click', 'td button.pushToEinkaufButton', {to: "getaetigt"}, putLeistung);
});

function populateTable() {
  var bedarfContent = '';
  var einkaufslisteContent = '';
  var getaetigtContent = '';
  // jQuery AJAX call for JSON
  $.getJSON( '/gruppen/' + $('#main').attr('rel') + '/bedarf', function( data ) {
    $.each(data, function(){
      if(this.state === 'bedarf') {
        bedarfContent += '<tr>';
        bedarfContent += '<td> <button href="#" class="delBedarfButton" rel="'+ this._id +'"> - </button></td>'
        bedarfContent += '<td>' + this.name + '</td>'
        bedarfContent += '<td>' + this.maxPreis + '</td>'
        bedarfContent += '<td>' + this.fuer + '</td>'
        bedarfContent += '<td> <button href="#" class="putBedarfButton" rel="'+ this._id +'"> + </button></td>'
        bedarfContent += '</tr>';
      } else if( (this.state === 'einkaufsliste') && (this.von === $('#loginField legend').attr('name')) ) {
        einkaufslisteContent += '<tr>';
        einkaufslisteContent += '<td> <button href="#" class="pushToBedarfButton" rel="'+ this._id +'"> - </button></td>'
        einkaufslisteContent += '<td>' + this.name + '</td>'
        einkaufslisteContent += '<td id="max'+ this._id +'">' + this.maxPreis + '</td>'
        einkaufslisteContent += '<td><input id="'+ this._id +'" type="text" placeholder="Einkaufspreis"' + '</input></td>'
        einkaufslisteContent += '<td> <button href="#" class="pushToEinkaufButton" rel="'+ this._id +'"> + </button></td>'
        einkaufslisteContent += '</tr>';        
      } else if(this.state === 'getaetigt') {
        getaetigtContent += '<tr>';
        getaetigtContent += '<td>' + '' + '</td>'
        getaetigtContent += '<td>' + this.name + '</td>'
        getaetigtContent += '<td>' + this.fuer + '</td>'
        getaetigtContent += '<td>' + this.von + '</td>'
        getaetigtContent += ((parseFloat(this.maxPreis) >= parseFloat(this.ekPreis)) ? '<td>' + this.ekPreis + '</td>' : '<td class="overpaid">' + this.ekPreis + '</td>')
        getaetigtContent += '<td> <button href="#" class="delEinkaufButton" rel="'+ this._id +'"> entfernen </button></td>'
        getaetigtContent += '</tr>';
      }
    });
    // Injiziere tableContent in Tabelle #bedarfliste
    $('#bedarfsliste tbody').html(bedarfContent);
    $('#einkaufsliste tbody').html(einkaufslisteContent);
    $('#einkaeufe tbody').html(getaetigtContent);
  });
};

function newBedarf() {
  event.preventDefault();
  // Validation
  var errorCount = 0;
  $('#newBedarfField input').each(function(index, val) {
    if($(this).val() === '') { errorCount++; }
  });
  // alle Felder befuellt?
  if(errorCount === 0) {
    var newBedarf = {
      'name': $('#inputBedarfName').val(),
      'maxPreis': $('#inputBedarfMaxPreis').val(),
      'fuer': $('#loginField legend').attr('name'),
      'gruppe': $('#main').attr('rel')
    }
    // Ajax POST auf /user/gruppenDaten
    $.ajax({
      type: 'POST',
      data: newBedarf,
      url: '/gruppen/' + $('#main').attr('rel') + '/bedarf',
      dataType: 'JSON'
    }).done(function( response ) {
      if (response.msg === '') {
        $('#inputBedarfName').val('');
        $('#inputBedarfMaxPreis').val('');
        console.log('neue Anfrage erstellt');
        //populateTable();
      } else {
        alert('Error: ' + response.msg);
      }
    });
  } else {
    alert('Bitte alle Felder befuellen');
    return false;
  }
}

function delLeistung() {
  event.preventDefault();
  var confirmation = confirm('Eintrag loeschen?');
  if (confirmation === true) {
    $.ajax({
      type: 'DELETE',
      url: '/deleteL/' + $(this).attr('rel'),
      data: {gruppe: $('#main').attr('rel')}
    }).done(function( response ) {
      if (response.msg === '') {
        console.log('löschvorgang erfolgreich');
      }
      else {
        alert('Error: ' + response.msg);
      }
      //populateTable();
    });
  } else {
    // If they said no to the confirm, do nothing
    return false;
  }
}

function putLeistung(event) {
  event.preventDefault();
  var tmp;
  if(event.data.to === 'getaetigt') {
    if( $('#'+$(this).attr('rel')).val() === '') {
      alert('Bitte trage den Einkaufspreis ein');
      return false;
    } else if( parseFloat($('#'+$(this).attr('rel')).val()) > parseFloat($('#max'+$(this).attr('rel')).text()) ) {
      alert('Maximalpreis ueberschritten!');
      return false;
    } else {
      tmp = $('#'+$(this).attr('rel')).val();
    }
  } else {
    tmp = '';
  }

  var action = {
    to: event.data.to,
    user: $('#loginField legend').attr('name'),
    ekpreis: tmp,
    gruppe: $('#main').attr('rel')
  }
  var confirmation = confirm('Status des Eintrags ändern?');
  if (confirmation === true) {
    $.ajax({
      type: 'PUT',
      url: '/putL/' + $(this).attr('rel'),
      data: action
    }).done(function( response ) {
      if (response.msg === '') {
        console.log('Eintrag erfolgreich verschoben/geaendert');
      }
      else {
        alert('Error: ' + response.msg);
      }
      //populateTable();
    });
  } else {
    // If they said no to the confirm, do nothing
    return false;
  }
};