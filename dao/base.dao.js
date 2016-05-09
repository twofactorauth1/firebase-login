/**
 * COPYRIGHT INDIGENOUS SOFTWARE, INC., LLC 2014
 *
 * All use or reproduction of any or all of this content must be approved.
 * Please contact info@indigenous.io for approval or questions.
 */

var mongoBaseDao = require('./base.dao.mongo');
var utils = requirejs("utils/commonutils");

var baseDao = function () {

};

_.extend(baseDao.prototype, mongoBaseDao, {

    name: "",
    model: null,

    init: function () {
        this._log = $$.g.getLogger("base.dao");
        this.log = $$.g.getLogger(this.name || "base.dao");

        this.initMongo();

        return this;
    },

    addToCollection: function(model, collection, fn) {
        if ((model.id() === null || model.id() === 0 || model.id() == "")) {
            var strategy = this.getIdStrategy(model);
            switch (strategy) {
                case "uuid":
                    model.id($$.u.idutils.generateUUID());
                    break;
                default: //increment
                    break;
            }
        }

        var useCache = this.useCache(model);
        var key;
        if (useCache) {
            key = this.getTable(model) + "_" + model.id();
            $$.g.cache.remove(key);
        }

        if (this.getStorage(model) === "mongo") {
            this._addToCollectionMongo(model, collection, function(err, value) {
                if (useCache && !err && value != null) {
                    $$.g.cache.set(key, value);
                }

                fn(err, value);
                fn = model = null;
            });
        } else {
            if (fn != null) {
                fn("No storage medium available for this model");
            }

            fn = model = null;
        }

    },


    saveOrUpdate: function (model, fn) {
        if ((model.id() === null || model.id() === 0 || model.id() == "")) {
            var strategy = this.getIdStrategy(model);
            switch (strategy) {
                case "uuid":
                    model.id($$.u.idutils.generateUUID());
                    break;
                default: //increment
                    break;
            }
        }

        var useCache = this.useCache(model);
        var key;
        if (useCache) {
            key = this.getTable(model) + "_" + model.id();
            $$.g.cache.remove(key);
        }

        if (this.getStorage(model) === "mongo") {
            this._saveOrUpdateMongo(model, function(err, value) {
                if (useCache && !err && value != null) {
                    $$.g.cache.set(key, value);
                }

                fn(err, value);
                fn = model = null;
            });
        } else {
            if (fn != null) {
                fn("No storage medium available for this model");
            }

            fn = model = null;
        }
    },


    remove: function (model, fn) {
        if (model.id() === null || model.id() === 0 || model.id() == "") {
            return fn(null, null);
        }

        if (this.useCache(model)) {
            var key = this.getTable(model) + "_" + model.id();
            $$.g.cache.remove(key);
        }

        if (this.getStorage(model) === "mongo") {
            this._removeMongo(model, fn);
        } else {
            if (fn != null) {
                fn("NO storage medium avaialble for this model");
            }
        }
    },


    removeById: function (id, type, fn) {
        if (this.useCache(type)) {
            var key = this.getTable(type) + "_" + id;
            $$.g.cache.remove(key);
        }

        if (this.getStorage(type) === "mongo") {
            this._removeByIdMongo(id, type, fn);
        } else {
            fn("No storage medium available for this model");
        }
    },

    removeByQuery: function (query, type, fn) {
        if (this.useCache(type)) {
            //var key = this.getTable(type) + "_" + id;
            //$$.g.cache.remove(key);
        }

        if (this.getStorage(type) === "mongo") {
            this._removeByQueryMongo(query, type, fn);
        } else {
            fn("No storage medium available for this model");
        }
    },

    getById: function (id, type, fn) {
        if (_.isFunction(type) && fn == null) {
            fn = type;
            type = null;
        }
        var self = this;
        var useCache = this.useCache(type);
        if (useCache) {
            var key = this.getTable(type) + "_" + id;
            $$.g.cache.get(key, null, null, null, function(err, value) {
                if (!err && value != null) {
                    //console.log("FOUND IN CACHE: " + key);
                    fn(null, value);

                    fn = type = id = null;
                    return;
                }
                self._getById(id, type, useCache, fn);
                fn = type = id = null;
            });
        } else {
            this._getById(id, type, false, fn);
            fn = type = id = null;
        }
    },


    _getById: function(id, type, useCache, fn) {
        var self = this;
        if (self.getStorage(type) === "mongo") {
            self._getByIdMongo(id, type, function(err, value) {
                if (err) {
                    fn(err, value);
                    fn = type = id = null;
                    return;
                }

                if (useCache && value != null) {
                    var key = self.getTable(type) + "_" + id;
                    $$.g.cache.set(key, value);
                }

                fn(null, value);
                fn = type = id = null;
            });
        } else {
            fn("No storage medium available for this model");
            fn = type = id = null;
        }
    },


    exists: function (query, type, fn) {
        if (this.getStorage(type) === "mongo") {
            this._existsMongo(query, type, fn);
        } else {
            fn("No storage medium available for this model");
        }
    },


    findOne: function (query, type, fn) {
        if (this.getStorage(type) === "mongo") {
            this._findOneMongo(query, type, fn);
        } else {
            fn("No storage medium available for this model");
        }
    },

    findCount: function (query, type, fn) {
        if (this.getStorage(type) === "mongo") {
            this._findCountMongo(query, type, fn);
        } else {
            fn("No storage medium available for this model");
        }
    },

    findNear: function(query, field, lat, lng, mindistance, maxdistance, type, fn) {
        if (this.getStorage(type) === "mongo") {
            this._findNearMongo(query, field, lat, lng, null, maxdistance, type, fn);
        } else {
            fn("No storage medium available for this model");
        }
    },


    findMany: function (query, type, fn) {
        if (this.getStorage(type) === "mongo") {
            this._findManyMongo(query, type, fn);
        } else {
            fn("No storage medium available for this model type");
        }
    },

    findManyWithLimit: function(query, limit, type, fn) {
        if (this.getStorage(type) === "mongo") {
            this._findManyWithLimitMongo(query, limit, type, fn);
        } else {
            fn("No storage medium available for this model type");
        }
    },


    findManyWithFields: function (query, fields, type, fn) {
        if (this.getStorage(type) === "mongo") {
            this._findManyWithFieldsMongo(query, fields, type, fn);
        } else {
            fn("No storage medium available for this model type");
        }
    },

    findAllWithFields: function (query, skip,sort,fields, type, fn) {
        if (this.getStorage(type) === "mongo") {
            this._findAllWithFieldsMongo(query, parseInt(skip), sort,fields, type, fn);
        } else {
            fn("No storage medium available for this model type");
        }
    },

    findAllWithFieldsAndLimit: function(query, skip, limit, sort, fields, type, fn) {
        if(this.getStorage(type) === 'mongo') {
            this._findAllWithFieldsAndLimitMongo(query, skip, limit, sort, fields, type, fn);
        } else {
            fn("No storage medium available for this model type");
        }
    },

    findAllWithFieldsSortAndLimit: function(query, skip, limit, sort, fields, type, fn) {
        if(this.getStorage(type) === 'mongo') {
            this._findAllWithFieldsSortAndLimitMongo(query, skip, limit, sort, fields, type, fn);
        } else {
            fn("No storage medium available for this model type");
        }
    },

    findWithFieldsLimitAndTotal:function(query, skip, limit, sort, fields, type, fn) {
        if(this.getStorage(type) === 'mongo') {
            this._findWithFieldsLimitAndTotalMongo(query, skip, limit, sort, fields, type, fn);
        } else {
            fn("No storage medium available for this model type");
        }
    },

    findWithFieldsLimitOrderAndTotal:function(query, skip, limit, sort, fields, type, order_dir, fn) {
        if(this.getStorage(type) === 'mongo') {
            this._findWithFieldsLimitOrderAndTotalMongo(query, skip, limit, sort, fields, type, order_dir, fn);
        } else {
            fn("No storage medium available for this model type");
        }
    },

    findAndOrder: function(query, fields, type, order_by, order_dir, fn) {
        if(this.getStorage(type) === 'mongo') {
            this._findAndOrderMongo(query, fields, type, order_by, order_dir, fn);
        } else {
            fn("No storage medium available for this model type");
        }
    },

    aggregate: function(groupCriteria, matchCriteria, type,  fn) {
        if(this.getStorage(type) === 'mongo') {
            this._aggregateMongo(groupCriteria, matchCriteria, type, fn);
        } else {
            fn("No storage medium available for this model type");
        }
    },

    aggregateWithSum: function(groupCriteria, matchCriteria, type, fn) {
        if(this.getStorage(type) === 'mongo') {
            this._aggregateMongoWithSum(groupCriteria, matchCriteria, type, fn);
        } else {
            fn("No storage medium available for this model type");
        }
    },

    aggregrateWithSumAndDupes: function(groupCriteria, matchCriteria, type, fn) {
        if(this.getStorage(type) === 'mongo') {
            this._aggregateMongoWithSumAndDupes(groupCriteria, matchCriteria, type, fn);
        } else {
            fn("No storage medium available for this model type");
        }
    },

    aggregateWithCustomStages: function(stageAry, type, fn) {
        if(this.getStorage(type) === 'mongo') {
            this._aggregateMongoWithCustomStages(stageAry, type, fn);
        }  else {
            fn("No storage medium available for this model type");
        }
    },

    getMaxValue: function(query, fieldName, type, fn) {
      if(this.getStorage(type) === 'mongo') {
          this._getMaxValueMongo(query, fieldName, type, fn);
      } else {
          fn("No storage medium available for this model type");
      }
    },

    getNextValue: function(query, fieldName, mod, type, fn) {
        if(this.getStorage(type) === 'mongo') {
            //TODO: handle decrement
            var params = {
                'query': query,
                'update': { $inc: { seq: mod } },
                'new': true,
                'upsert':true
            };
            this._findAndModify(params, fieldName, type, fn);
        } else {
            fn("No storage medium available for this model type");
        }
    },


    getStorage: function (type) {
        if (type != null && type.hasOwnProperty != null) {
            if (type.hasOwnProperty("db")) {
                return type.db.storage;
            } else if(type.constructor.db != null) {
                return type.constructor.db.storage;
            } else if (_.isFunction(type.db)) {
                return type.storage();
            }
        }
        return this.defaultModel.db.storage;
    },


    getTable: function (type) {
        var table;
        if (type != null && type.hasOwnProperty != null) {
            if (type.hasOwnProperty("db")) {
                table = type.db.table;
            } else if(type.constructor.db != null) {
                table = type.constructor.db.table;
            }
            else if (_.isFunction(type.table)) {
                table = type.table();
            }
        }
        table = table || this.defaultModel.db.table;

        if (process.env.NODE_ENV == "testing") {
            table = table + "_testing";
        }
        return table;
    },


    getIdStrategy: function (type) {
        if (type != null && type.hasOwnProperty != null) {
            if (type.hasOwnProperty("db")) {
                return type.db.idStrategy || "increment";
            } else if(type.constructor.db != null) {
                return type.constructor.db.idStrategy || "increment";
            } else if (_.isFunction(type.idStrategy)) {
                return type.idStrategy();
            }
        }
        return this.defaultModel.db.idStrategy || "incrememnt";
    },


    useCache: function (type) {
        if (type != null && type.hasOwnProperty != null) {
            if (type.hasOwnProperty("db")) {
                return type.db.cache || false;
            } else if(type.constructor.db != null) {
                return type.constructor.db.cache || false;
            }
        }
        return this.defaultModel.db.cache || false;
    },

    batchUpdate: function(list, type, fn) {
        if(this.getStorage(type) === 'mongo') {
            this._batchUpdateMongo(list, type, fn);
        } else {
            fn("No storage medium available for this model type");
        }
    },

    distinct: function(key, query, type, fn) {
        if(this.getStorage(type) === 'mongo') {
            this._distinctMongo(key, query, type, fn);
        } else {
            fn("No storage medium available for this model type");
        }
    },


    _isAuthenticationError: function (obj, fn) {
        var error;

        if (_.isString(obj) && obj.charAt(0) == "<") {
            if (obj.indexOf("401") > -1) {
                error = _.clone($$.u.errors._401_INVALID_CREDENTIALS);
                error.raw = obj;
                return fn(error, "Invalid Credentials");
            }
        } else if (_.isString(obj)) {
            try {
                obj = JSON.parse(obj);
            } catch (exception) {
            }
        }

        if (obj != null && _.isObject(obj)) {
            var error;
            if (_.isObject(obj.error)) {
                obj = obj.error;
            }
            if (obj.code != null && obj.code == 401) {
                return fn($$.u.errors._401_INVALID_CREDENTIALS, "Invalid Credentials");
            }

            if (obj.type == "OAuthException" || obj.code == 401 || obj.code == "401" || obj.code == 190 || obj.code == "190") {
                error = _.clone($$.u.errors._401_INVALID_CREDENTIALS);
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
