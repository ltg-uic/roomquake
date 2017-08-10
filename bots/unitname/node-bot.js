
var NUTELLA = require('nutella_lib');

// Get configuration parameters and init nutella
var cliArgs = NUTELLA.parseArgs();
var componentId = NUTELLA.parseComponentId();
var nutella = NUTELLA.init(cliArgs.broker, cliArgs.app_id, cliArgs.run_id, componentId);
// Optionally you can set the resource Id
//nutella.setResourceId('my_resource_id');


var unitname = nutella.persist.getMongoObjectStore('unitname');
unitname.load(function(){ 

    if (unitname.name == undefined){
        unitname.name = "";
        unitname.save();
    }

    nutella.net.handle_requests('get_unitname', function (message, from){
        console.log('request: get_unitname        ' + message);
        return (unitname.name);
    });

    nutella.net.subscribe('set_unitname', function (message, from){
        console.log('request: set_unitname        ' + message);
        unitname.name = message;
        unitname.save();
        nutella.net.publish('unitname_set',message);
    });
});
