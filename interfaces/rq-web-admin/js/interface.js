// Utility functions
function perturbate(v, percent) {
	return  -v*percent/2 + Math.random()*percent*v;
}

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

function parseD(str) {
    var y = str.substr(0,4),
        m = str.substr(5,2) - 1,
        d = str.substr(8,2);
    var D = new Date(y,m,d);
    return (D.getFullYear() == y && D.getMonth() == m && D.getDate() == d) ? D : 'invalid date';
};

function parseT(str, date) {
	var hms = str.split(":");
	var s2 = hms[2].split(" ");
	hms[2] = s2[0];
	var ampm = s2[1];
	var time = {};
	if (ampm=="PM") {
		time.hour = hms[0]+12;
	} else {
		time.hour = hms[0];
	}
	time.min = hms[1];
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


Date.prototype.yyyymmdd = function() {                     
        var yyyy = this.getFullYear().toString();                                    
        var mm = (this.getMonth()+1).toString(); // getMonth() is zero-based         
        var dd  = this.getDate().toString();                
        return yyyy + '-' + (mm[1]?mm:"0"+mm[0]) + '-' + (dd[1]?dd:"0"+dd[0]);
}; 
	  
		
Date.prototype.hhmmss = function() {
		var h = this.getHours().toString();
    var m = this.getMinutes().toString();
    var s = this.getSeconds().toString();
		return (h[1]?h:"0"+h[0]) + ':' + (m[1]?m:"0"+m[0]) + ':' + (s[1]?s:"0"+s[0]);
};

Date.prototype.sameDayOf = function(d) {
	var d1 = new Date(this).setHours(0, 0, 0, 0);
	var d2 = new Date(d).setHours(0, 0, 0, 0);
	return  d1 === d2;
};


// start date we want to have the first quake
// last date we want to have the last quake
// magMin minimum value for magnitude
// maxMin maximum value for magnitude
// quakes_per_day (optional)
// example: suggestSchedule(new Date(1414082722000), new Date(1414773922000), 3, 6);
// suggestSchedule = function(first, last, magMin, magMax, quakes_per_day) {
// 	// how many quakes do we need to generate?
// 	var n_quakes;
// 	var quakesPerDay;
// 	var date_range = last - first;
// 	var days = date_range / 86400000;  //86400000 is the number of milliseconds in a day;   DAYS shuodl be > than n_quakes
// 	if (quakes_per_day===undefined) {
// 		quakesPerDay = 1;
// 	} else {
// 		quakesPerDay = quakes_per_day;
// 	}
// 	n_quakes = Math.round(days * quakesPerDay);
// 	// console.log("Quakes per day " + quakesPerDay);
// 	// console.log("Days " + Math.round(days));
// 	// console.log("Quakes #" + n_quakes);
// 	// how many quakes have magnitude x?
// 	var totMag = 0;
// 	var cm = 1;
// 	for (i=0; i<(magMax-magMin+1); i++) {
// 		totMag += cm;
// 		cm *=2;
// 	}
// 	var magProps = new Array();
// 	cm = 1
// 	for (i=0; i<(magMax-magMin+1); i++) {
// 		magProps.push(cm/totMag);
// 		cm *=2;
// 	}
// 	magProps.reverse();
// 	magProps.forEach(function(el, i, a){
// 		a[i] = Math.round(el * n_quakes);
// 	});
// 	// console.log("Magnitudes " + magProps);
// 	// generate quakes
// 	var suggested_quakes = new Array();
// 	magProps.forEach(function(el, index, a) {
// 		for (i=0; i<el; i++) {
// 			var q = {};
// 			q.magnitude = magMin+index;
// 			q.time = new Date( first.getTime() + date_range * Math.random());
// 			var xy = Math.random() * room_height;
// 			q.location = {};
// 			q.location.x = xy;
// 			q.location.y = xy;
// 			suggested_quakes.push(q);
// 		}
// 	});
// 	suggested_quakes.sort(function(a, b){
// 		return a.time - b.time;
// 	});
// 	return suggested_quakes;
// }


suggestScheduleN = function(first, last, magMin, magMax, tot_quakes) {
	// how often will we generate a quake?
	var interval = (last - first) / (tot_quakes+2);
	console.log("Generating a quake every " + interval / 60000+ " minutes");
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
	//console.log("Magnitudes " + magProps);
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
			var xy = Math.random() * room_height;
			q.location = {};
			q.location.x = xy;
			q.location.y = xy;
			suggested_quakes.push(q);
		}
	});
	suggested_quakes.sort(function(a, b){
		return a.time - b.time;
	});
	return suggested_quakes;
}


