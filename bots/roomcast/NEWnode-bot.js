
var NUTELLA = require('nutella_lib');

// Get configuration parameters and init nutella
var cliArgs = NUTELLA.parseArgs();
var componentId = NUTELLA.parseComponentId();
var nutella = NUTELLA.init(cliArgs.broker, cliArgs.app_id, cliArgs.run_id, componentId);
// Optionally you can set the resource Id
//nutella.setResourceId('my_resource_id');

var portals = nutella.persist.getJsonObjectStore('portals');
portals.load();
if (isEmpty(portals)){
    portals = {topID: 1, portalList: [{ID:1,name:"designer"}]};
    portals.save();
};

var instances = nutella.persist.getJsonObjectStore('instances');
if (isEmpty(instances)){
    instances = {data:[{portalID:1,topID:1,instanceList:[{ID:1,name:'designer'}]}]};
    instances.save();
};

var activities = nutella.persist.getJsonObjectStore('activities');
activities.load();
if (isEmpty(activities)){
    activities = {topID: 1, activityList: [{ID:1,name:"planning"}]};
    activities.save();
};

var resources = nutella.persist.getJsonObjectStore('resources');
resources.load();
if (isEmpty(resources)){
    resources = {topID: 8, resourceList: [

        {ID:1,name:'portals',description:'portals',URL:'portals',query:''},
        {ID:2,name:'resources',description:'resources',URL:'resources',query:''},
        {ID:3,name:'activities',description:'activities',URL:'activities',query:''},
        {ID:4,name:'design',description:'design',URL:'design',query:''},
        {ID:5,name:'instances',description:'instances',URL:'instances',query:''},
        {ID:6,name:'unitname',description:'unitname',URL:'unitname',query:''},
        {ID:7,name:'portal',description:'portal',URL:'portal',query:''},
        {ID:8,name:'activity',description:'activity',URL:'activity',query:''}

    ]};
    resources.save();
};

var design = nutella.persist.getJsonObjectStore('design');
design.load();
if (isEmpty(design)){
    design = {data:[
        {portalID:1,activityID:1,resourceID:1},
        {portalID:1,activityID:1,resourceID:2},
        {portalID:1,activityID:1,resourceID:3},
        {portalID:1,activityID:1,resourceID:4},
        {portalID:1,activityID:1,resourceID:5},
        {portalID:1,activityID:1,resourceID:6},
        {portalID:1,activityID:1,resourceID:7},
        {portalID:1,activityID:1,resourceID:8},
    ]};
    design.save();
};

var activity = nutella.persist.getJsonObjectStore('activity');
activity.load();
if (isEmpty(activity)){
    activity = {ID:1,name:"planning"};
    activity.save();
};

var unitname = nutella.persist.getJsonObjectStore('unitname');
if (isEmpty(unitname)){
    unitname = {name:"unit"};
    unitname.save();
};



console.log ('Completed initialization. Read Portals, Activities, Resources, Design, Activity, and Unit name');
console.log ('Listening for requests');

// all files loaded

// open request handlers

// these are used primarily by the distribution editor



nutella.net.handle_requests('get_portals', function (message, from){
    return (portals);
});
nutella.net.handle_requests('get_instances', function (message, from){
    return (instances);
});
nutella.net.handle_requests('get_activities', function (message, from){
    return (activities);
});
nutella.net.handle_requests('get_resources', function (message, from){
    return (resources);
});
nutella.net.handle_requests('get_design', function (message, from){
    console.log('received design request');
    // console.log(design.length);
    // console.log(design.length);
    return (design);
});
nutella.net.handle_requests('get_activity', function (message, from){
    return (activity);
});
nutella.net.handle_requests('get_unitname', function (message, from){
    return (unitname);
});



nutella.net.subscribe('set_portals', function (message, from){
    portals = message;
    portals.save();
    // nutella.net.publish('portals_set',message);
});
nutella.net.subscribe('set_instances', function (message, from){
    instances = message;
    instances.save();
    // nutella.net.publish('portals_set',message);
});
nutella.net.subscribe('set_activities', function (message, from){
    activities = message;
    activities.save();
    // nutella.net.publish('activities_set',message);
});
nutella.net.subscribe('set_resources', function (message, from){
    resources = message;
    resources.save();
    // nutella.net.publish('resources_set',message);
});
nutella.net.subscribe('set_design', function (message, from){
    design = message;
    design.save();
    // nutella.net.publish('design_set',message);
});
nutella.net.subscribe('set_activity', function (message, from){
    activity = message;
    activity.save();
    // nutella.net.publish('activity_set',message);
});
nutella.net.subscribe('set_unitname', function (message, from){
    unitname = message;
    unitname.save();
    // nutella.net.publish('unitname_set',message);
});

function isEmpty(obj) {
    for(var key in obj) {
        if(obj.hasOwnProperty(key))
            return false;
    }
    return true;
}




                //nutella.net.request('selected_resources',{portalID: p,activityID: a}, function...)
                //returns an array of objects of the form: {printname, URL}
                // returns an empty array if no resources found for this portal and activity

                // nutella.net.handle_requests('selected_resources', function (message, from){ 
                //     if (message.activityID == -1 || message.portalID == -1) return ([{name: "portal", URL: "portal"}]);
                //     console.log('request: selected_resources ' + message.activityID + ' ' + message.portalID);
                //     var resourceList = []; console.log(resources.data);
                //     for (var i=0; i<resources.data.resourceList.length; i++){
                //         console.log (resources.data.resourceList[i].resourceID);
                //         console.log(distribution.data);
                //         var match = distribution.data.filter(function(arg){
                //                 return((resources.data.resourceList[i].resourceID == arg.resourceID)&&
                //                     (message.portalID == arg.portalID)&&
                //                     (message.activityID == arg.activityID));});

                //         if(match.length > 0) 
                //             resourceList.push({name: resources.data.resourceList[i].name, URL: resources.data.resourceList[i].URL});
                //     }
                //     console.log(resourceList);
                //     return(resourceList);
                    // return (distribution.data.filter(function(arg){ 
                    //         return ((arg.activityID == message.activityID) && (arg.portalID == message.portalID));
                    //     }).map(function(arg){ 
                    //         return arg.resourceID;
                    //     }).map(function(arg){
                    //         var target = resources.data.resourceList.filter(function(arg2){ return (arg2.resourceID == arg);})[0];
                    //         return {name: target.name, URL: target.URL};
                    //     })
                    // );
 


