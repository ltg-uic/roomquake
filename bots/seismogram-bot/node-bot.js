
var NUTELLA = require('nutella_lib');

// Get configuration parameters and init nutella
var cliArgs = NUTELLA.parseArgs();
var componentId = NUTELLA.parseComponentId();
var nutella = NUTELLA.init(cliArgs.broker, cliArgs.app_id, cliArgs.run_id, componentId);
// Optionally you can set the resource Id
//nutella.setResourceId('my_resource_id');

var seismogram = nutella.persist.getJsonObjectStore('seismogram');
seismogram.load();
if (!seismogram.hasOwnProperty('data')){
    seismogram = {data:{
        WINDOW:30, //number of seconds in seismograph window
        SAMPLING_RESOLUTION:1, //number of data points per second
        ADVANCE_WINDOW_THRESHOLD:0,
        P_WAVE_VELOCITY:1, //meters per second
        S_WAVE_VELOCITY:.57, //meters per second
        MAX_DISPLACEMENT:200,
        MAX_MAGNITUDE:5,
        S_TAIL:.2, // proportion of S wave waveform devoted to decay
        S_LENGTH_RATIO:2,
        NOISE: 5
    }}
    // seismogram.data.S_WAVE_VELOCITY = seismogram.data.P_WAVE_VELOCITY / 1.76;
    seismogram.save();
}


console.log ('Completed initialization. Read seismogram parameters.');
console.log ('Listening for requests');

// all files loaded

// open request handlers




nutella.net.handle_requests('get_seismogram', function (message, from){
    return (seismogram.data);
});


//  nutella bug? workaround: must redefine and reload json objects prior to saving them
//  

nutella.net.subscribe('set_seismogram', function (message, from){
    seismogram.data = message;
    seismogram.save();
    nutella.net.publish('changed_seismogram', seismogram.data);
});







