var mongoConfig = require('../configs/mongodb.config');
var mongo = require('mongoskin');
var mongodb = mongo.db(mongoConfig.MONGODB_CONNECT, {w:1});

var mongodao = {

}