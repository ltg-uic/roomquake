function valid(v) {
	return v!=undefined && v!="" && v!=null;
}

function ClassMap(p) {
	
	// Utility functions
	p.toCanvasX = function(r_x) {
		return r_x * canvas.width / room_width;
	}
	p.toCanvasY = function(room_y) {
		return (room_height - room_y) * canvas.height / room_height;
	}
	p.toRoomX = function(canvas_x) {
		return canvas_x * room_width / canvas.width;
	}
	p.toRoomY = function(canvas_y) {
		return room_height - canvas_y * room_height / canvas.height;
	}
	
	
	p.manualQuakeX = -1;
	p.manualQuakeY = -1;
	
	p.setup = function() {
		p.size(canvas.width, canvas.height);
	}
	
	p.draw = function() {
		p.background(255);
		p.drawSeismographs();
		p.drawMouseQuake();
		p.drawQuakes();
	}
	
	p.drawSeismographs = function() {
		p.rectMode(p.CENTER);
		p.noFill();
		p.stroke(0);
		seismographs.forEach(function(e){
			switch(e.wall) {
			    case 1:
			        p.rect(p.toCanvasX(e.y), p.toCanvasY(e.x), 10, 30);
			        break;
			    case 2:
			        p.rect(p.toCanvasX(e.x), p.toCanvasY(e.y), 30, 10);
			        break;
				  case 3:
				        p.rect(canvas.width-p.toCanvasX(e.y), canvas.height-p.toCanvasY(e.x), 10, 30)
				        break;
				  case 4:
				        p.rect(canvas.width-p.toCanvasX(e.x), canvas.height-p.toCanvasY(e.y), 30, 10)
				        break;
			    default:
			        break;
			}
		});
		// Labels
		p.fill(0);
		p.textAlign(p.CENTER, p.CENTER);
		seismographs.forEach(function(e){
			switch(e.wall) {
			    case 1:
							p.text(e.id, p.toCanvasX(e.y), p.toCanvasY(e.x));
			        break;
			    case 2:
							p.text(e.id, p.toCanvasX(e.x), p.toCanvasY(e.y));
			        break;
				  case 3:
							p.text(e.id, canvas.width-p.toCanvasX(e.y), canvas.height-p.toCanvasY(e.x));
				      break;
				  case 4:
							p.text(e.id, canvas.width-p.toCanvasX(e.x), canvas.height-p.toCanvasY(e.y));
				      break;
			    default:
			        break;
			}
		});
	}
	
	p.drawMouseQuake = function() {
		if ($("#modeSelect").prop("checked") && p.manualQuakeX >=0) {
			p.fill(0);
			p.stroke(0);
			p.ellipse(p.manualQuakeX, p.manualQuakeY, 10, 10);
		}
	}
	
	p.drawQuakes = function() {
		p.stroke(255, 0, 0);
		p.noFill();
		if ($("#modeSelect").prop("checked")) {
			// Demo
			demo_quakes.forEach(function(el, i, quakes) {
				p.ellipse(p.toCanvasX(el.location.x), p.toCanvasY(el.location.y), 10, 10);
			});
		} else {
			// Live
			live_quakes.forEach(function(el, i, quakes) {
				p.ellipse(p.toCanvasX(el.location.x), p.toCanvasY(el.location.y), 10, 10);
			});
		}
		
	}
	
	p.mousePressed = function() { 
		p.manualQuakeX = p.mouseX;
		p.manualQuakeY = p.mouseY;
		p.manualQuakeXroom = p.toRoomX(p.mouseX);
		p.manualQuakeYroom = p.toRoomY(p.mouseY);
		$("#quake").removeClass("disabled");
		$("#cancel").removeClass("disabled");
		$("#cancel").prop("disabled",false);
		$("#quake").prop("disabled",false);
		$("#magnitude").removeAttr("disabled");
	}
}



// SMALLER CANVAS FOR CONFIGURATION




function SeismographsMap(pp) {
	// Utility functions
	pp.toCanvasX = function(room_x) {
		return room_x * room_canvas.width / room_width
	}
	pp.toCanvasY = function(room_y) {
		return room_canvas.height - room_y * room_canvas.height / room_height
	}
	
	
	pp.setup = function() {
		pp.size(room_canvas.width, room_canvas.height);
	}
	
	pp.draw = function() {
		pp.background(255);
		pp.drawSeismographs();
	}
	
	pp.drawSeismographs = function() {
		pp.rectMode(pp.CENTER);
		pp.noFill();
		pp.stroke(0);
		seismographs.forEach(function(e) {
			if (valid(e.x) && valid(e.y)) {
				switch(e.wall) {
				    case 1:
				        pp.rect(pp.toCanvasX(e.y), pp.toCanvasY(e.x), 10, 30);
				        break;
				    case 2:
				        pp.rect(pp.toCanvasX(e.x), pp.toCanvasY(e.y), 30, 10);
				        break;
					  case 3:
					      pp.rect(room_canvas.width-pp.toCanvasX(e.y), room_canvas.height-pp.toCanvasY(e.x), 10, 30)
					      break;
					  case 4:
					      pp.rect(room_canvas.width-pp.toCanvasX(e.x), room_canvas.height-pp.toCanvasY(e.y), 30, 10)
					      break;
				    default:
				        break;
				}
			}
		});
		// Labels
		pp.fill(0);
		pp.textAlign(pp.CENTER, pp.CENTER);
		seismographs.forEach(function(e) {
			if (valid(e.x) && valid(e.y)) {
				switch(e.wall) {
				    case 1:
								pp.text(e.id, pp.toCanvasX(e.y), pp.toCanvasY(e.x));
				        break;
				    case 2:
								pp.text(e.id, pp.toCanvasX(e.x), pp.toCanvasY(e.y));
				        break;
					  case 3:
								pp.text(e.id, room_canvas.width-pp.toCanvasX(e.y), room_canvas.height-pp.toCanvasY(e.x));
					      break;
					  case 4:
								pp.text(e.id, room_canvas.width-pp.toCanvasX(e.x), room_canvas.height-pp.toCanvasY(e.y));
					      break;
				    default:
				        break;
				}
			}
		});
	}
}