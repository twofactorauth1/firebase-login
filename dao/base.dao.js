var mongoBaseDao = require('./base.dao.mongo');
var utils = requirejs("utils/commonutils");

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
        if ((model.id() == null || model.id() == 0)) {
            var strategy = this.getIdStrategy(model);
            switch(strategy) {
                case "uuid":
                    model.id($$.u.idutils.generateUUID());
                    break;
                default: //increment
                    break;
            }
        }

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


    exists: function(query, type, fn) {
        if (this.getStorage(type) === "mongo") {
            this._existsMongo(query, type, fn);
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


    findMany: function(query, type, fn) {
        if (this.getStorage(type) === "mongo") {
            this._findManyMongo(query, type, fn);
        } else {
            fn("No storage medium available for this model type");
        }
    },


    findManyWithFields: function(query, fields, type, fn) {
        if (this.getStorage(type) === "mongo") {
            this._findManyWithFieldsMongo(query, fields, type, fn);
        } else {
            fn("No storage medium available for this model type");
        }
    },


    getStorage: function(type) {
        if (type != null && type.hasOwnProperty != null) {
            if (type.hasOwnProperty("db")) {
                return type.db.storage;
            } else if(_.isFunction(type.db)) {
                return type.storage();
            }
        }
        return this.defaultModel.db.storage;
    },


    getTable: function(type) {
        if (type != null && type.hasOwnProperty != null) {
            if (type.hasOwnProperty("db")) {
                return type.db.table;
            } else if(_.isFunction(type.table)) {
                return type.table();
            }
        }
        return this.defaultModel.db.table;
    },


    getIdStrategy: function(type) {
        if (type != null && type.hasOwnProperty != null) {
            if (type.hasOwnProperty("db")) {
                return type.db.idStrategy || "increment";
            } else if(_.isFunction(type.idStrategy)) {
                return type.idStrategy();
            }
        }
        return this.defaultModel.db.idStrategy || "incrememnt";
    },


    _isAuthenticationError: function(obj, fn) {
        if (_.isObject(obj)) {
            if (obj.error != null && obj.error.code != null && obj.error.code == 401) {
                return fn($$.u.errors._401_INVALID_CREDENTIALS, "Invalid Credentials");
            }
        } else if(_.isString(obj) && obj.charAt(0) == "<") {
            if (obj.indexOf("401") > -1) {
                var error = _.clone($$.u.errors._401_INVALID_CREDENTIALS);
                error.raw = obj;
                return fn(error, "Invalid Credentials");
            }
        }
        return fn(null, obj);
    }
});


$$.dao = $$.dao || {};
$$.dao.BaseDao = baseDao;

module.exports = baseDao;