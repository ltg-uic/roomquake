// Enhance Date with a bunch of utility functions

// Retuns the date in input form
Date.prototype.toDateInputValue = (function() {
    var local = new Date(this);
    local.setMinutes(this.getMinutes() - this.getTimezoneOffset());
    return local.toJSON().slice(0,10);
});


// Returns date as yyyy-mm-dd
Date.prototype.yyyymmdd = function() {                     
        var yyyy = this.getFullYear().toString();                                    
        var mm = (this.getMonth()+1).toString(); // getMonth() is zero-based         
        var dd  = this.getDate().toString();                
        return yyyy + '-' + (mm[1]?mm:"0"+mm[0]) + '-' + (dd[1]?dd:"0"+dd[0]);
}; 
	  
// Returns time in hh:mm:ss	
Date.prototype.hhmmss = function() {
		var h = this.getHours().toString();
    var m = this.getMinutes().toString();
    var s = this.getSeconds().toString();
		return (h[1]?h:"0"+h[0]) + ':' + (m[1]?m:"0"+m[0]) + ':' + (s[1]?s:"0"+s[0]);
};

// Returns true if two dates are on the same day
Date.prototype.sameDayOf = function(d) {
	var d1 = new Date(this).setHours(0, 0, 0, 0);
	var d2 = new Date(d).setHours(0, 0, 0, 0);
	return  d1 === d2;
};



// Global variables 

var MIN_MAG = 2;
var MAX_MAG = 5;

// Model 
// NOTE: all dimensions are specified in meters!
var room_width;
var room_height;
var seismographs;
var quakes;
var quakes_events;
var current_edit_id;

// Canvases/processing references
var live_canvas = document.getElementById("live_canvas");
var live_p = new Processing(live_canvas, ScheduledQuakesMap);

// Initialize nutella
var query_params = NUTELLA.parseURLParameters();
var nutella = NUTELLA.init(query_params.broker, query_params.app_id, query_params.run_id, NUTELLA.parseComponentId());
//Fetch room configuration
nutella.net.request('room_configuration', '', function(response) {
	// Update model
	room_height = response.room_height_meters;
	room_width = response.room_width_meters;
	seismographs = response.seismographs;
	updateCanvasSize();
});
quakes = new Array();
//Fetch quakes
nutella.net.request("quakes_series", '', function(response) {
	// Update model
	quakes = response.quakes_schedule;
	// If there's no data, display the quakes schedule modal
	if (quakes===undefined)
		$('#quakes_schedule_modal').foundation("reveal", "open");
	// Update the quakes table view
	updateQuakesTableAndCalendarView('quakes_schedule');
});

// Update links to reflect nutella parameters
$('a').each(function (index) {
	var link = $(this).attr('href');
	if (link!="" && link!="#")
	$(this).attr('href', link + "?app_id="+ query_params.app_id + "&run_id=" + query_params.run_id + "&broker=" + query_params.broker);
});


// Attach event handlers to GUI components

// Configure date pickers in quakes generation modal
$("#unit_start_date").prop("min", new Date().toDateInputValue());
$("#unit_start_date").val(new Date().toDateInputValue());
$("#unit_end_date").prop("min", new Date(new Date().getTime() + 24 * 60 * 60 * 1000).toDateInputValue());
$("#unit_start_date").change(function() {
	$("#unit_end_date").prop("min", $("#unit_start_date").val());
});

// Click 'generate' on quakes generation modal
$("#quakes_schedule_form").on('valid.fndtn.abide submit', function(e) {
	if(e.type === "valid") {
		var start = parseD($("#unit_start_date").val());
		var end = parseD($("#unit_end_date").val());
		var quakes_n = parseInt($("#total_quakes_input").val());
		quakes = suggestQuakesSchedule(start, end, MIN_MAG, MAX_MAG, quakes_n, function() {
			var wrx = room_width * 0.05;
			var x =  wrx + Math.random() * (room_width - 2*wrx);
			var y = room_height -  room_height / room_width * x;
			return [x, y];
		});
		updateQuakesTableAndCalendarView('quakes_schedule');
		$("#quakes_schedule_modal").foundation("reveal", "close");
		nutella.net.publish('quakes_schedule_update', { quakes_schedule : quakes } );
	}
	return false;
});

