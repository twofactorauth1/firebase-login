var mongoConfig = require('../configs/mongodb.config');

var _ = require('underscore');
var mongoskin = require('mongoskin');
var mongodb = mongoskin.db(mongoConfig.MONGODB_CONNECT, {safe: true});


//var db = require('monk')(mongoConfig.MONGODB_CONNECT);
var generator = {

    buildHostEntriesFromDB: function(cb) {
        console.log('>> buildHostEntriesFromDB');
        var hostEntries = [];

        //var accounts = db.get('accounts');

        var accounts = mongodb.collection('accounts');
        //db.bind('accounts');
        accounts.find().toArray(function(err, items){
            if(err) {
                console.log('error: ' + err);
            } else {
                console.log('no error.');
                _.each(items, function(item){
                    if(item.subdomain && item.subdomain !== '') {
                        hostEntries.push('127.0.0.1     ' + item.subdomain + '.indigenous.local');
                    }
                });
                console.log('Copy the following into your hosts file:');
                console.log('');
                console.log('###');
                console.log('# Host file entries for Indigenous');
                console.log('###');
                _.each(hostEntries, function(entry){
                    console.log(entry);
                });
                //console.dir(hostEntries);
                console.log('###');
                console.log('');
                console.log('<< buildHostEntriesFromDB');
                cb();
                mongodb.close();
            }

        });

    }




}

module.exports = generator;