var mongoBaseDao = require('./base.dao.mongo');

var baseDao = function() {

};

_.extend(baseDao.prototype, mongoBaseDao, {

    name: "",
    model: null,

    init: function() {
        this._log = $$.g.getLogger("base.dao");
        this.log = $$.g.getLogger(this.name || "base.dao");

        this.initMongo();

        return this;
    },


    saveOrUpdate: function(model, fn) {
        if (this.getStorage(model) === "mongo") {
            this._saveOrUpdateMongo(model, fn);
        } else {
            if (fn != null) {
                fn("No storage medium available for this model");
            }
        }
    },


    getById: function(id, type, fn) {
        if (this.getStorage(type) === "mongo") {
            this._getByIdMongo(id, type, fn);
        } else {
            fn("No storage medium available for this model");
        }
    },


    findOne: function(query, type, fn) {
        if (this.getStorage(type) === "mongo") {
            this._findOneMongo(query, type, fn);
        } else {
            fn("No storage medium available for this model");
        }
    },


    getStorage: function(type) {
        if (type != null && type.hasOwnProperty != null) {
            if (type.hasOwnProperty("db")) {
                return type.db.storage;
            } else if(type.hasOwnProperty("storage")) {
                return type.storage();
            }
        }
        return this.defaultModel.db.storage;
    },


    getTable: function(type) {
        if (type != null && type.hasOwnProperty != null) {
            if (type.hasOwnProperty("db")) {
                return type.db.table;
            } else if(type.hasOwnProperty("table")) {
                return type.table();
            }
        }
        return this.defaultModel.db.table;
    }
});

$$.dao = $$.dao || {};
$$.dao.BaseDao = baseDao;

module.exports = baseDao;