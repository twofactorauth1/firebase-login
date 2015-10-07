/**
 * COPYRIGHT INDIGENOUS SOFTWARE, INC., LLC 2014
 *
 * All use or reproduction of any or all of this content must be approved.
 * Please contact info@indigenous.io for approval or questions.
 */

var mongoConfig = require('../configs/mongodb.config');
var mongoskin = require('mongoskin');
var mongodb = mongoskin.db(mongoConfig.MONGODB_CONNECT, {safe: true});
var async = require('async');

$$.g.mongos = $$.g.monogs || [];
var mongodao = {

    mongodatabase: mongodb,

    initMongo: function () {
        $$.g.mongos.push(this.mongodatabase);
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


    mongo: function (collection) {
        return this.mongodatabase.collection(collection || this.getTable());
    },


    getMongoCollection: function (type) {
        var collection = this.getTable(type);
        return this.mongo(collection);
    },


    _createModel: function (object, type, xFields) {
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
    _getByIdMongo: function (id, type, fn) {
        var self = this;

        if (fn == null) {
            fn = type;
            type = null;
        }

        var collection = this.getTable(type);
        this.mongo(collection).findById(id, function (err, result) {
            if (!err) {
                fn(err, self._createModel(result, type));
            } else {
                self.log.error("An error occurred: #getByIdMongo()", err);
                fn(err, result);
            }
        });
    },


    _findOneMongo: function (query, type, fn) {
        var self = this;
        if (fn == null) {
            fn = type;
            type = null;
        }

        var collection = this.getTable(type);
        this.mongo(collection).findOne(query, function (err, result) {
            if (!err) {
                fn(null, self._createModel(result, type));
            } else {
                self.log.error("An error occurred: #findOneMongo() with query: " + JSON.stringify(query), err);
                fn(err, result);
            }
        });
    },

    _findCountMongo: function (query, type, fn) {
        var self = this;
        self.log.error('result ', query);
        if (fn == null) {
            fn = type;
            type = null;
        }

        var collection = this.getTable(type);

        this.mongo(collection).find(query).count(function (err, result) {
            if (!err) {
                self.log.error('result ', result);
                fn(null, result);
            } else {
                self.log.error("An error occurred: #findOneMongo() with query: " + JSON.stringify(query), err);
                fn(err, result);
            }
        });
    },


    _findManyMongo: function (query, type, fn) {
        this._findManyWithFieldsMongo(query, null, type, fn);
    },

    _findManyWithLimitMongo: function (query, limit, type, fn) {
        this._findManyWithFieldsAndLimitMongo(query, null, limit, type, fn);
    },


    _findManyWithFieldsMongo: function (query, fields, type, fn) {
        this._findManyWithFieldsAndLimitMongo(query, fields, null, type, fn);
    },

    _findManyWithFieldsAndLimitMongo: function (query, fields, limit, type, fn) {
        var self = this;
        if (fn == null) {
            fn = type;
            type = null;
        }

        var collection = this.getTable(type);
        var mongoColl = this.mongo(collection);

        var fxn = function (err, value) {
            if (!err) {
                return self._wrapArrayMongo(value, fields, type, fn);
            } else {
                self.log.error("An error occurred: #findManyWithFieldsMongo() with query: " + JSON.stringify(query), err);
                fn(err, value);
            }
        };

        if (limit == null || limit === 0) {
            if (query == null && fields == null) {
                mongoColl.find().sort({_id: -1}).toArray(fxn);
            } else if (query != null) {
                mongoColl.find(query).sort({_id: -1}).toArray(fxn);
            } else if (fields != null) {
                mongoColl.find(null, fields).sort({_id: -1}).toArray(fxn);
            }
        } else {
            if (query == null && fields == null) {
                mongoColl.find().sort({_id: -1}).limit(limit).toArray(fxn);
            } else if (query != null) {
                mongoColl.find(query).sort({_id: -1}).limit(limit).toArray(fxn);
            } else if (fields != null) {
                mongoColl.find(null, fields).sort({_id: -1}).limit(limit).toArray(fxn);
            }
        }
    },


    _findAndOrderMongo: function (query, fields, type, order_by, order_dir, fn) {
        var self = this;
        if (fn == null) {
            fn = type;
            type = null;
        }

        //ascending === 1 (default)
        //descending === -1
        if (order_dir !== -1) {
            order_dir = 1;
        }

        var collection = this.getTable(type);
        var mongoColl = this.mongo(collection);

        var fxn = function (err, value) {
            if (!err) {
                return self._wrapArrayMongo(value, fields, type, fn);
            } else {
                self.log.error("An error occurred: #findAndOrderMongo() with query: " + JSON.stringify(query), err);
                fn(err, value);
            }
        };
        var orderByObj = {};
        orderByObj[order_by] = order_dir;
        this.mongo(collection).find(query).sort(orderByObj).toArray(fxn);

    },

    _findAllWithFieldsMongo: function (query, skip, sort, fields, type, fn) {
        var self = this;
        if (fn == null) {
            fn = type;
            type = null;
        }

        var collection = this.getTable(type);
        var mongoColl = this.mongo(collection);

        var fxn = function (err, value) {
            if (!err) {
                return self._wrapArrayMongo(value, fields, type, fn);
            } else {
                self.log.error("An error occurred: #findManyWithFieldsMongo() with query: " + JSON.stringify(query), err);
                fn(err, value);
            }
        };

        //TODO: this is a mess
        if (query == null && fields == null) {
            mongoColl.find({}, { sort: [
                [sort]
            ]}).skip(skip).toArray(fxn);
        } else if (query != null) {
            //        mongoColl.find({ $query: {}, $orderby: { sort : 1 } }  ).limit(3+skip).toArray(fxn);
            // mongoColl.find(query).sort( { sort: 1 } ).limit(3+skip).toArray(fxn);
            mongoColl.find(query, { sort: [
                [sort, 'ascending']
            ]}).skip(skip).toArray(fxn);
            // mongoColl.find(query).skip(skip).limit(6).toArray(fxn);
        } else if (fields != null) {
            mongoColl.find(null, fields).skip(skip).toArray(fxn);
        }
    },

    _findAllWithFieldsAndLimitMongo: function (query, skip, limit, sort, fields, type, fn) {
        var self = this;
        if (fn == null) {
            fn = type;
            type = null;
        }

        var collection = this.getTable(type);
        var mongoColl = this.mongo(collection);
        var _query = query || {};
        var _skip = skip || 0;
        var _limit = limit || 0;

        var fxn = function (err, value) {
            if (!err) {
                return self._wrapArrayMongo(value, fields, type, fn);
            } else {
                self.log.error("An error occurred: #_findAllWithFieldsAndLimitMongo() with query: " + JSON.stringify(query), err);
                fn(err, value);
            }
        };

        if (fields) {
            if (sort) {
                mongoColl.find(query, fields, {sort: [
                    [sort, 'ascending']
                ]}).skip(skip).limit(limit).toArray(fxn);
            } else {
                mongoColl.find(_query, fields).skip(_skip).limit(_limit).toArray(fxn);
            }
        } else {
            if (sort) {
                mongoColl.find(query, {sort: [
                    [sort, 'ascending']
                ]}).skip(skip).limit(limit).toArray(fxn);
            } else {
                mongoColl.find(_query).skip(_skip).limit(_limit).toArray(fxn);
            }
        }


    },

    _findWithFieldsLimitAndTotalMongo: function(query, skip, limit, sort, fields, type, fn) {
        var self = this;

        var collection = this.getTable(type);
        var mongoColl = this.mongo(collection);
        var _query = query || {};
        var _skip = skip || 0;
        var _limit = limit || 0;


        mongoColl.count(query, function(err, count){
            var fxn = function (err, value) {
                if (!err) {
                    return self._wrapArrayAndCountMongo(value, fields, type, count, _skip, fn);
                } else {
                    self.log.error("An error occurred: #_findAllWithFieldsAndLimitMongo() with query: " + JSON.stringify(query), err);
                    fn(err, value);
                }
            };
            if (fields) {
                if (sort) {
                    mongoColl.find(query, fields, {sort: [
                        [sort, 'ascending']
                    ]}).skip(skip).limit(limit).toArray(fxn);
                } else {
                    mongoColl.find(_query, fields).skip(_skip).limit(_limit).toArray(fxn);
                }
            } else {
                if (sort) {
                    mongoColl.find(query, {sort: [
                        [sort, 'ascending']
                    ]}).skip(skip).limit(limit).toArray(fxn);
                } else {
                    mongoColl.find(_query).skip(_skip).limit(_limit).toArray(fxn);
                }
            }
        });

    },

    _findWithFieldsLimitOrderAndTotalMongo: function(query, skip, limit, sort, fields, type, order_dir, fn) {
        var self = this;

        var collection = this.getTable(type);
        var mongoColl = this.mongo(collection);
        var _query = query || {};
        var _skip = skip || 0;
        var _limit = limit || 0;
        var sort_order = order_dir || -1;

        mongoColl.count(query, function(err, count){
            var fxn = function (err, value) {
                if (!err) {
                    return self._wrapArrayAndCountMongo(value, fields, type, count, _skip, fn);
                } else {
                    self.log.error("An error occurred: #_findAllWithFieldsAndLimitMongo() with query: " + JSON.stringify(query), err);
                    fn(err, value);
                }
            };
            if (fields) {
                if (sort) {
                    mongoColl.find(query, fields, {sort: [
                        [sort, sort_order]
                    ]}).skip(skip).limit(limit).toArray(fxn);
                } else {
                    mongoColl.find(_query, fields).skip(_skip).limit(_limit).toArray(fxn);
                }
            } else {
                if (sort) {
                    mongoColl.find(query, {sort: [
                        [sort, sort_order]
                    ]}).skip(skip).limit(limit).toArray(fxn);
                } else {
                    mongoColl.find(_query).skip(_skip).limit(_limit).toArray(fxn);
                }
            }
        });

    },

    _aggregateMongoWithCustomStages: function (stageAry, type, fn) {
        var self = this;

        var collection = this.getTable(type);
        var mongoColl = this.mongo(collection);

        mongoColl.aggregate(stageAry, function (err, value) {
            if (!err) {
                fn(null, value);
            } else {
                self.log.error("An error occurred: #aggregateMongoWithCustomStages() with stages: " + JSON.stringify(stageAry), err);
                fn(err, value);
            }
        });
    },

    _aggregateMongo: function (groupCriteria, matchCriteria, type, fn) {
        var self = this;
        var stageAry = [];
        stageAry.push({$match: matchCriteria});
        stageAry.push({
            $group: {
                _id: groupCriteria,

                // Count number of matching docs for the group
                count: { $sum: 1 },

                // Save the _id for matching docs
                docs: { $push: "$_id" }
            }
        });
        stageAry.push({
            // Limit results to duplicates (more than 1 match)
            $match: {
                count: { $gt: 1 }
            }
        });

        return self._aggregateMongoWithCustomStages(stageAry, type, fn);
    },

    _wrapArrayMongo: function (value, fields, type, fn) {
        var self = this, arr = [];
        value.forEach(function (item) {
            arr.push(self._createModel(item, type, fields));
        });

        fn(null, arr);
        return arr;
    },

    _wrapArrayAndCountMongo: function(value, fields, type, count, start, fn) {
        var self = this, arr = [], result = {};
        value.forEach(function (item) {
            arr.push(self._createModel(item, type, fields));
        });
        result.total = count;
        result.limit = arr.length;
        result.start = start;
        result.results = arr;
        fn(null, result);
        return result;
    },


    _existsMongo: function (query, type, fn) {
        var self = this;
        if (fn == null) {
            fn = type;
            type = null;
        }

        var collection = this.getTable(type);
        this.mongo(collection).find(query).limit(1).count(function (err, result) {
            if (!err) {
                if (result > 0) {
                    fn(null, true);
                } else {
                    fn(null, false);
                }
            } else {
                self.log.error("An error occurred: #existsMongo() with query: " + JSON.stringify(query), err);
                fn(err, result);
            }
        });
    },


    _saveOrUpdateMongo: function (model, fn) {
        var self = this;
        var collection = this.getTable(model);
        if (model.id() == null || model.id() == 0 || model.id() == "") {
            this._getNextSequence(collection, function (err, value) {
                if (!err) {
                    model.id(value);
                    self._saveOrUpdateMongo(model, fn);
                } else {
                    self.log.error("An error occurred: #saveOrUpdateMongo/GetNextSequence()", err);
                    if (fn != null) {
                        fn(err, value);
                    }
                }
            });
            return;
        }
        /*
         * DEBUG CODE FOR USER CORRUPTION
         */
        //if(collection === 'users') {
        //    var log = $$.g.getLogger("USER.DEBUG");
        //    log.warn('updating user to the following:' + JSON.stringify(model));
        //}
        this.mongo(collection).save(model.toJSON("db"), function (err, result) {
            if (!err) {
                if (fn != null) {
                    fn(null, model);
                }
            } else {
                self.log.error("An error occurred: #saveOrUpdateMongo/save()", err);
                if (fn != null) {
                    fn(err, result);
                }
            }
        });
    },


    _removeMongo: function (model, fn) {
        var self = this;
        var collection = this.getTable(model);

        this.mongo(collection).removeById(model.id(), function (err, value) {
            if (err) {
                self.log.error("An error occurred: #removeMongo. ", err);
            }

            fn(err, value);
        });
    },


    _removeByIdMongo: function (id, type, fn) {
        var self = this;

        if (fn == null) {
            fn = type;
            type = null;
        }

        var collection = this.getTable(type);
        this.mongo(collection).removeById(id, function (err, value) {
            if (err) {
                self.log.error("An error occurred: #removeByIdMongo. ", err);
            }

            fn(err, value);
        });
    },

    _removeByQueryMongo: function (query, type, fn) {
        var self = this;

        if (fn == null) {
            fn = type;
            type = null;
        }

        var collection = this.getTable(type);
        this.mongo(collection).remove(query, function (err, value) {
            if (err) {
                self.log.error("An error occurred: #removeByQueryMongo. ", err);
            }

            fn(err, value);
        });
    },

    _getMaxValueMongo: function (query, fieldName, type, fn) {
        //db.thiscollection.find().sort({"thisfieldname":-1}).limit(1)
        var self = this;
        var collection = this.getTable(type);
        console.dir(query);
        var sort = {};
        sort[fieldName] = -1;
        this.mongo(collection).find(query).sort(sort).limit(1).toArray(function (err, values) {
            if (err) {
                self.log.error('An error occurred: #getMaxValueMongo. ', err);
                fn(err, null);
            } else {
                var result = values[0] || {};
                self.log.info('result: ');
                console.dir(result);
                fn(null, result[fieldName]);
            }
        });
    },

    _findAndModify: function (params, fieldName, type, fn) {
        var self = this;

        var collection = this.getTable(type);

        this.mongo(collection).findAndModify(params,
            function (err, value) {
                if (!err && value != null) {
                    if (fn != null) {
                        fn(null, value.fieldName);
                    }
                } else if (!err) {
                    //we could not find anything.  Insert maybe?
                    params.seq = 0;
                    var postOrder = new $$.m.PostOrder(params);
                    self.mongo(collection).insert(postOrder, null, fn);

                } else {
                    self.log.error("An error occurred retrieving sequence: ", err);
                    if (fn != null) {
                        fn(err, value);
                    }
                }
            }
        );
    },


    _getNextSequence: function (collection, fn) {
        var self = this;

        if (_.isFunction(collection)) {
            fn = collection;
            collection = null;
        }

        collection = collection || this.collection;

        if (this._isLocked(collection)) {
            (function (collection, fn) {
                self._registerUnlock(collection, function () {
                    self._getNextSequence(collection, fn);
                });
            })(collection, fn);
            return;
        }

        this._lockCollection(collection);
        this.mongo(collection).findAndModify(
            { _id: "__counter__" },
            [],
            { $inc: { seq: 1 } },
            { new: true, upsert: true },
            function (err, value) {
                self._unlockCollection(collection);
                if (!err && value != null && value.hasOwnProperty('seq')) {
                    if (fn != null) {
                        fn(null, value.seq);
                    }
                } else {
                    self.log.error("An error occurred retrieving sequence", err);
                    if (fn != null) {

                        fn(err, value);
                    }
                }
            }
        );
    },

    _batchUpdateMongo: function(list, type, fn) {
        var self = this;
        /*
         * This is where an actual batch update method should go.
         */
        var collection = this.getTable(type);

        async.each(list, function(obj, callback){
            self.mongo(collection).save(obj.toJSON('db'), function(err, result){
                if(err) {
                    self.log.error('error saving object in batchUpdate: ' + err);
                    callback(err);
                } else {
                    callback();
                }
            });
        }, function(err){
            if(err) {
                self.log.error('error saving object in batchUpdate: ', err);
                fn(err, null);
            } else {
                fn(null, 'OK');
            }
        });

        /*

        var collection = this.getTable(type);
        console.log('collection: ' + collection);
        this.mongodatabase.collection(collection, function(err, mongoCollection){
            console.dir(mongoCollection);
            var bulk = mongoCollection.initialzeUnorderedBulkOp();
            var count = 0;
            for (var i = 0; i < list.length; i++) {
                bulk.insert({number: i});
                bulk.find({'_id': list[i].id()}).upsert().replaceOne(list[i].toJSON("db"));
                count++;

                if ( count % 1000 == 0 )
                    bulk.execute(function(err,result) {
                        // maybe do something with results
                        bulk = collection.initializeUnorderedBulkOp(); // reset after execute
                    });

            }

            // If your loop was not a round divisor of 1000
            if ( count % 1000 != 0 ) {
                bulk.execute(function(err,result) {
                    fn(null, "OK");
                });
            } else {
                fn(null, "OK");
            }
        });
        */
    },

    _distinctMongo: function(key, query, type, fn) {
        var self = this;

        var collection = this.getTable(type);

        return self.mongo(collection).distinct(key, query, fn);

    },

    //endregion PROTECTED

    //region PRIVATE
    _lockCollection: function (collection) {
        this.locked = this.locked || {};
        collection = collection || this.collection;
        this.locked[collection] = true;
    },


    _unlockCollection: function (collection) {
        collection = collection || this.collection;
        delete this.locked[collection];
        this._notifyUnlock(collection);
    },


    _isLocked: function (collection) {
        collection = collection || this.collection;
        if (this.locked && this.locked[collection] === true) {
            return true;
        }
        return false;
    },


    _registerUnlock: function (collection, fn) {
        this.unlockRegister = this.unlockRegister || {};
        this.unlockRegister[collection] = this.unlockRegister[collection] || [];
        this.unlockRegister[collection].push(fn);
    },


    _notifyUnlock: function (collection) {
        if (this.unlockRegister && this.unlockRegister[collection] != null) {
            //var callbacks = this.unlockRegister[collection];
            //do a deep copy of the array and delete it so it won't be modified by the callbacks
            var callbacks = $.extend(true, [], this.unlockRegister[collection]);
            delete this.unlockRegister[collection];
            for (var i = 0; i < callbacks.length; i++) {
                callbacks[i]();
            }
        }
    },


    _ensureCounters: function (collection, fn) {
        var self = this;

        if (_.isFunction(collection)) {
            fn = collection;
            collection = null;
        }

        collection = collection || this.collection;

        this._lockCollection(collection);

        this.mongo(collection).findAndModify(
            { _id: "__counter__" },
            [],
            { $inc: { seq: 0 } },
            { new: true, upsert: true },
            function (err, value) {
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