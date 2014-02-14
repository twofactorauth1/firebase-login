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
        this._ensureCounters();

        return this;
    },


    //region PUBLIC
    saveOrUpdate: function(model, fn) {
        var self = this;
        if (model.id() == null) {
            this.getNextSequence(function(err, value) {
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
        this.db().save(model.props(), function(err, result) {
            if (!err) {
                model.set(result[0]);
                fn(null, model);
            } else {
                fn(err, result);
            }
        });
    },


    getById: function(id, fn) {
        var self = this;
        this.db().findById(id, function(err, result) {
            if (!err) {
                fn(err, new self.model(result));
            } else {
                fn(err, result);
            }
        });
    },


    getNextSequence: function(collection, fn) {
        var self = this;

        if (_.isFunction(collection)) {
            fn = collection;
            collection = null;
        }

        collection = collection || this.collection;

        if (this._isLocked(collection)) {
            (function(collection, fn) {
                self._registerUnlock(collection, function() {
                    self.getNextSequence(collection, fn);
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