//////////////////////////////
// Global variables (model) //
//////////////////////////////
var room_width;
var room_height;
var seismographs = new Array();   // ALWAYS in inches. Start with Y axis. Short side on the left and long side on the right
var live_quakes = new Array();  
var demo_quakes = new Array();  
var MIN_MAG = 3;
var MAX_MAG = 6;


/////////////////////////////
// Interface util function //
////////////////////////////
fillQuakesTable = function(quakesArray) {
	quakesArray.forEach(function(el, i, quakes) {
		var date = new Date(el.time);
		var date_options = {weekday: "short", year: "numeric", month: "short", day: "numeric"};
		var time_options = {hour: "numeric", minute: "numeric", second: "numeric"};
		var s_date = date.toLocaleString("en-US", date_options);
		var s_time = date.toLocaleString("en-US", time_options);
		if (date > new Date()) {
			$("#quakes_schedule tbody").append('<tr r_id="'+i+'"><td>'+(i+1)+'</td><td class="date_cell">'+s_date+'</td><td class="time_cell">'+s_time+'</td><td class="magnitude_cell">'+el.magnitude+'</td></tr>');
		} else {
			$("#quakes_schedule tbody").append('<tr r_id="'+i+'" class="uneditable"><td>'+(i+1)+'</td><td class="date_cell">'+s_date+'</td><td class="time_cell">'+s_time+'</td><td class="magnitude_cell">'+el.magnitude+'</td></tr>');
		}
	});
};



////////////////////
// Interface init //
////////////////////

// Processing.js init
var canvas = document.getElementById("sketch");
var processingInstance = new Processing(canvas, ClassMap);
var room_canvas = document.getElementById("seismographs_setup_sketch");
var pInstance2 = new Processing(room_canvas, SeismographsMap);

// Demo / live toggle 
$("#cancel").addClass("disabled");
$("#quake").addClass("disabled");
$("#cancel").prop("disabled",true);
$("#quake").prop("disabled",true);
$("#demo_magnitude").attr("disabled", true)
$("#demo_controls").hide()

