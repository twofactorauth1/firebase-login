_ = require('underscore');
var mongoConfig = require('../configs/mongodb.config');
var mongo = require('mongoskin');
var mongodb = mongo.db(mongoConfig.MONGODB_CONNECT, {w:1});

var baseDao = function() {

};

_.extend(baseDao.prototype, {

    name: "",
    collection: "",
    mongodb: mongodb,
    model: null,

    init: function() {
        this._log = $$.g.getLogger("base.dao");
        this.log = $$.g.getLogger(this.name || "base.dao");

        //ensure we have our ID counters set up for this collection
        if (this.storage == "mongo" || (this.model && this.model.db.storage == "mongo")) {
            this._ensureCounters();
        }

        return this;
    },


    //region PUBLIC
    saveOrUpdate: function(model, fn) {
        if (model.storage() == "mongo") {
            this._saveOrUpdateMongo(model, fn);
        }
    },

    _saveOrUpdateMongo: function(model, fn) {
        var self = this;
        if (model.id() == null) {
            this._getNextSequence(model.table, function(err, value) {
                if (!err) {
                    model.id(value);
                    self.save(model, fn);
                } else {
                    fn(err, value);
                }
            });
            return;
        }

        var self = this;
        this.db(model.table).save(model.props(), function(err, result) {
            if (!err) {
                model.set(result[0]);
                fn(null, model);
            } else {
                fn(err, result);
            }
        });
    },


    getById: function(id, type, fn) {
        if (type.db.storage == "mongo") {
            this._getByIdMongo(id, fn);
        }
    },


    _getByIdMongo: function(id, type, fn) {
        var self = this;
        this.db(type.db.table).findById(id, function(err, result) {
            if (!err) {
                fn(err, new self.model(result));
            } else {
                fn(err, result);
            }
        });
    },


    _getNextSequence: function(collection, fn) {
        var self = this;

        if (_.isFunction(collection)) {
            fn = collection;
            collection = null;
        }

        collection = collection || this.collection;

        if (this._isLocked(collection)) {
            (function(collection, fn) {
                self._registerUnlock(collection, function() {
                    self._getNextSequence(collection, fn);
                });
            })(collection, fn);
            return;
        }

        this.db(collection).findAndModify(
            { _id: "counter" },
            [],
            { $inc: { seq:1 } },
            { new: true, upsert: true },
            function(err, value) {
                if (!err && value != null && value.hasOwnProperty('seq')) {
                    fn(null, value.seq);
                } else {
                    fn(err, value);
                }
            }
        );
    },
    //endregion PUBLIC

    //region PROTECTED
    db: function(collection) {
        return this.mongodb.collection(collection || this.collection);
    },
    //endregion PROTECTED

    //region PRIVATE
    _lockCollection: function(collection) {
        this.locked = this.locked || {};
        collection = collection || this.collection;
        this.locked[collection] = true;
    },


    _unlockCollection: function(collection) {
        collection = collection || this.collection;
        this._notifyUnlock(collection);
        delete this.locked[collection];
    },


    _isLocked: function(collection) {
        collection = collection || this.collection;
        if (this.locked && this.locked[collection] === true) {
            return true;
        }
        return false;
    },


    _registerUnlock: function(collection, fn) {
        this.unlockRegister = this.unlockRegister || {};
        this.unlockRegister[collection] = this.unlockRegister[collection] || [];
        this.unlockRegister[collection].push(fn);
    },


    _notifyUnlock: function(collection) {
        if (this.unlockRegister && this.unlockRegister[collection] != null) {
            var callbacks = this.unlockRegister[collection];
            for(var i = 0; i < callbacks.length; i++) {
                callbacks[i]();
            }
            delete this.unlockRegister[collection];
        }
    },


    _ensureCounters: function(collection, fn) {
        var self = this;

        if (_.isFunction(collection)) {
            fn = collection;
            collection = null;
        }

        collection = collection || this.collection;

        this._lockCollection(collection);

        this.db(collection).findAndModify(
            { _id: "counter" },
            [],
            { $inc: { seq:0 } },
            { new: true, upsert: true },
            function(err, value) {
                self._unlockCollection(collection)
                if (fn != null) {
                    fn(err, value);
                }
            }
        );
    }
    //endregion PRIVATE
});

$$.dao = $$.dao || {};
$$.dao.BaseDao = baseDao;

module.exports.BaseDao = baseDao;