// Click on quakes table row to show coordinates for that quake in the map
$('#quakes_schedule').on('click', 'tbody tr', function() {
	var r_id = $(this).attr('r_id');
	if (live_p.highlight===undefined)
		live_p.highlight = r_id;
	else
		live_p.highlight = undefined;
});

// Quakes calendar configuration
$('#quakes_calendar').fullCalendar({
	defaultView: 'agendaWeek',
	timezone: 'local',
	editable: true,
	eventLimit: true,
	events: quakes_events,
	// Edit event
	eventDrop: function(event) {
		quakes[event.id].time = event.start.format();
		sortQuakesByDate();
		updateQuakesTableAndCalendarView('quakes_schedule');
		nutella.net.publish('quakes_schedule_update', { quakes_schedule : quakes } );
	},
	// Add event
	dayClick: function(date, jsEvent, view) {
		$('#quake_edit_date').val(date.format('YYYY-MM-DD'));
		$('#quake_edit_time').val(date.format('HH:mm:ss'));
		// Generate location for new quakes
		var wrx = room_width * 0.05;
		var x = wrx + Math.random() * (room_width - 2*wrx)
		$('#quake_edit_x').val(x);
		$('#quake_edit_y').val( room_height - room_height / room_width * x );
		$('#quake_edit_modal').foundation("reveal", "open");
	},
	// Edit event
	eventClick: function(event) {
		current_edit_id = event.id;
		$('#quake_edit_date').val(event.start.format('YYYY-MM-DD'));
		$('#quake_edit_time').val(event.start.format('HH:mm:ss'));
		$('#quake_edit_magnitude').val(quakes[current_edit_id].magnitude);
		$('#quake_edit_x').val(quakes[current_edit_id].location.x);
		$('#quake_edit_y').val(quakes[current_edit_id].location.y);
		$('#quake_edit_modal').foundation("reveal", "open");
	},
});

// Quake add / edit modal 
$("#quake_edit_form").on('valid.fndtn.abide submit', function(e) {
	// if(e.type === "valid") {
		var quake_date = parseD($("#quake_edit_date").val());
		var quake_time = parseT($("#quake_edit_time").val(), quake_date);
		var q = {};
		q.magnitude = parseInt($("#quake_edit_magnitude").val());
		q.time = quake_time.toISOString();
		q.location = {};
		q.location.x = parseFloat($("#quake_edit_x").val());
		q.location.y = parseFloat($("#quake_edit_y").val());
		q.demo = false;
		if (current_edit_id === undefined) {
			quakes.push(q);
		} else {
			quakes[current_edit_id].time = quake_time.toISOString();
			quakes[current_edit_id].magnitude = parseInt($("#quake_edit_magnitude").val());
			current_edit_id = undefined;
		}
		sortQuakesByDate();
		updateQuakesTableAndCalendarView('quakes_schedule');
		$("#quake_edit_modal").foundation("reveal", "close");
		nutella.net.publish('quakes_schedule_update', { quakes_schedule : quakes } );
		// }
		return false;
});

// Delete quake
$("#delete_quake").click(function() {
	if (current_edit_id !== undefined) {
		quakes.splice(current_edit_id, 1);
		sortQuakesByDate();
		updateQuakesTableAndCalendarView('quakes_schedule');
		nutella.net.publish('quakes_schedule_update', { quakes_schedule : quakes } );
		current_edit_id = undefined;
	}
	$("#quake_edit_modal").foundation("reveal", "close");
	return false;
});



// Utility functions

// Updates views whenever a change in the model is made
function updateCanvasSize() {
	live_canvas.setAttribute("height", live_canvas.width * room_height / room_width)
	live_p.size(live_canvas.width, live_canvas.height);
}

// Updates the quakes table
// if demo_flag is set to true, only demo quakes are visualized
function updateQuakesTableAndCalendarView(table_name) {
	$("#"+table_name+" tbody").empty();
	if (quakes===undefined)
		return;
	quakes.forEach(function(el, i) {
		var date = new Date(el.time);
		var coord_s = + el.location.x.toFixed(2) + ', ' + el.location.y.toFixed(2);
		if (date > new Date()) {
			$("#"+table_name+" tbody").append('<tr r_id="'+i+'"><td>'+(i+1)+'</td><td class="time_cell">'+date.toLocaleString()+'</td><td class="magnitude_cell">'+el.magnitude+'</td><td class="coord_cell">'+coord_s+'</td></tr>');
		} else {
			$("#"+table_name+" tbody").append('<tr r_id="'+i+'" class="uneditable"><td>'+(i+1)+'</td><td class="time_cell">'+date.toLocaleString()+'</td><td class="magnitude_cell">'+el.magnitude+'</td><td class="coord_cell">'+coord_s+'</td></tr>');
		}
	});
	// Update calendar view
	getQuakesEvents();
	$('#quakes_calendar').fullCalendar( 'removeEvents' );
	$('#quakes_calendar').fullCalendar( 'addEventSource', quakes_events );
}

