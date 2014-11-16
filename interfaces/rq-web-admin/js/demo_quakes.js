// Global variables 

// Model 
// NOTE: all dimensions are specified in meters!
var room_width;
var room_height;
var seismographs;
var quakes;
var countdown_interval_id;

// Canvases/processing references
var demo_canvas = document.getElementById("demo_canvas");
var demo_p = new Processing(demo_canvas, DemoQuakesMap);

// Initialize nutella and fetch data from backend
var query_params = nutella.init(location.search, function() {
	//Fetch room configuration
	nutella.request("room_configuration", function(response) {
		// Update model
		room_height = response.room_height_meters;
		room_width = response.room_width_meters;
		seismographs = response.seismographs;
		// TODO If there's no data, it's a problem, we shouldn't be here... 
		updateCanvasSize();
	});
	//Fetch quakes
	nutella.request("quakes_schedule", function(response) {
		// Update model
		quakes = response.quakes_schedule;
		// If there's no data initialize the model 
		if (quakes===undefined)
			quakes = new Array();
		// Update the quakes table view (only demo quakes)
		updateQuakesTableView('demo_quakes_table', true);
	});
});

// Update links to reflect nutella parameters
$('a').each(function (index) {
	var link = $(this).attr('href');
	if (link!="" && link!="#")
	$(this).attr('href', link + "?run_id=" + query_params.run_id + "&broker=" + query_params.broker);
});


// Attach event handlers to GUI components

// Click the cancel button
$("#cancel").click(function() {
	// Hide mouse quake dot
	demo_p.manualQuakeX = -100;
	demo_p.manualQuakeY = -100;
	// Update GUI
	$("#cancel").addClass("disabled");
	$("#quake").addClass("disabled");
	$("#demo_magnitude").attr("disabled", true)
	return false;
});

// Click the "Generate quake" button
$('#quake').click(function() {
	// Update confirmation message
	var c_m = 'Are you sure you want to generate a quake of magnitude ' + $("#demo_magnitude").val() + ' at (' + Number(demo_p.manualQuakeXroom).toFixed(2) + ', ' + Number(demo_p.manualQuakeYroom).toFixed(2) + ') ? Once you click the "YES!" button below a ten seconds count-down will start (you\'ll still be able to cancel the quake)';
	$('#confirm_message').text(c_m);
	// Display modal
	$("#quakeConfirm").foundation("reveal", "open")
	return false;
});

// Click cancel button in confirmation modal
$("#killQuake").click(function() {
	$("#quakeConfirm").foundation("reveal", "close")
	return false;
});

// Click on confirm quake in modal
$("#confirmQuake").click(function() {
	$("#countdown").foundation("reveal", "open");
	return false;
});

// Click cancel button in countdown modal
$("#countdown_kill_quake").click(function() {
	$("#countdown").foundation("reveal", "close");
	return false;
});

// Update countdown message in countdown modal
$(document).on('open.fndtn.reveal', '#countdown', function (e) {
  // ignore non-namespaced event (i.e. work-around for bug in Foundation framework https://github.com/zurb/foundation/issues/5482)
  if (e.namespace != 'fndtn.reveal') return false;
	// Set countdown
	var cd_seconds = 10;
	$('#countdown_message').text(cd_seconds);
	countdown_interval_id = setInterval(function() {
		cd_seconds--;
		$('#countdown_message').text(cd_seconds);
		if (cd_seconds == 0) {
			countDownOver();
			$("#countdown").foundation("reveal", "close");
		}
	}, 1000);
});

// Cancel countdown whenever we dismiss the modal
// It could be dismissed by clicking cancel, tapping outside of the modal or by waiting for countdown completion
$(document).on('close.fndtn.reveal', '#countdown', function (e) {
	// ignore non-namespaced event (i.e. work-around for bug in Foundation framework https://github.com/zurb/foundation/issues/5482)
	if (e.namespace != 'fndtn.reveal') return false;
	clearInterval(countdown_interval_id);
	countdown_interval_id = undefined;
});


// Utility functions

// Updates views whenever a change in the model is made
function updateCanvasSize() {
	demo_canvas.setAttribute("height", demo_canvas.width * room_height / room_width)
	demo_p.size(demo_canvas.width, demo_canvas.height);
}

// Updates the quakes table
// if demo_flag is set to true, only demo quakes are visualized
function updateQuakesTableView(table_name, demo_flag) {
	$("#"+table_name+" tbody").empty();
	quakes.filter(function(el) {
		return el.demo==demo_flag;
	}).forEach(function(el, i) {
		var date = new Date(el.time);
		var date_options = {weekday: "short", year: "numeric", month: "short", day: "numeric"};
		var time_options = {hour: "numeric", minute: "numeric", second: "numeric"};
		var s_date = date.toLocaleString("en-US", date_options);
		var s_time = date.toLocaleString("en-US", time_options);
		if (date > new Date()) {
			$("#"+table_name+" tbody").append('<tr r_id="'+i+'"><td>'+(i+1)+'</td><td class="date_cell">'+s_date+'</td><td class="time_cell">'+s_time+'</td><td class="magnitude_cell">'+el.magnitude+'</td></tr>');
		} else {
			$("#"+table_name+" tbody").append('<tr r_id="'+i+'" class="uneditable"><td>'+(i+1)+'</td><td class="date_cell">'+s_date+'</td><td class="time_cell">'+s_time+'</td><td class="magnitude_cell">'+el.magnitude+'</td></tr>');
		}
	});
}

// Function fired whenever the schedule quake countdown is over
function countDownOver() {
	// Gather data
	var mq = {};
	mq.magnitude = parseInt($("#demo_magnitude").val());
	mq.location = {};
	mq.demo = true;
	mq.location.x = demo_p.manualQuakeXroom;
	mq.location.y = demo_p.manualQuakeYroom;
	mq.time = new Date();
	// Update model
	quakes.push(mq);
	// Update table view
	updateQuakesTableView('demo_quakes_table', true);
	// Ship to backend
	nutella.publish("quakes_schedule_update", mq);
	// Hide mouse quake dot
	demo_p.manualQuakeX = -100;
	demo_p.manualQuakeY = -100;
	// Update GUI
	$("#cancel").addClass("disabled");
	$("#quake").addClass("disabled");
	$("#demo_magnitude").attr("disabled", true);
}

