// Global variables 

// Model 
// NOTE: all dimensions are specified in meters!
var room_width;
var room_height;
var seismographs;
var mode;

// Canvases/processing references
var setup_canvas = document.getElementById("setup_canvas");
var setup_p = new Processing(setup_canvas, SeismoMap);
var edit_canvas = document.getElementById("edit_canvas");
var edit_p = new Processing(edit_canvas, SeismoMap);


// Initialize nutella
var query_params = NUTELLA.parseURLParameters();
var nutella = NUTELLA.init(query_params.broker, query_params.app_id, query_params.run_id, NUTELLA.parseComponentId());

//Fetch room configuration
nutella.net.request("room_configuration", undefined, function(response) {
	// Update model
	room_height = response.room_height_meters;
	room_width = response.room_width_meters;
	seismographs = response.seismographs;
	mode = response.rq_mode;
	// If there are data, update the views, otherwise show the setup modal
	if (seismographs===undefined) {
		seismographs = new Array();
		$("#roomSetup").foundation("reveal", "open");
	}
	updateViews();
});

// Update links to reflect nutella parameters
$('a').each(function (index) {
	var link = $(this).attr('href');
	if (link!="" && link!="#")
	$(this).attr('href', link + "?app_id="+ query_params.app_id + "&run_id=" + query_params.run_id + "&broker=" + query_params.broker);
});


// Attach event handlers to GUI components

// Add double click handlers to seismographs_table cells
$(".seismographs_table").on("dblclick", ".s_input_cell_x", function() {
		var value = $(this).text();
		$(this).html('<input class="s_input_x" type="text" />');
		$(this).children(".s_input_x").val(value);
});
$(".seismographs_table").on("dblclick", ".s_input_cell_y", function() {
		var value = $(this).text();
		$(this).html('<input class="s_input_y" type="text" />');
		$(this).children(".s_input_y").val(value);
});


// Add handles for seismographs_table x and y input fields
$(".seismographs_table").on("input", ".s_input_x, .s_input_y", function() {
	var cur_row_id = $(this).parent().parent().attr("r_id");
	var cur_idx = cur_row_id - 1;
	var last_row_id = $(".seismographs_table tr:last").attr("r_id");
	var cur_c;
	// Store the value of "the other cell" (i.e. if we are editing x, retrieve y and vice versa)
	if ($(this).hasClass("s_input_x")) {
		cur_c = parseFloat($(this).parent().parent().children(".s_input_cell_y").text());
		if (seismographs[cur_idx]!=undefined) {
			seismographs[cur_idx].x = parseFloat($(this).val());
			shipToBackend();
		};
	} else {
		cur_c = parseFloat($(this).parent().parent().children(".s_input_cell_x").text());
		if (seismographs[cur_idx]!=undefined) {
			seismographs[cur_idx].y = parseFloat($(this).val());
			shipToBackend();
		};
	}
	// If we are editing the row right before the last one and we clear the input field we should delete the row below
	if ($(this).val()=="" && parseInt(cur_row_id) == parseInt(last_row_id) - 1) {
		seismographs.pop();
		$(".seismographs_table tr[r_id='"+last_row_id+"']").remove();
		shipToBackend();
	}
	// If we are editing the last row and we are typing we might have to add a new row
	if (cur_row_id == last_row_id && !isNaN(cur_c)) {
		var new_id = parseInt(last_row_id) + 1
		$(".seismographs_table tbody").append('<tr r_id="'+new_id+'"><td>'+new_id+'</td><td class="s_input_cell_x"> <input class="s_input_x" type="text" placeholder="meters" /> </td><td class="s_input_cell_y"> <input class="s_input_y" type="text" placeholder="meters" /> </td> </tr>');
		var s = {};
		s.id = new_id - 1;
		if ($(this).hasClass(".s_input_x")) {
			s.x = parseFloat($(this).val());
			s.y = cur_c;
		} else {
			s.x = cur_c;
			s.y = parseFloat($(this).val());
		}
		seismographs.push(s);
		shipToBackend();
	}
});


