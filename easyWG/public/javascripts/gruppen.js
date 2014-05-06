$(document).ready( function() {

	populateGruppen();

  // create PubSub-Client
  var client = new Faye.Client('/faye');
  // subscribe to topic /leistungen
  client.subscribe('/gruppenueberblick', function(message) {
      populateGruppen();
  });

	$('#newGroupButton').on('click', newGroup);
	$('#gruppenliste tbody').on('click', 'td button.addSubGroupButton', addSubGroup);
});

function populateGruppen() {
  var tableContent = '';
  // jQuery AJAX call for JSON
  $.getJSON( '/user/'+$('#loginField legend').attr('name')+'/gruppenDaten', function( data ) {
    $.each(data, function(){
      tableContent += '<tr>';
      tableContent += '<td> <a href="/user/' + $('#loginField legend').attr('name') + '/gruppen/' + this._id + '">'+ this.name +'</a></td>'
      tableContent += '<td> <button href="#" class="addSubGroupButton" rel="'+ this._id +'"> + </button></td>'
      tableContent += '</tr>';
    });
    // Injiziere tableContent in Tabelle #gruppenliste
    $('#gruppenliste tbody').html(tableContent);
  });
};

function newGroup() {
  event.preventDefault();
  // Validation
  var errorCount = 0;
  $('#newGroupField input').each(function(index, val) {
    if($(this).val() === '') { errorCount++; }
  });
  // alle Felder befuellt?
  if(errorCount === 0) {
    var newGroup = {
      'name': $('#inputGruppenName').val()
    }
    // Ajax POST auf /user/gruppenDaten
    $.ajax({
      type: 'POST',
      data: newGroup,
      url: '/user/'+$('#loginField legend').attr('name')+'/gruppenDaten',
      dataType: 'JSON'
    }).done(function( response ) {
      if (response.msg === '') {
        $('#inputGruppenName').val('');
        //populateGruppen();
      } else {
        alert('Error: ' + response.msg);
      }
    });
  } else {
    alert('Bitte alle Felder befuellen');
    return false;
  }
}

function addSubGroup() {
  event.preventDefault();
  var e = this;
  var group = {
  	'name': $('#loginField legend').attr('name'),
    'gruppe': $(this).attr('rel')
  }
  // Ajax POST auf /user/gruppenDaten
  $.ajax({
    type: 'POST',
    data: group,
    url: '/user/'+$('#loginField legend').attr('name')+'/subscriptions',
    dataType: 'JSON'
  }).done(function( response ) {
    if (response.msg === '+') {
    	console.log('not implemented yet');
    	toggleButton(e);
      	//populateGruppen();
    } else if (response.msg === '-') {
    	console.log('not yet implemented');
    	toggleButton(e);
      	//populateGruppen();
    } else {
      alert('Error: ' + response.msg);
    }
  });
}

function toggleButton(e) {
	( $(e).text() === "-") ? $(e).text("+") : $(e).text("-");
}