// Fetch data from remote  TODO comment seismographs and live_quakes out to show modals
var config_json = JSON.parse('{ "room_width_inches": 192, "room_height_inches": 113, "seismographs": [ { "id": "A", "wall": 1, "x": 51, "y": 10 }, { "id": "B", "wall": 2, "x": 97, "y": 10 }, { "id": "C", "wall": 3, "x": 66, "y": 10 }, { "id": "D", "wall": 4, "x": 73, "y": 10 }, { "id": "E", "wall": 4, "x": 141, "y": 10 } ] }');
room_width = config_json.room_width_inches;
room_height = config_json.room_height_inches;
seismographs = config_json.seismographs;
var live_quakes_json = JSON.parse('{ "quakes_schedule": [ { "magnitude": 6, "time": "2014-10-27T19:24:12.140Z", "location": { "x": 50.04215484391898, "y": 50.04215484391898 } }, { "magnitude": 4, "time": "2014-10-28T02:06:05.267Z", "location": { "x": 0.5038409749977291, "y": 0.5038409749977291 } }, { "magnitude": 3, "time": "2014-10-28T09:13:56.398Z", "location": { "x": 5.02677208208479, "y": 5.02677208208479 } }, { "magnitude": 3, "time": "2014-10-28T09:35:46.023Z", "location": { "x": 45.43213038239628, "y": 45.43213038239628 } }, { "magnitude": 3, "time": "2014-10-28T22:31:39.707Z", "location": { "x": 64.22409046557732, "y": 64.22409046557732 } }, { "magnitude": 4, "time": "2014-11-01T04:22:11.429Z", "location": { "x": 44.44914847356267, "y": 44.44914847356267 } }, { "magnitude": 3, "time": "2014-11-03T15:09:30.517Z", "location": { "x": 54.42260189005174, "y": 54.42260189005174 } }, { "magnitude": 3, "time": "2014-11-03T17:48:20.394Z", "location": { "x": 72.05053663696162, "y": 72.05053663696162 } }, { "magnitude": 4, "time": "2014-11-04T14:34:16.253Z", "location": { "x": 99.79557786113583, "y": 99.79557786113583 } }, { "magnitude": 5, "time": "2014-11-06T15:29:28.388Z", "location": { "x": 4.897479786304757, "y": 4.897479786304757 } }, { "magnitude": 5, "time": "2014-11-06T20:22:50.408Z", "location": { "x": 1.0862222048453987, "y": 1.0862222048453987 } }, { "magnitude": 4, "time": "2014-11-07T17:11:13.239Z", "location": { "x": 31.481518098618835, "y": 31.481518098618835 } }, { "magnitude": 5, "time": "2014-11-08T01:09:06.920Z", "location": { "x": 1.623724781209603, "y": 1.623724781209603 } }, { "magnitude": 3, "time": "2014-11-08T07:46:30.572Z", "location": { "x": 14.797770236618817, "y": 14.797770236618817 } }, { "magnitude": 3, "time": "2014-11-10T13:52:39.716Z", "location": { "x": 25.074560242472216, "y": 25.074560242472216 } }, { "magnitude": 3, "time": "2014-11-11T08:38:55.839Z", "location": { "x": 85.16520420508459, "y": 85.16520420508459 } }, { "magnitude": 3, "time": "2014-11-12T21:02:15.051Z", "location": { "x": 25.2746538259089, "y": 25.2746538259089 } }, { "magnitude": 3, "time": "2014-11-13T07:21:02.395Z", "location": { "x": 5.658522453857586, "y": 5.658522453857586 } }, { "magnitude": 4, "time": "2014-11-14T03:14:47.584Z", "location": { "x": 112.7032009116374, "y": 112.7032009116374 } } ] }');
live_quakes = live_quakes_json.quakes_schedule;
var demo_quakes_json = JSON.parse('{ "quakes_schedule": [ { "time": 1412969338000, "magnitude": 4.9, "location": { "x": 10, "y": 30 } }, { "time": 1412972939000, "magnitude": 7.8, "location": { "x": 40, "y": 20 } }] }')
demo_quakes = demo_quakes_json.quakes_schedule;
// If there is no configuration, display config modals
if (seismographs.length!=0 && live_quakes!=0) {
	// Set canvas height to fit the proportions of the room
	canvas.setAttribute("height", canvas.width * room_height / room_width)
	processingInstance.size(canvas.width, canvas.height);
	// Draw quakes table
	fillQuakesTable(live_quakes);
} else {
	$("#roomSetup").foundation("reveal", "open");
}


/////////////////////////////
// Interface, setup modals //
/////////////////////////////