// Add handlers for seismographs_table x and y input fields when people focus out of them (i.e. turn input into labels)
$(".seismographs_table").on("focusout", ".s_input_x, .s_input_y", function() {
	var v = $(this).val();
	var td = $(this).parent();
	var tr = td.parent();
	var idx = tr.attr("r_id")
	if (v != "") {
		$(this).remove();
		td.text(v);
	}
});


// Show seismographs setup modal once we click "Configure room" on room setup modal
$("#roomSetupForm").on('valid.fndtn.abide', function() {
	// Update model
	room_width = parseFloat($("#room_width_field").val())
	room_height = parseFloat($("#room_height_field").val());
	// Update views (canvases)
	setup_canvas.setAttribute("height", setup_canvas.width * room_height / room_width)
	setup_p.size(setup_canvas.width, setup_canvas.height);
	edit_canvas.setAttribute("height", edit_canvas.width * room_height / room_width)
	edit_p.size(edit_canvas.width, edit_canvas.height);
	// Change modals
	$("#seismographsSetup").foundation("reveal", "open");
	return false;
});


// Dismiss seismographs setup modal once we click "setup seismographs" and ship all the information to the backend
$("#seismographs_setup_btn").click(function() {
	// Set demo mode
	mode = "demo";
	// Dismiss modal
	$("#seismographsSetup").foundation("reveal", "close");
	// Update view
	updateViews();
	// Ship to backend
	shipToBackend();
	nutella.net.publish( 'mode_update', {rq_mode : mode} );
	return false;
});


// Enable changes to room height
$("#edit_height").on('focusout change', function() {
	room_height = parseFloat($(this).val());
	// Update canvas
	edit_canvas.setAttribute("height", edit_canvas.width * room_height / room_width)
	edit_p.size(edit_canvas.width, edit_canvas.height);
	// Send to backend
	shipToBackend()
});


// Enable changes to room width
$("#edit_width").on('focusout change', function() {
	room_width = parseFloat($(this).val());
	// Update canvas
	edit_canvas.setAttribute("height", edit_canvas.width * room_height / room_width)
	edit_p.size(edit_canvas.width, edit_canvas.height);
	// Send to backend
	shipToBackend();
});


// Listen for mode changes. Checked = demo mode, uncheked = schedule mode
$("#mode_switch").change(function() {
	if (this.checked) {
		mode = "demo"
	} else {
		mode = "schedule"
	}
	$("#mode_span").text(mode + " mode");
	// Send mode update
	nutella.net.publish( 'mode_update', {rq_mode : mode} );
});

// Utility functions

// Updates views whenever a change in the model is made
function updateViews() {
	// Update canvas
	edit_canvas.setAttribute("height", edit_canvas.width * room_height / room_width)
	edit_p.size(edit_canvas.width, edit_canvas.height);
	// Update seismographs table
	$(".seismographs_table tbody").empty();
	seismographs.forEach(function(e) {
		$(".seismographs_table tbody").append('<tr r_id="'+e.id+'"><td>'+e.id+'</td><td class="s_input_cell_x">'+e.x+'</td><td class="s_input_cell_y">'+e.y+'</td></tr>');
	});
	$(".seismographs_table tbody").append('<tr r_id="'+(seismographs.length+1)+'"><td>'+(seismographs.length+1)+'</td><td class="s_input_cell_x"> <input class="s_input_x" type="text" placeholder="meters" /> </td><td class="s_input_cell_y"> <input class="s_input_y" type="text" placeholder="meters" /> </td> </tr>'); 
	// Update room sizes form
	$("#edit_height").val(room_height);
	$("#edit_width").val(room_width);
	// Update mode switch
	if (mode=="demo") {
		$("#mode_switch").prop("checked", true);
	} else {
		$("#mode_switch").prop("checked", false);
	}
	$("#mode_span").text(mode + " mode");
}


// Updates the backend model by shipping everything over the net
function shipToBackend() {
	var m = {}
	m.room_width_meters = room_width;
	m.room_height_meters = room_height;
	m.seismographs = seismographs;
	nutella.net.publish("room_config_update", m);
}


