var mongoConfig = require('../configs/mongodb.config');
var mongoskin = require('mongoskin');
var mongodb = mongoskin.db(mongoConfig.MONGODB_CONNECT, {w:1});

var mongodao = {

    mongodatabase: mongodb,

    initMongo: function() {
        //ensure we have our ID counters set up for this collection
        if (this.defaultModel != null) {
            if (this.getStorage() == "mongo") {
                this._ensureCounters();
                if (this._onStartup != null && _.isFunction(this._onStartup)) {
                    this._onStartup();
                }
            }
        }
    },


    mongo: function(collection) {
        return this.mongodatabase.collection(collection || this.getTable());
    },


    getMongoCollection: function(type) {
        var collection = this.getTable(type);
        return this.mongo(collection);
    },


    _createModel: function(object, type, xFields) {
        if (object == null) {
            return null;
        }
        if (_.isFunction(type)) {
            return new type(object, xFields);
        } else {
            return new this.defaultModel(object, xFields);
        }
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
                fn(err, self._createModel(result));
            } else {
                fn(err, result);
            }
        });
    },


    _findOneMongo: function(query, type, fn) {
        var self = this;
        if (fn == null) {
            fn = type;
            type = null;
        }

        var collection = this.getTable(type);
        this.mongo(collection).findOne(query, function(err, result) {
           if (!err) {
               fn(null, self._createModel(result));
           } else {
               fn(err, result);
           }
        });
    },


    _findManyMongo: function(query, type, fn) {
        this._findManyWithFieldsMongo(query, null, type, fn);
    },


    _findManyWithFieldsMongo: function(query, fields, type, fn) {
        var self = this;
        if (fn == null) {
            fn = type;
            type = null;
        }

        var collection = this.getTable(type);
        var mongoColl = this.mongo(collection);

        var fxn = function(err, value) {
            if (!err) {
                return self._wrapArrayMongo(value, fields, fn);
            } else {
                fn(err, value);
            }
        };

        if (query == null && fields == null) {
            mongoColl.find().toArray(fxn);
        } else if (query != null) {
            mongoColl.find(query).toArray(fxn);
        } else if(fields != null) {
            mongoColl.find(null, fields).toArray(fxn);
        }
    },


    _wrapArrayMongo: function(value, fields, fn) {
        var arr = [];
        var self = this;
        value.forEach(function(item) {
            arr.push(self._createModel(item, null, fields));
        });

        fn(null, arr);
        return arr;
    },


    _existsMongo: function(query, type, fn) {
        var self = this;
        if (fn == null) {
            fn = type;
            type = null;
        }

        var collection = this.getTable(type);
            this.mongo(collection).find(query).limit(1).count(function(err, result) {
            if (!err) {
                if (result > 0) {
                    fn(null, true);
                } else {
                    fn(null, false);
                }
            } else {
                fn(err, result);
            }
        });
    },


    _saveOrUpdateMongo: function(model, fn) {
        var self = this;
        var collection = this.getTable(model);
        if (model.id() == null || model.id() == 0 || model.id() == "") {
            this._getNextSequence(collection, function(err, value) {
                if (!err) {
                    model.id(value);
                    self._saveOrUpdateMongo(model, fn);
                } else {
                    if (fn != null) {
                        fn(err, value);
                    }
                }
            });
            return;
        }

        var self = this;
        this.mongo(collection).save(model.toJSON("db"), function(err, result) {
            if (!err) {
                if (fn != null) {
                    fn(null, model);
                }
            } else {
                if (fn != null) {
                    fn(err, value);
                }
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
                    if (fn != null) {
                        fn(null, value.seq);
                    }
                } else {
                    if (fn != null) {
                        fn(err, value);
                    }
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

module.exports = mongodao;