// Utility functions
table_row_html = function(id) {
	return '<tr r_id="'+id+'"> <td>'+id+'</td> <td class="wall_id_cell"> <select class="wall_id"> <option value="-1" selected="selected" disabled="disabled" >Select wall</option> <option value="1">Wall 1</option> <option value="2">Wall 2</option> <option value="3">Wall 3</option> <option value="4">Wall 4</option> </select> </td> <td class="seismographs_input_cell_x"> <input class="seismographs_input_x" type="text" placeholder="in inches" /> </td> <td class="seismographs_input_cell_y"> <input class="seismographs_input_y" type="text" placeholder="in inches" /> </td> </tr>'
}
renderSeismographsTable = function() {
	seismographs.forEach(function(e) {
		$("#seismographs_table_setup tbody").append('<tr r_id="'+e.id+'"><td>'+e.id+'</td><td class="wall_id_cell">'+e.wall+'</td><td class="seismographs_input_cell_x">'+e.x+'</td><td class="seismographs_input_cell_y">'+e.y+'</td></tr>');
	});
	$("#seismographs_table_setup tbody").append(table_row_html(String.fromCharCode(65+$("#seismographs_table_setup tbody tr").length)));
	// Add double click handlers
	$("#seismographs_table_setup").on("dblclick", ".wall_id_cell", function() {
		var value = $(this).text();
		$(this).html('<select class="wall_id"> <option value="-1" selected="selected" disabled="disabled" >Select wall</option> <option value="1">Wall 1</option> <option value="2">Wall 2</option> <option value="3">Wall 3</option> <option value="4">Wall 4</option> </select>');
		$(this).children(".wall_id").val(value);
	});
	$("#seismographs_table_setup").on("dblclick", ".seismographs_input_cell_x", function() {
			var value = $(this).text();
			$(this).html('<input class="seismographs_input_x" type="text" />');
			$(this).children(".seismographs_input_x").val(value);
	});
	$("#seismographs_table_setup").on("dblclick", ".seismographs_input_cell_y", function() {
			var value = $(this).text();
			$(this).html('<input class="seismographs_input_y" type="text" />');
			$(this).children(".seismographs_input_y").val(value);
	});
}

// Room setup modal
$("#roomSetupForm").on('valid.fndtn.abide', function() {
	// Set room parameters
	room_width = parseInt($("#room_width_field").val())
	room_height = parseInt($("#room_height_field").val());
	// TODO publish to MQTT
	// Configure canvases
	canvas.setAttribute("height", canvas.width * room_height / room_width)
	processingInstance.size(canvas.width, canvas.height);
	room_canvas.setAttribute("height", room_canvas.width * room_height / room_width)
	pInstance2.size(room_canvas.width, room_canvas.height);
	// Change modals
	$("#seismographsSetup").foundation("reveal", "open")
});

// Seismographs modal
renderSeismographsTable();
$("#seismographs_table_setup").on("input", ".seismographs_input_x,.seismographs_input_y", function() {
	var cur_row = $(this).parent().parent().attr("r_id");
	var cur_idx = cur_row.charCodeAt(0)-65;
	var last_row = $("#seismographs_table_setup tr:last").attr("r_id");
	var cur_wall = parseInt($(this).parent().parent().children(".wall_id_cell").text());
	var cur_c;
	if ($(this).hasClass("seismographs_input_x")) {
		cur_c = parseInt($(this).parent().parent().children(".seismographs_input_cell_y").text());
		if (seismographs[cur_idx]!=undefined) {
			seismographs[cur_idx].x = $(this).val();
		};
	} else {
		cur_c = parseInt($(this).parent().parent().children(".seismographs_input_cell_x").text());
		if (seismographs[cur_idx]!=undefined) {
			seismographs[cur_idx].y = $(this).val();
		};
	}
	if ($(this).val()=="") {
		if (cur_row != last_row) {
			seismographs.pop();
			$("#seismographs_table_setup tr:last").remove();
		}
	} else {
		if (cur_row == last_row && !isNaN(cur_c) && !isNaN(cur_wall)) {
			$("#seismographs_table_setup tbody").append(table_row_html(String.fromCharCode(65+$("#seismographs_table_setup tbody tr").length)));
			var s = {};
			s.id = String.fromCharCode(65+$("#seismographs_table_setup tbody tr").length-2);
			s.wall = cur_wall;
			if ($(this).hasClass("seismographs_input_x")) {
				s.x = parseInt($(this).val());
				s.y = cur_c;
			} else {
				s.x = cur_c;
				s.y = parseInt($(this).val());
			}
			seismographs.push(s);
		}
	}
});
$("#seismographs_table_setup").on("input", ".wall_id", function() {
	var cur_row = $(this).parent().parent().attr("r_id");
	var last_row = $("#seismographs_table_setup tr:last").attr("r_id");
	var cur_x = parseInt($(this).parent().parent().children(".seismographs_input_cell_x").text());
	var cur_y = parseInt($(this).parent().parent().children(".seismographs_input_cell_y").text());
	var cur_idx = cur_row.charCodeAt(0)-65;
	if (seismographs[cur_idx]!=undefined) {
		seismographs[cur_idx].wall = parseInt($(this).val());
	};
	if (cur_row == last_row && !isNaN(cur_x) && !isNaN(cur_y)) {
		$("#seismographs_table_setup tbody").append(table_row_html(String.fromCharCode(65+$("#seismographs_table_setup tbody tr").length)));
		var s = {};
		s.id = String.fromCharCode(65+$("#seismographs_table_setup tbody tr").length-2);
		s.wall = $(this).val();
		s.x = cur_x;
		s.y = cur_y;
		seismographs.push(s);
	}
});
$("#seismographs_table_setup").on("focusout", ".wall_id", function() {
	var v = $(this).val();
	var td = $(this).parent();
	if (v != null) {
		$(this).remove();
		td.text(v);
	}
});
$("#seismographs_table_setup").on("focusout", ".seismographs_input_x,.seismographs_input_y", function() {
	var v = $(this).val();
	var td = $(this).parent();
	if (v != "") {
		$(this).remove();
		td.text(v);
	}
});
$("#seismographs_setup_btn").click(function(){
	// TODO publish to MQTT
	$("#quakes_schedule_modal").foundation("reveal", "open");
});

