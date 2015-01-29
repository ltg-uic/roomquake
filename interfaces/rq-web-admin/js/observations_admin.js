// Global variables 

// Model 
var observations;

// Initialize nutella and fetch data from backend
var query_params = nutella.init(location.search, function() {

	//TODO Fetch all existing observations
	// nutella.request("room_configuration", function(response) {
// 		// Update model
// 		observations = response.observations;
// 		// If there are data, update the views, otherwise show the setup modal
// 		if (observations===undefined) {
// 			observations = new Array();
// 		}
// 		updateViews();
// 	});
});

// Update links to reflect nutella parameters
$('a').each(function (index) {
	var link = $(this).attr('href');
	if (link!="" && link!="#")
	$(this).attr('href', link + "?run_id=" + query_params.run_id + "&broker=" + query_params.broker);
});


// Attach event handlers to GUI components

// Click on clear observations button
$("#clear_observations").click(function(){
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
	// Send message
	nutella.publish("wipe_observations")
	// Close modal
	$("#confirmation").foundation("reveal", "close");
	return false;
});


// Click on send event time
$("#set_event_time").click(function(){
	// Read and parse date
	str = $("#event_time").val();
	str_spl = str.split(" ");
	// Date
	ddd = str_spl[0].split("/");
	// Time
	ttt = str_spl[1].split(":");
	date = new Date( Date.UTC(ddd[0], ddd[1]-1, ddd[2], ttt[0], ttt[1], ttt[2]) );
	nutella.publish("event_time", {event_time: date.getTime()});
	return false;
});
