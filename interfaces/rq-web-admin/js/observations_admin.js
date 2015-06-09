// Polyfills
if (!Array.prototype.find) {
  Array.prototype.find = function(predicate) {
    if (this == null) {
      throw new TypeError('Array.prototype.find called on null or undefined');
    }
    if (typeof predicate !== 'function') {
      throw new TypeError('predicate must be a function');
    }
    var list = Object(this);
    var length = list.length >>> 0;
    var thisArg = arguments[1];
    var value;

    for (var i = 0; i < length; i++) {
      value = list[i];
      if (predicate.call(thisArg, value, i, list)) {
        return value;
      }
    }
    return undefined;
  };
}


// Global variables 

// Model 
var current_quake_id;
var current_quake_time;
var quakes_schedule;

// Initialize nutella
var query_params = NUTELLA.parseURLParameters();
var nutella = NUTELLA.init(query_params.broker, query_params.app_id, query_params.run_id, NUTELLA.parseComponentId());

//Fetch room configuration (need mode)
nutella.net.request("room_configuration", '', function(response) {
  current_quake_id = response.current_quake_id;
  current_quake_time = new Date(response.current_quake_time);
  $("#c_quake_id_span").text(current_quake_id);
  $("#c_quake_time_span").text(current_quake_time.toGMTString());
});
nutella.net.request("quakes_schedule", '', function(response) {
  quakes_schedule = response.quakes_schedule;
  quakes_schedule.forEach(function(q) {
    addQuakeToDropdown(q);
  });
});

// Update links to reflect nutella parameters
$('a').each(function (index) {
	var link = $(this).attr('href');
	if (link!="" && link!="#")
	$(this).attr('href', link + "?app_id="+ query_params.app_id + "&run_id=" + query_params.run_id + "&broker=" + query_params.broker);
});


// Attach event handlers to GUI components

// Click on change quake button
$("#set_quake").click(function() {
	if ($("#quake_drop").val()==null)
		return false;
	// Display modal
	$("#confirmation").foundation("reveal", "open")
	return false;
});

// Click on NO button in confirmation modal
$("#confirmation_no").click(function() {
	$("#confirmation").foundation("reveal", "close");
	return false;
});

// Click on YES button in confirmation modal
$("#confirmation_yes").click(function() {
	// Fetch values and update model
	current_quake_id = $("#quake_drop").val();
	current_quake_time = new Date( quakes_schedule.find(function(e) {
		return e.id==current_quake_id;
	}).time);
	// Update UI
	$("#c_quake_id_span").text(current_quake_id);
	$("#c_quake_time_span").text(current_quake_time.toGMTString());
	// Send messages
	nutella.net.publish("set_current_quake", {current_quake_id: current_quake_id, current_quake_time: current_quake_time.getTime()});
	nutella.net.publish("wipe_observations")
	// Close modal
	$("#confirmation").foundation("reveal", "close");
	return false;
});


function addQuakeToDropdown(q) {
	var d = new Date(q.time);
	$("#quake_drop").append('<option value="'+q.id+'">Quake '+q.id+': '+ d.toGMTString() +'</option>');
}