// Quakes generation modal
Date.prototype.toDateInputValue = (function() {
    var local = new Date(this);
    local.setMinutes(this.getMinutes() - this.getTimezoneOffset());
    return local.toJSON().slice(0,10);
});
$("#unit_start_date").prop("min", new Date().toDateInputValue());
$("#unit_start_date").val(new Date().toDateInputValue());
$("#unit_end_date").prop("min", new Date(new Date().getTime() + 24 * 60 * 60 * 1000).toDateInputValue());
$("#unit_start_date").change(function() {
	$("#unit_end_date").prop("min", $("#unit_start_date").val());
});
$("#quakes_schedule_form").on('valid.fndtn.abide', function() {
	var start = parseD($("#unit_start_date").val());
	var end = parseD($("#unit_end_date").val());
	var quakes_n = parseInt($("#total_quakes_input").val());
	live_quakes = suggestScheduleN(start, end, MIN_MAG, MAX_MAG, quakes_n);
	fillQuakesTable(live_quakes);
	$("#quakes_schedule_modal").foundation("reveal", "close");
	// TODO Publish to  MQTT
});



////////////////////
// Main Interface //
////////////////////

// Mode selector
$("#modeSelect").click(function() {
	if($("#modeSelect").prop("checked")) {
		$("#modeSelectLabel").text('Toggle the switch for "live mode"');
		$("#quakes_schedule tbody").empty();
		fillQuakesTable(demo_quakes);
		$("#demo_controls").show()
	} else {
		$("#modeSelectLabel").text('Toggle the switch for "demo mode"');
		$("#quakes_schedule tbody").empty();
		fillQuakesTable(live_quakes);
		$("#demo_controls").hide()
	}
});


// Add quakes table events listeners
$("#quakes_schedule").on("dblclick", ".date_cell", function() {
	var row_idx = $(this).parent().attr("r_id");
	var val = new Date(live_quakes[row_idx].time);
	// Skip quakes that already happened
	if (val < new Date()) {
		return;
	}
	var min;
	var max;
	if (row_idx==0) {
		min = new Date().yyyymmdd();
	} else {
		min = new Date(live_quakes[row_idx-1].time).yyyymmdd()
	}
	if (row_idx!=live_quakes.length-1) {
		max = new Date(live_quakes[parseInt(row_idx)+1].time).yyyymmdd()
	}
	$(this).html('<input class="quake_date_pick" type="date" min="'+min+'" max="'+max+'">');
	$(this).children().val(val.yyyymmdd());
});

$("#quakes_schedule").on("focusout", ".quake_date_pick", function() {
	var val = $(this).val();
	var td = $(this).parent();
	var row_idx = td.parent().attr("r_id");
	var time = td.parent().children(".time_cell").text();
	if (val != null) {
		// Parse
		var d = parseD(val);
		var t = parseT(time, d);
		// Update model
		live_quakes[row_idx].time = t.toJSON();
		// Update table
		$(this).remove();
		var date_from_model = new Date(live_quakes[row_idx].time)
		td.text(date_from_model.toLocaleString("en-US", {weekday: "short", year: "numeric", month: "short", day: "numeric"}));
	}	
});

