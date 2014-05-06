$(document).ready( function() {

	populateTable();

	  $('#einkaufsliste tbody').on('click', 'td button.pushToBedarfButton', {to: "bedarf"}, putLeistung);
  $('#einkaufsliste tbody').on('click', 'td button.pushToEinkaufButton', {to: "getaetigt"}, putLeistung);
});

function populateTable() {
  var einkaufslisteContent = '';
  // jQuery AJAX call for JSON
  $.getJSON( '/user/'+ $('#loginField legend').attr('name') +'/bedarf', function( data ) {
    $.each(data, function(){
	  if( (this.state === 'einkaufsliste') && (this.von === $('#loginField legend').attr('name')) ) {
        einkaufslisteContent += '<tr>';
        einkaufslisteContent += '<td> <button href="#" class="pushToBedarfButton" rel="'+ this._id +'" name="'+ this.gruppe +'"> - </button></td>'
        einkaufslisteContent += '<td>' + this.name + '</td>'
        einkaufslisteContent += '<td>' + this.fuer + '</td>'
        einkaufslisteContent += '<td id="max'+ this._id +'">' + this.maxPreis + '</td>'
        einkaufslisteContent += '<td><input id="'+ this._id +'" type="text" placeholder="Einkaufspreis"' + '</input></td>'
        einkaufslisteContent += '<td> <button href="#" class="pushToEinkaufButton" rel="'+ this._id +'" name="'+ this.gruppe +'"> + </button></td>'
        einkaufslisteContent += '</tr>';        
      }

    });
    $('#einkaufsliste tbody').html(einkaufslisteContent);
  });
};

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
    gruppe: $(this).attr('name')
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
      populateTable();
    });
  } else {
    // If they said no to the confirm, do nothing
    return false;
  }
};