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

// Initialize nutella
var query_params = NUTELLA.parseURLParameters();
var nutella = NUTELLA.init(query_params.broker, query_params.app_id, query_params.run_id, NUTELLA.parseComponentId());

//Fetch room configuration
nutella.net.request("room_configuration", '', function(response) {
	// Update model
	room_height = response.room_height_meters;
	room_width = response.room_width_meters;
	seismographs = response.seismographs;
	// TODO If there's no data, it's a problem, we shouldn't be here... 
	updateCanvasSize();
});
quakes = new Array();
//Fetch quakes
nutella.net.request("quakes_schedule", '', function(response) {
	// Update model
	quakes = response.quakes_schedule;
	// If there's no data initialize the model
	if (quakes===undefined)
		quakes = new Array();
	// Update the quakes table view (only demo quakes)
	updateQuakesTableView('demo_quakes_table', true);
});

// Update links to reflect nutella parameters
$('a').each(function (index) {
	var link = $(this).attr('href');
	if (link!="" && link!="#")
	$(this).attr('href', link + "?app_id="+ query_params.app_id + "&run_id=" + query_params.run_id + "&broker=" + query_params.broker);
});


// Attach event handlers to GUI components

// Click on quakes table row to show coordinates for that quake in the map
$('#demo_quakes_table').on('click', 'tbody tr', function() {
	var r_id = $(this).attr('r_id');
	if (demo_p.highlight===undefined)
		demo_p.highlight = r_id;
	else
		demo_p.highlight = undefined;
});

// Modify x,y quake coordinates
$("#quake_x").on("input", function(){
	demo_p.manualQuakeXroom = parseFloat($(this).val());
	demo_p.manualQuakeX = demo_p.toCanvasX( demo_p.manualQuakeXroom );
});
$("#quake_y").on("input", function(){
	demo_p.manualQuakeYroom = parseFloat($(this).val());
	demo_p.manualQuakeY = demo_p.toCanvasY( demo_p.manualQuakeYroom );
});


// Click the cancel button
$("#cancel").click(function() {
	// Hide mouse quake dot
	demo_p.manualQuakeX = -100;
	demo_p.manualQuakeY = -100;
	// Clear input fields
	$("#quake_x").val('');
	$("#quake_y").val('');
	$("#demo_magnitude").val(2)
	return false;
});

// Click the "Generate quake" button
$('#quake').click(function() {
	// Update confirmation message
	var c_m = 'You are generating a quake of magnitude ' + $("#demo_magnitude").val() + ' at (' + Number(demo_p.manualQuakeXroom).toFixed(2) + ', ' + Number(demo_p.manualQuakeYroom).toFixed(2) + '). Quake will be generated in:';
	$('#confirm_message').text(c_m);
	// Display modal
	$("#countdown").foundation("reveal", "open")
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
	var cd_seconds = 5;
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

// Click the "Clear generated quakes" button
$('#clear_demo_quakes').click(function() {
	// Send message and reload
	nutella.net.publish("demo_quakes_clean", {});
	location.reload();
	return false;
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
		var coord_s = + el.location.x.toFixed(2) + ', ' + el.location.y.toFixed(2);
		if (date > new Date()) {
			$("#"+table_name+" tbody").append('<tr r_id="'+i+'"><td>'+(i+1)+'</td><td class="time_cell">'+date.toLocaleString()+'</td><td class="magnitude_cell">'+el.magnitude+'</td><td class="coord_cell">'+coord_s+'</td></tr>');
		} else {
			$("#"+table_name+" tbody").append('<tr r_id="'+i+'" class="uneditable"><td>'+(i+1)+'</td><td class="time_cell">'+date.toLocaleString()+'</td><td class="magnitude_cell">'+el.magnitude+'</td><td class="coord_cell">'+coord_s+'</td></tr>');
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
	mq.id = "d" + (quakes.length + 1);
	// Update model
	quakes.push(mq);
	// Update table view
	updateQuakesTableView('demo_quakes_table', true);
	// Ship to backend
	nutella.net.publish("new_demo_quake", mq);
	// Hide mouse quake dot
	demo_p.manualQuakeX = -100;
	demo_p.manualQuakeY = -100;
}

