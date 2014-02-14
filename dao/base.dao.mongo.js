var mongoConfig = require('../configs/mongodb.config');
var mongoskin = require('mongoskin');
var mongodb = mongoskin.db(mongoConfig.MONGODB_CONNECT, {w:1});

var mongodao = {

    mongodatabase: mongodb,

    initMongo: function() {
        //ensure we have our ID counters set up for this collection
        if (this.getStorage() == "mongo") {
            this._ensureCounters();
        }
    },


    mongo: function(collection) {
        return this.mongodatabase.collection(collection || this.getTable());
    },


    //region PROTECTED
    _getByIdMongo: function(id, type, fn) {
        var self = this;

        if (fn == null) {
            fn = type;
            type = null;
        }

        var collection = this.getTable(type);
        this.mongo(collection).findById(id, function(err, result) {
            if (!err) {
                fn(err, new self.defaultModel(result));
            } else {
                fn(err, result);
            }
        });
    },


    _saveOrUpdateMongo: function(model, fn) {
        var self = this;
        var collection = this.getTable(model);
        if (model.id() == null) {
            this._getNextSequence(collection, function(err, value) {
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
        this.mongo(collection).save(model.props(), function(err, result) {
            if (!err) {
                model.set(result[0]);
                fn(null, model);
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

        this.mongo(collection).findAndModify(
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

        this.mongo(collection).findAndModify(
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
};

module.exports.mongodao = mongodao;