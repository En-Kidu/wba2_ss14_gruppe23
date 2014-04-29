// helper array for info box (populateTable)
var listData = [];

// DOM Ready =============================================================
$(document).ready(function() {
  // create PubSub-Client
  var client = new Faye.Client('/faye');

  // subscribe to topic /leistungen
  client.subscribe('/leistungen', function(message) {
      populateTable();
  });

  // fill table on DOM Ready
  populateTable();

  // Leistung info click
  $('#lList table tbody').on('click', 'td a.linkshowL', showLInfo);

  // Add Leistung button click
  $('#btnAddL').on('click', addL);

  // Delete Leistung link click
  $('#lList table tbody').on('click', 'td a.linkdeleteL', deleteL);
  
  // start the update Leistung process
  $('#lList table tbody').on('click', 'td a.linkupdateL', changeLInfo);
  
  // cancel Update and draw Add Panel
  $('#btnCancelUpdateL').on('click', togglePanels);
  
  //add class to updated field
  $('#updateL input').on('change', function(){$(this).addClass('updated')})

  // Update Leistung button click
  $('#btnUpdateL').on('click', updateL);

  $('#btnSort').on('click', sortL);
});

// Functions =============================================================

// Fill table with data
function populateTable() {

  // Empty content string
  var tableContent = '';

  // jQuery AJAX call for JSON
  $.getJSON( '/leistungen', function( data ) {

    // Stick table data array into a tablelist variable in the global object
    listData = data;

    // For each item in our JSON, add a table row and cells to the content string
    $.each(data, function(){
      tableContent += '<tr>';
      tableContent += '<td><a href="#" class="linkshowL" rel="' + this.bezeichnung + '" title="Details">' + this.bezeichnung + '</td>';
      tableContent += '<td>' + this.preis + '</td>';
      tableContent += '<td>' + this.von + '</td>';
      tableContent += '<td>' + this.fuer + '</td>';
      tableContent += '<td><a href="#" class="linkdeleteL" rel="' + this._id + '">loeschen</a>/<a href="#" class="linkupdateL" rel="' + this._id + '">update</a></td>';
      tableContent += '</tr>';
    });
    // Inject the whole content string into existing HTML table
    $('#lList table tbody').html(tableContent);
  });
};

// Show Leistungen Info
function showLInfo(event) {

  // Prevent Link from Firing
  event.preventDefault();

  // Retrieve Leistung-name from link rel attribute
  var thisLBez = $(this).attr('rel');

  // Get Index of object based on id value
  var arrayPosition = listData.map(function(arrayItem) { return arrayItem.bezeichnung; }).indexOf(thisLBez);

  // Get Leistungs-Object
  var thisLObject = listData[arrayPosition];

  //Populate Info Box
  $('#LInfoBezeichnung').text(thisLObject.bezeichnung);
  $('#LInfoPreis').text(thisLObject.preis);
  $('#LInfoVon').text(thisLObject.von);
  $('#LInfoFuer').text(thisLObject.fuer);
  $('#LInfoDate').text(thisLObject.day + "." + thisLObject.month + "." + thisLObject.year);
};

// Add Leistung
function addL(event) {
  event.preventDefault();

  // Super basic validation - increase errorCount variable if any fields are blank
  var errorCount = 0;
  $('#addL input').each(function(index, val) {
    if($(this).val() === '') { errorCount++; }
  });

  // Check and make sure errorCount's still at zero
  if(errorCount === 0) {

    var currentTime = new Date();
    // If it is, compile all Leistung-info into one object
    var newL = {
      'bezeichnung': $('#addL fieldset input#inputBezeichnung').val(),
      'preis': $('#addL fieldset input#inputPreis').val(),
      'von': $('#addL fieldset input#inputVon').val(),
      'fuer': $('#addL fieldset input#inputFuer').val(),
      'year': currentTime.getFullYear(),
      'month': currentTime.getMonth()+1,
      'day': currentTime.getDate()
    }
    // Use AJAX to post the object to our addL service
    $.ajax({
      type: 'POST',
      data: newL,
      url: '/leistungen',
      dataType: 'JSON'
    }).done(function( response ) {

      // Check for successful (blank) response
      if (response.msg === '') {

        // Clear the form inputs
        $('#addL fieldset input').val('');
        // Update the table
        populateTable();

      } else {
        // If something goes wrong, alert the error message that our service returned
        alert('Error: ' + response.msg);
      }
    });

  } else {
    // If errorCount is more than 0, error out
    alert('Please fill in all fields');
    return false;
  }
};

