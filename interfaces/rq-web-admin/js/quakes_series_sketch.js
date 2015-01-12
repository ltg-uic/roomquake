function valid(v) {
	return v!=undefined && v!="" && v!=null;
}


function ScheduledQuakesMap(p) {	
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
		p.manualQuakeX = -100;
		p.manualQuakeY = -100;
		p.frameRate(10);
	}
	
	p.draw = function() {
		p.background(255);
		p.drawSeismographs();
		p.drawScheduledQuakes();
		p.drawHighlightedQuake();
	}
	
	// Draw functions
	
	p.drawSeismographs = function() {
		if (!valid(seismographs))
			return;
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
	
	p.drawScheduledQuakes = function() {
		if (!valid(quakes))
			return;
		p.stroke(255, 0, 0);
		p.noFill();
		quakes.forEach(function(el) {
			p.ellipse(p.toCanvasX(el.location.x), p.toCanvasY(el.location.y), 10, 10);
		});
	}
	
	p.drawHighlightedQuake = function() {
		if (p.highlight===undefined)
			return;
		var hltd = quakes[p.highlight];
		// Filled dot
		p.stroke(255, 0, 0);
		p.fill(255, 0, 0);
		p.ellipse(p.toCanvasX(hltd.location.x), p.toCanvasY(hltd.location.y), 10, 10);
		// Coordinates
		p.stroke(0);
		p.fill(0);
		p.textAlign(p.CENTER, p.CENTER);
		p.text('(' + Number((hltd.location.x).toFixed(2)) + ', ' + Number((hltd.location.y).toFixed(2)) + ')', p.toCanvasX(hltd.location.x), p.toCanvasY(hltd.location.y) - 15);
	}
		
}