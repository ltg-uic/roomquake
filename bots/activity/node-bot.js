
var NUTELLA = require('nutella_lib');

// Get configuration parameters and init nutella
var cliArgs = NUTELLA.parseArgs();
var componentId = NUTELLA.parseComponentId();
var nutella = NUTELLA.init(cliArgs.broker, cliArgs.app_id, cliArgs.run_id, componentId);
// Optionally you can set the resource Id
// nutella.setResourceId('my_resource_id');


var activity = nutella.persist.getMongoObjectStore('activity');
activity.load(function(){ 

    if (activity.ID == undefined){
        activity.ID = 1;
        activity.save();
    }

    nutella.net.handle_requests('get_activity', function (message, from){
        console.log('request: get_activity        ' + message);
        return (activity.ID);
    });

    nutella.net.subscribe('set_activity', function (message, from){
        console.log('request: set_activity        ' + message);
        activity.ID = message;
        activity.save();
        nutella.net.publish('activity_set',{activity:message});
    });
});