// Delete Leistung
function deleteL(event) {

  event.preventDefault();
  // Pop up a confirmation dialog
  var confirmation = confirm('Are you sure you want to delete this Leistung?');

  // Check and make sure the Leistung got confirmed
  if (confirmation === true) {
    
    // If they did, do our delete
    $.ajax({
      type: 'DELETE',
      url: '/deleteL/' + $(this).attr('rel')
    
    }).done(function( response ) {
      // Check for a successful (blank) response
      if (response.msg === '') {
      }
      else {
        alert('Error: ' + response.msg);
      }
      // Update the table
      populateTable();
    });
  
  } else {
    // If they said no to the confirm, do nothing
    return false;
  }
};

function updateL(event){

  event.preventDefault();

  // Pop up a confirmation dialog
  var confirmation = confirm('Are you sure you want to update this Leistung?');

  // Check and make sure Leistung is confirmed
  if (confirmation === true) {
    // If they did, do our update
    
    //set the _id of Leistung to be update 
    var _id = $(this).parentsUntil('div').parent().attr('rel');
      
    //create a collection of the updated fields
    var fieldsToBeUpdated = $('#updateL input.updated');
      
    //create an object of the pairs
    var updatedFields = {};
    $(fieldsToBeUpdated).each(function(){
        var key = $(this).attr('placeholder').replace(" ","").toLowerCase();
        var value = $(this).val();
        updatedFields[key]=value;
    })

    // do the AJAX
    $.ajax({
      type: 'PUT',
      url: '/updateL/' + _id,
      data: updatedFields
    }).done(function( response ) {

      // Check for a successful (blank) response
      if (response.msg === '') {
              togglePanels();
      }
      else {
        alert('Error: ' + response.msg);
      }

      // Update the table
      populateTable();

    });

  }
  else {

    // If they said no to the confirm, do nothing
    return false;

  }
};

// Toggle addL and updateL panels
function togglePanels(){
  $('#addLPanel').toggle();
  $('#updateLPanel').toggle();
}

// put Leistung Info into the 'Update Leistung Panel'
function changeLInfo(event) {
  // 
  event.preventDefault();
  
  // If the addLeistung panel is visible, hide it and show updateLeistung panel
  if($('#addLPanel').is(":visible")){
    togglePanels();
  }
  
  // Get Index of object based on _id value
  var _id = $(this).attr('rel');
  var arrayPosition = listData.map(function(arrayItem) { return arrayItem._id; }).indexOf(_id);
  
  // Get our Leistung Object
  var thisLObject = listData[arrayPosition];

  // Populate Info Box
  $('#updateBezeichnung').val(thisLObject.bezeichnung);
  $('#updatePreis').val(thisLObject.preis);
  $('#updateVon').val(thisLObject.von);
  $('#updateFuer').val(thisLObject.fuer);

  // Put the LeistungID into the REL of the 'update Leistung' block
  $('#updateL').attr('rel',thisLObject._id);
};

function sortL(event){

  event.preventDefault();
    if($('#getUser input').val() !== '') {

      var user = {
            'username': $('#sortL fieldset input#getUser').val()
          }

      $.getJSON( '/userLeistungen', user, function( data ) {

        var tableContent = '';
        // For each item in our JSON, add a table row and cells to the content string
        $.each(data, function(){
          tableContent += '<tr>';
          tableContent += '<td>' + this.bezeichnung + '</td>';
          tableContent += '<td>' + this.preis + '</td>';
          tableContent += '<td>' + this.von + '</td>';
          tableContent += '<td>' + this.fuer + '</td>';
          tableContent += '</tr>';
        });
        // Inject the whole content string into existing HTML table
        $('#sortedList table tbody').html(tableContent);
    });
  };
};