$("#quakes_schedule").on("dblclick", ".time_cell", function() {
	var row_idx = $(this).parent().attr("r_id");
	var val = new Date(live_quakes[row_idx].time);
	// Skip quakes that already happened
	if (val < new Date()) {
		return;
	}
	var min;
	var max;
	if (row_idx==0) {
		min = new Date().hhmmss();
	} else {
		var min_date = new Date(live_quakes[row_idx-1].time);
		if (val.sameDayOf(min_date)) {
			min = min_date.hhmmss()
		}
	}
	if (row_idx!=live_quakes.length-1) {
		var max_date = new Date(live_quakes[parseInt(row_idx)+1].time);
		if (val.sameDayOf(max_date)) {
			max = max_date.hhmmss()	
		} 
	}
	$(this).html('<input class="quake_time_pick" type="time" min="'+min+'" max="'+max+'" step="1">');
	$(this).children().val(val.hhmmss());
});

$("#quakes_schedule").on("focusout", ".quake_time_pick", function() {
	var time = $(this).val();
	var td = $(this).parent();
	var row_idx = td.parent().attr("r_id");
	var date = new Date(live_quakes[row_idx].time);
	if (time != null) {
		// Parse
		var t = parseT(time, date);
		// Update model
		live_quakes[row_idx].time = t.toJSON();
		// Update table
		$(this).remove();
		td.text(t.toLocaleString("en-US", {hour: "numeric", minute: "numeric", second: "numeric"}));
	}	
});

$("#quakes_schedule").on("dblclick", ".magnitude_cell", function() {
	var row_idx = $(this).parent().attr("r_id");
	var row_date = new Date(live_quakes[row_idx].time);
	// Skip quakes that already happened
	if (row_date < new Date()) {
		return;
	}
	var v = $(this).text();
	var html = '<select class="quake_mag_dropdown">';
	for (i = MIN_MAG; i<= MAX_MAG; i++) {
		html += '<option value="'+i+'">'+i+'</option>';	
	}
	html += '</select>';
	$(this).html(html);
	$(this).children().val(v);
});

$("#quakes_schedule").on("focusout", ".quake_mag_dropdown", function() {
	var td = $(this).parent();
	var row_idx = td.parent().attr("r_id");
	var v = $(this).val();
	console.log(v);
	// Update model
	live_quakes[row_idx].magnitude = v;
	// Update table
	$(this).remove();
	td.text(v);
});




////////////////////
// Demo Interface //
////////////////////

//Init magnitude picker
for (i = MIN_MAG; i<= MAX_MAG; i++) {
	$('#demo_magnitude').append($('<option/>', { 
		value: i,
		text : i 
	}));	
}

$("#cancel").click(function() {
	processingInstance.manualQuakeX = -1;
	processingInstance.manualQuakeY = -1;
	$("#cancel").addClass("disabled");
	$("#quake").addClass("disabled");
	$("#cancel").prop("disabled",true);
	$("#quake").prop("disabled",true);
	$("#demo_magnitude").attr("disabled", true)
});
$("#killQuake").click(function() {
	$("#quakeConfirm").foundation("reveal", "close")
});
$("#confirmQuake").click(function() {
	processingInstance.manualQuakeX = -1;
	processingInstance.manualQuakeY = -1;
	$("#cancel").addClass("disabled");
	$("#quake").addClass("disabled");
	$("#cancel").prop("disabled",true);
	$("#quake").prop("disabled",true);
	$("#demo_magnitude").attr("disabled", true)
	$("#quakeConfirm").foundation("reveal", "close")
	// update model
	var mq = {};
	mq.magnitude = parseInt($("#demo_magnitude").val());
	mq.location = {};
	mq.location.x = processingInstance.manualQuakeXroom;
	mq.location.y = processingInstance.manualQuakeYroom;
	mq.time = new Date();
	demo_quakes.push(mq);
	$("#quakes_schedule tbody").empty();
	fillQuakesTable(demo_quakes);
	// TODO publish to MQTT
});
