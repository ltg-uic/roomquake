
var NUTELLA = require('nutella_lib');

// Get configuration parameters and init nutella
var cliArgs = NUTELLA.parseArgs();
var componentId = NUTELLA.parseComponentId();
var nutella = NUTELLA.init(cliArgs.broker, cliArgs.app_id, cliArgs.run_id, componentId);
// Optionally you can set the resource Id
//nutella.setResourceId('my_resource_id');

var readings = nutella.persist.getJsonObjectStore('readings');
readings.load();
if (!readings.hasOwnProperty('data')){
    readings = {data:[]};
    readings.save();
}


console.log ('Completed initialization. Read readings');
console.log ('Listening for requests');

// all files loaded

// open request handlers

// these are used primarily by the distribution editor



nutella.net.handle_requests('get_readings', function (message, from){
    return (readings.data);
});


//  nutella bug? workaround: must redefine and reload json objects prior to saving them
//  

nutella.net.subscribe('set_readings', function (message, from){
    readings.data = message;
    readings.save();
    // portals = nutella.persist.getJsonObjectStore('portals');
    // portals.load();
    // portals = message.portals;
    // portals.save();
    // instances = nutella.persist.getJsonObjectStore('instances');
    // instances.load();
    // instances = message.instances;
    // instances.save();
    // nutella.net.publish('portals_set',portals);
    // nutella.net.publish('portals_set',message);
});

nutella.net.subscribe('reading', function (message, from){
    readings.data.push(message);
    readings.save();
});