// Sorts quakes by date
function sortQuakesByDate() {
	quakes.sort(function(a, b) {
		return new Date(a.time ) - new Date(b.time);
	});
	// Re-assign the ids
	for(i=0; i<quakes.length; i++) {
		quakes[i].id = i+1;
	}
}

// Converts the array of quakes into an array of calendar events 
function getQuakesEvents() {
	var events = [];
	quakes.forEach(function(q, i) {
		var e = {};
		e.id = i;
		e.addDay = false;
		e.eventStartEditable = true;
		e.eventDurationEditable = false;
		e.start = q.time;
		e.end = new Date(q.time).setMinutes(new Date(q.time).getMinutes() + 48);
		events.push(e);	
	});
	quakes_events = events;
}

// Perturbates a value with a random percentage
function perturbate(v, percent) {
	return  -v*percent/2 + Math.random()*percent*v;
}

// Shuffle and array (Fisher-Yates algorithm)
function shuffle(array) {
  var m = array.length, t, i;
  // While there remain elements to shuffle…
  while (m) {
    // Pick a remaining element…
    i = Math.floor(Math.random() * m--);
    // And swap it with the current element.
    t = array[m];
    array[m] = array[i];
    array[i] = t;
  }
  return array;
}

// Parses a date from data input box
function parseD(str) {
    var y = str.substr(0,4),
        m = str.substr(5,2) - 1,
        d = str.substr(8,2);
    var D = new Date(y,m,d);
    return (D.getFullYear() == y && D.getMonth() == m && D.getDate() == d) ? D : 'invalid date';
};

// Parses a time from time input box
function parseT(str, date) {
	var hms = str.split(":");
	var time = {}
	time.hour = hms[0];
	time.min = hms[1];
	if (hms.length == 2)
		time.sec = 0;
	else
		time.sec = hms[2];
	if (date === undefined) {
		return time;
	} else {
		date.setHours(time.hour);
		date.setMinutes(time.min);
		date.setSeconds(time.sec);
		return date;
	}
}

// Generates a series of quakes
// first, date of the first quake
// last, date of the last quake
// magMin, minimum magnitude
// magMax, maxiumum magnitude
// tot_quakes, total number of quakes
// f, function that generates x and y coordinates for each quake
function suggestQuakesSchedule(first, last, magMin, magMax, tot_quakes, f) {
	// how often will we generate a quake?
	var interval = (last - first) / (tot_quakes+2);
	// how many quakes have magnitude x?
	var totMag = 0; 
	var cm = 1;
	for (i=0; i<(magMax-magMin+1); i++) {
		totMag += cm;
		cm *=2;
	}
	var magProps = new Array();
	cm = 1
	for (i=0; i<(magMax-magMin+1); i++) {
		magProps.push(cm/totMag);
		cm *=2;
	}
	magProps.reverse();
	magProps.forEach(function(el, i, a){
		a[i] = Math.round(el * tot_quakes);
	});
	// generate quakes
	var suggested_quakes = new Array();
	var quakes_time = new Array();
	magProps.forEach(function(el, index, a) {
		for (i=0; i<el; i++) {
			quakes_time.push(new Date( first.getTime() + interval * (quakes_time.length+1) + perturbate(interval, .1)));
		}
	});
	quakes_time = shuffle(quakes_time);
	magProps.forEach(function(el, index, a) {
		for (i=0; i<el; i++) {
			var q = {};
			q.magnitude = magMin+index;
			q.time = quakes_time[suggested_quakes.length];
			var xy = f();
			q.location = {};
			q.location.x = xy[0];
			q.location.y = xy[1];
			q.demo = false;
			suggested_quakes.push(q);
		}
	});
	suggested_quakes.sort(function(a, b){
		return a.time - b.time;
	});
	// Assign ids
	for(i=0; i<suggested_quakes.length; i++) {
		suggested_quakes[i].id = i+1;
	}
	return suggested_quakes;
}
