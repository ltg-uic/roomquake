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
	// Read, validate and parse date
	// Read: str comes in as YYYY/MM/DD hh:mm:ss
	str = $("#event_time").val();
	// Validate
	if (!checkEventTime(str)) {
		alert("Check your event time, something's off...");
		return false;
	}
	// Parse
	str_spl = str.split(" ");
	// Date
	ddd = str_spl[0].split("/");
	// Time
	ttt = str_spl[1].split(":");
	date = new Date( Date.UTC(ddd[0], ddd[1]-1, ddd[2], ttt[0], ttt[1], ttt[2]) );
	nutella.publish("event_time", {event_time: date.getTime()});
	alert("You changed the event time to " + str);
	return false;
});


function checkEventTime(str) {
	str_spl = str.split(" ");
	if (str_spl.length!=2) return false;
	// Date
	ddd = str_spl[0].split("/");
	if (ddd.length!=3) return false;
	// Time
	ttt = str_spl[1].split(":");
	if (ttt.length!=3) return false;
	// Assign pieces
	var  YYYY=ddd[0], MM=ddd[1], DD=ddd[2], hh=ttt[0], mm=ttt[1], ss=ttt[2];
	// Check length of each field
	if (YYYY.length!=4) return false;
	if (MM.length>2) return false;
	if (DD.length>2) return false;
	if (hh.length>2) return false;
	if (mm.length>2) return false;
	if (ss.length>2) return false;
	// Check fields are numeric
	try {
		if (isNaN(parseInt(YYYY))) return false; 
		if (isNaN(parseInt(MM))) return false; 
		if (isNaN(parseInt(DD))) return false; 
		if (isNaN(parseInt(hh))) return false; 
		if (isNaN(parseInt(mm))) return false; 
		if (isNaN(parseInt(ss))) return false; 
	} catch(e) {
		// If values are not number, date value is wrong
		return false;
	}
	// Check ranges
	if (YYYY<1970) return false;
	if (MM<0 || MM>12 ) return false;
	if (DD<0 || DD>31 ) return false;
	if (hh<0 || hh>23 ) return false;
	if (mm<0 || mm>59 ) return false;
	if (ss<0 || ss>59 ) return false;

	// If we didn't return, the the format is correct
	return true; 
}