require('../app');
var dao = require('../locations/dao/location.dao');
var fs = require('fs');
var async = require('async');

var loader = {

    log: $$.g.getLogger("loader"),

    loadFromFile: function(fn) {
        fs.readFile('./helms-locations.json', 'utf8', function (err, data) {
            if (err) throw err; // we'll not consider error handling for now
            var obj = JSON.parse(data);
            async.eachSeries(obj.response, function(o, cb){
                //remove fields we don't care about.
                delete o.sl_pages_url;
                delete o.distance;
                delete o.id;
                delete o.linked_postid;
                delete o.data;
                o.loc = {type:'Point', coordinates:[parseFloat(o.lng), parseFloat(o.lat)]};
                o.accountId = 1789;
                //create Location
                var location = new $$.m.Location(o);

                //save it
                dao.saveOrUpdate(location, cb);
            }, function(err){
                if(err) {
                    console.log('error:', err);
                }
                fn();
            });

        });
    }

};

module.exports = loader;