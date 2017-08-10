
var NUTELLA = require('nutella_lib');

// Get configuration parameters and init nutella
var cliArgs = NUTELLA.parseArgs();
var componentId = NUTELLA.parseComponentId();
var nutella = NUTELLA.init(cliArgs.broker, cliArgs.app_id, cliArgs.run_id, componentId);
// Optionally you can set the resource Id
//nutella.setResourceId('my_resource_id');
console.log('got started');

var portals = nutella.persist.getMongoObjectStore('portals');
portals.load(function(){ 
    if (portals.data == undefined){
        portals.data = {topID: 3, portalList: [{portalID:1,name:"developer"}]};
        portals.save();
    }
    console.log ('portals loaded');
    console.log (portals.data);

    var activities = nutella.persist.getMongoObjectStore('activities');
    activities.load(function(){ 
        if (activities.data == undefined){
            activities.data = {topID: 1, activityList: [{activityID:1,name:"planning"}]};
            activities.save();
        }
        console.log ('activities loaded');
        console.log (activities.data);

        var resources = nutella.persist.getMongoObjectStore('resources2');
        resources.load(function(){ 
            if (resources.data == undefined){
                resources.data = {topID: 5, resourceList: [

                    {resourceID:1,name:'portal',description:'portal',URL:'portal',query:''},
                    {resourceID:2,name:'activity',description:'activity',URL:'activity',query:''},
                    {resourceID:3,name:'resources',description:'resources',URL:'resources',query:''},
                    {resourceID:4,name:'rosters',description:'rosters',URL:'rosters',query:''},
                    {resourceID:5,name:'designer',description:'designer',URL:'designer',query:''}

                ]};
                resources.save();
            }
            console.log('resources loaded');
            console.log (resources.data);

            var distribution = nutella.persist.getMongoObjectStore('distribution');
            distribution.load(function(){ 
                if (distribution.data == undefined){
                    distribution.data = [
                        {portalID:1,activityID:1,resourceID:1},
                        {portalID:1,activityID:1,resourceID:2},
                        {portalID:1,activityID:1,resourceID:3},
                        {portalID:1,activityID:1,resourceID:4},
                        {portalID:1,activityID:1,resourceID:5},
                    ];
                    distribution.save();
                }
                console.log('distribution loaded');
                console.log (distribution.data);
                console.log ('Completed initialization. Read Portals, Activities, Resources, and Distribution files');
                console.log ('Listening for requests');

// all files loaded

// open request handlers

// these are used primarily by the distribution editor



                nutella.net.handle_requests('get_portals', function (message, from){
                    console.log('request: get_portals        ' + message);
                    return (portals.data);
                });
                nutella.net.handle_requests('get_activities', function (message, from){
                    console.log('request: get_activities     ' + message);
                    return (activities.data);
                });
                nutella.net.handle_requests('get_resources', function (message, from){
                    console.log('request: get_resources      ' + message);
                    return (resources.data);
                });
                nutella.net.handle_requests('get_distribution', function (message, from){
                    console.log('request: get_distribution   ' + message);
                    return (distribution.data);
                });


                nutella.net.subscribe('set_portals', function (message, from){
                    console.log('request: set_portals        ' + message);
                    portals.data = message;
                    portals.save();
                    nutella.net.publish('portals_set',message);
                });
                nutella.net.subscribe('set_activities', function (message, from){
                    console.log('request: set_activities     ' + message);
                    activities.data = message;
                    activities.save();
                    nutella.net.publish('activities_set',message);
                });
                nutella.net.subscribe('set_resources', function (message, from){
                    console.log('request: set_resources      ' + message);
                    resources.data = message;
                    resources.save();
                    nutella.net.publish('resources_set',message);
                });
                nutella.net.subscribe('set_distribution', function (message, from){
                    console.log('request: set_distribution   ' + message.distribution);
                    distribution.data = message.distribution;
                    distribution.save();
                    nutella.net.publish('distribution_set',{portalID: message.portalID, activityID: message.activityID});
                });

                // this is used by the application website interface to implement roomcast. this is the heart of roomcast
                // activity + portal = resources

                    
                nutella.net.handle_requests('activity_name', function (arg, from){ 
                    var name = "";
                    console.log(arg);
                    console.log(activities.data.activityList);
                    for (var i=0; i<activities.data.activityList.length; i++) {
                        if (activities.data.activityList[i].activityID == arg) {
                            name = activities.data.activityList[i].name;
                            return name;
                        }
                    }
                    return name;
                });




                //nutella.net.request('selected_resources',{portalID: p,activityID: a}, function...)
                //returns an array of objects of the form: {printname, URL}
                // returns an empty array if no resources found for this portal and activity

                nutella.net.handle_requests('selected_resources', function (message, from){ 
                    if (message.activityID == -1 || message.portalID == -1) return ([{name: "portal", URL: "portal"}]);
                    console.log('request: selected_resources ' + message.activityID + ' ' + message.portalID);
                    var resourceList = []; console.log(resources.data);
                    for (var i=0; i<resources.data.resourceList.length; i++){
                        console.log (resources.data.resourceList[i].resourceID);
                        console.log(distribution.data);
                        var match = distribution.data.filter(function(arg){
                                return((resources.data.resourceList[i].resourceID == arg.resourceID)&&
                                    (message.portalID == arg.portalID)&&
                                    (message.activityID == arg.activityID));});

                        if(match.length > 0) 
                            resourceList.push({name: resources.data.resourceList[i].name, URL: resources.data.resourceList[i].URL});
                    }
                    console.log(resourceList);
                    return(resourceList);
                    // return (distribution.data.filter(function(arg){ 
                    //         return ((arg.activityID == message.activityID) && (arg.portalID == message.portalID));
                    //     }).map(function(arg){ 
                    //         return arg.resourceID;
                    //     }).map(function(arg){
                    //         var target = resources.data.resourceList.filter(function(arg2){ return (arg2.resourceID == arg);})[0];
                    //         return {name: target.name, URL: target.URL};
                    //     })
                    // );
 
                }); //end handle request
            }); //end distribution
        }); //end resources
    }); //end activities
}); //end portals

