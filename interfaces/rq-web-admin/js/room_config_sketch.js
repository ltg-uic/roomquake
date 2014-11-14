function valid(v) {
	return v!=undefined && v!="" && v!=null;
}


function SeismoMap(p) {	
	// Utility functions
	p.toCanvasX = function(r_x) {
		return r_x * p.externals.canvas.width / room_width;
	}
	p.toCanvasY = function(room_y) {
		return (room_height - room_y) * p.externals.canvas.height / room_height;
	}
	p.toRoomX = function(canvas_x) {
		return canvas_x * room_width / p.externals.canvas.width;
	}
	p.toRoomY = function(canvas_y) {
		return room_height - canvas_y * room_height / p.externals.canvas.height;
	}
	
	p.setup = function() {
		p.size(p.externals.canvas.width, p.externals.canvas.height);
	}
	
	p.draw = function() {
		p.background(255);
		p.drawSeismographs();
	}
	
	p.drawSeismographs = function() {
		if (!valid(seismographs)) {
			return;
		}
		// Shapes
		p.rectMode(p.CENTER);
		p.noFill();
		p.stroke(0);
		seismographs.forEach(function(e) {
			p.rect(p.toCanvasX(e.x), p.toCanvasY(e.y), 20, 20);
		});
		// Labels
		p.fill(0);
		p.textAlign(p.CENTER, p.CENTER);
		seismographs.forEach(function(e) {
			p.text('S'+e.id, p.toCanvasX(e.x), p.toCanvasY(e.y));
		});
	}
}