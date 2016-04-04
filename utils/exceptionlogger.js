
var mongoConfig = require('../configs/mongodb.config');
var mongoskin = require('mongoskin');
var mongodb = mongoskin.db(mongoConfig.MONGODB_CONNECT, {safe: true});
var ERROR_COLLECTION_NAME = 'errors';
var collection = mongodb.collection(ERROR_COLLECTION_NAME);


var exceptionlogger = {

    logIt: function(err, cb) {
        if(err.logged) {
            cb();
        } else {

            console.dir(err.message);
            var obj = {
                date: new Date(),
                stack: err.stack
            };
            if(err.message) {
                obj.msg = err.message;
            }

            collection.save(obj, function(_err, result){
                cb();
            });
        }
    }

};
module.exports = exceptionlogger;