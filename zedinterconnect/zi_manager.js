/**
 * COPYRIGHT INDIGENOUS SOFTWARE, INC., LLC 2015
 *
 * All use or reproduction of any or all of this content must be approved.
 * Please contact info@indigenous.io for approval or questions.
 */

var logger = $$.g.getLogger("zi_manager");
var ziDao = require('./dao/zi.dao');
var ziConfig = require('../configs/zed.config');
var async = require('async');
var request = require('request');
var parseString = require('xml2js').parseString;
var userDao = require('../dao/user.dao');
var accountManager = require('../accounts/account.manager');

module.exports = {
    log: logger,

    demo: function(accountId, userId, fn) {
        var self = this;
        self.log.debug(accountId, userId, '>> demo');
        var path = 'object/display/oOrders/179376.aspx';
        self._ziRequest(path, function(err, value){
            if(err) {
                self.log.error(accountId, userId, 'Error calling zed', err);
                fn(err);
            } else {
                parseString(value, function(err, result){
                    if(err) {
                        self.log.error(accountId, userId, 'Error parsing xml:', err);
                        fn(err);
                    } else {
                        self.log.debug(accountId, userId, '<< demo');
                        fn(null, result);
                    }
                });
            }
        });
    },

    inventory: function(accountId, userId, fn) {
        var self = this;
        self.log.debug(accountId, userId, '>> inventory');
        var path = 'query/Indigenous/InventoryAvailability.aspx?accept=application/json';

        self._ziRequest(path, function(err, value) {
            if (err) {
                self.log.error(accountId, userId, 'Error calling zed', err);
                fn(err);
            } else {
                self.log.debug(accountId, userId, '<< inventory');
                fn(null, value);
            }
        });
    },

    cachedInventory: function(accountId, userId, skip, limit, sortBy, sortDir, fn) {
        var self = this;
        self.log.debug(accountId, userId, '>> cachedInventory');
        var query = {};
        var fields = null;
        var collection = 'inventory';


        ziDao.findRawWithFieldsLimitAndOrder(query, skip, limit, sortBy, fields, collection, sortDir, function(err, value){
            if(err) {
                self.log.error(accountId, userId, 'Error getting cached inventory:', err);
                fn(err);
            } else {
                self.log.debug(accountId, userId, '<< cachedInventory');
                fn(null, value);
            }
        });
    },


    getDashboardInventory: function(accountId, userId, fn) {
        var self = this;
        self.log.debug(accountId, userId, '>> getDashboardInventory');
        var query = {};
        var fields = null;
        var collection = 'inventory';

        accountManager.getOrganizationByAccountId(accountId, userId, function(err, organization){
            if(err) {
                self.log.error(accountId, userId, 'Error finding organization:', err);
                fn(err);
            } else {
                userDao.getById(userId, function (err, user) {
                    if (err) {
                        log.error(accountId, userId, 'Error getting user: ' + err);
                        fn(err, null);
                    } else {
                        var watchList = [];
                        var orgConfig = user.getOrgConfig(organization.id());
                        if(orgConfig){
                            watchList = orgConfig.watchList || [];
                        }
                        query = {
                            '@id': {'$in': watchList} 
                        };

                        ziDao.findRawWithFieldsLimitAndOrder(query, null, null, null, fields, collection, null, function(err, value){
                            if(err) {
                                self.log.error(accountId, userId, 'Error getting dashboard inventory:', err);
                                fn(err);
                            } else {
                                self.log.debug(accountId, userId, '<< getDashboardInventory');
                                fn(null, value);
                            }
                        });
                    }
                });
            }
        });

        
        
    },

    getInventoryItem: function(accountId, userId, itemId, fn) {
        var self = this;
        self.log.debug(accountId, userId, '>> getInventoryItem');
        var query = {'@id':itemId};
        var collection = 'inventory';
        ziDao.findRawWithFieldsLimitAndOrder(query, 0, 1, null, null, collection, null, function(err, resp) {
            if(err) {
                self.log.error(accountId, userId, 'Error getting inventory item:', err);
                fn(err);
            } else {
                if(resp && resp.results) {
                    self.log.debug(accountId, userId, '<< getInventoryItem');
                    fn(null, resp.results[0]);
                } else {
                    fn();
                }
            }
        });
    },

    getInventoryItemByName: function(accountId, userId, name, fn) {
        var self = this;
        self.log.debug(accountId, userId, '>> getInventoryItemByName');
        var query = {'OITM_ItemName':name};
        var collection = 'inventory';
        ziDao.findRawWithFieldsLimitAndOrder(query, 0, 1, null, null, collection, null, function(err, resp) {
            if(err) {
                self.log.error(accountId, userId, 'Error getting inventory item:', err);
                fn(err);
            } else {
                if(resp && resp.results) {
                    self.log.debug(accountId, userId, '<< getInventoryItemByName');
                    fn(null, resp.results[0]);
                } else {
                    fn();
                }
            }
        });
    },

    inventoryFilter: function(accountId, userId, query, skip, limit, sortBy, sortDir, fn) {
        var self = this;
        self.log.debug(accountId, userId, '>> inventoryFilter');
        query = _.mapObject(query, function(val, key) {
            return new RegExp('\.*' + val + '\.*', 'i');
        });
        self.log.debug('query:', query);
        var fields = null;
        var collection = 'inventory';
        var _skip = skip || 0;
        var _limit = limit || 0;
        ziDao.findRawWithFieldsLimitAndOrder(query, _skip, _limit, sortBy, fields, collection, sortDir, function(err, value){
            if(err) {
                self.log.error(accountId, userId, 'Error searching cached inventory:', err);
                fn(err);
            } else {
                self.log.debug(accountId, userId, '<< inventoryFilter');
                fn(null, value);
            }
        });
    },

    inventorySearch: function(accountId, userId, term, fieldSearch, skip, limit, sortBy, sortDir, fn) {
        var self = this;
        self.log.debug(accountId, userId, '>> inventorySearch');
        var regex = new RegExp('\.*'+term+'\.*', 'i');
        var query = {};

        if(fieldSearch){
            var fieldSearchArr = [];

            for(var i=0; i <= Object.keys(fieldSearch).length - 1; i++){
                var key = Object.keys(fieldSearch)[i];
                var value = fieldSearch[key];
                self.log.debug('value:', value);
                if(value){
                    if(key == 'In_Stock'){
                        if(value == -1){
                            var obj = {};
                            obj[key] = 0;
                            fieldSearchArr.push(obj);
                        } else{
                            var obj = {};
                            obj[key] ={$gt:0};
                            fieldSearchArr.push(obj);
                        }
                    } else if (key == 'OITM_ItemCode') {
                        var obj = {};
                        obj[key] = parseInt(value);
                        fieldSearchArr.push(obj);
                    } else {
                        var obj = {};
                        obj[key] = new RegExp(value, 'i');
                        fieldSearchArr.push(obj);
                    }

                }
            }
            if(fieldSearchArr.length){
                query["$and"] = fieldSearchArr;
            }
        } else {
            query = {
                $or:[
                    {'@id':regex},
                    {OITM_ItemCode:parseInt(term)},
                    {OITM_ItemName:regex},
                    {OITM_U_dscription:regex},
                    {OITB_ItmsGrpNam:regex},
                    {In_Stock:regex},
                    {Committed:regex},
                    {Available:regex},
                    {OMRC_FirmName:regex},
                    {OLGT_UnitName:regex},
                    {OITM_SLength1:regex},
                    {OLGT_UnitName_10:regex},
                    {OITM_SWidth1:regex},
                    {OITM_BHeight1:regex},
                    {OWGT_UnitName:regex},
                    {OITM_SWeight1:regex},
                    {OITM_SVolume:regex}
                ]
            };
        }
        self.log.debug('query:', query);

        var fields = null;
        var collection = 'inventory';
        var _skip = skip || 0;
        var _limit = limit || 0;


        ziDao.findRawWithFieldsLimitAndOrder(query, _skip, _limit, sortBy, fields, collection, sortDir, function(err, value){
            if(err) {
                self.log.error(accountId, userId, 'Error searching cached inventory:', err);
                fn(err);
            } else {
                self.log.debug(accountId, userId, '<< inventorySearch');
                fn(null, value);
            }
        });
    },

    inventoryFieldSearch: function(accountId, userId, field, value, skip, limit, sortBy, sortDir, fn) {
        var self = this;
        self.log.debug(accountId, userId, '>> inventoryFieldSearch');
        var query = {};
        query[field] = value;
        var fields = null;
        var collection = 'inventory';
        var _skip = skip || 0;
        var _limit = limit || 0;
        self.log.debug('Using query:', query);
        ziDao.findRawWithFieldsLimitAndOrder(query, _skip, _limit, sortBy, fields, collection, sortDir, function(err, value){
            if(err) {
                self.log.error(accountId, userId, 'Error searching cached inventory:', err);
                fn(err);
            } else {
                self.log.debug(accountId, userId, '<< inventoryFieldSearch');
                fn(null, value);
            }
        });
    },

    getLedger: function(accountId, userId, cardCodeFrom, cardCodeTo, dateString, fn) {
        var self = this;
        self.log.debug(accountId, userId, '>> getLedger');
        var path = 'query/Indigenous/CustomerAging2.aspx?0=' + cardCodeFrom + '&1=' + cardCodeTo + '&2=' + dateString + '&accept=application/json';

        self._ziRequest(path, function(err, value) {
            if (err) {
                self.log.error(accountId, userId, 'Error calling zed', err);
                fn(err);
            } else {
                self.log.debug(accountId, userId, '<< getLedger');
                fn(null, value);
            }
        });
    },

    getLedgerWithLimit: function(accountId, userId, cardCodeAry, dateString, limit, fn) {
        var self = this;
        self.log.debug(accountId, userId, '>> getLedgerWithLimit');
        var resultAry = [];
        if(cardCodeAry.length == 0) {
            cardCodeAry.push('admin');
        }
        async.each(cardCodeAry, function(cardCode, callback){
            var path = 'query/Indigenous/CustomerAging2.aspx?0=' + cardCode + '&1=' + cardCode + '&2=' + dateString + '&accept=application/json';
            if(cardCode === 'admin') {
                //just a hack to load them all.
                path = 'query/Indigenous/CustomerAging2.aspx?0=0&1=L9999999&2=' + dateString + '&accept=application/json';
            }
            self._ziRequest(path, function(err, value) {
                if(err) {
                    self.log.error(accountId, userId, 'Error calling zi:', err);
                    callback(err);
                } else {

                    var response = JSON.parse(value);//response.payload.querydata.data.row

                    if(response && response.response) {
                        response = response.response;
                    }
                    if(response &&
                        response.payload &&
                        response.payload.querydata &&
                        response.payload.querydata.data &&
                        response.payload.querydata.data.row) {
                        resultAry = resultAry.concat(response.payload.querydata.data.row);
                    }
                    callback();
                }
            });
        }, function(err){
            //sort by _CustStatmentDtl_DueDate
            resultAry = _.first(_.sortBy(resultAry, '_CustStatmentDtl_DueDate'), limit);
            self.log.debug(accountId, userId, '<< getLedgerWithLimit');
            fn(err, resultAry);
        });
    },

    loadInventoryCollection: function(fn) {
        var self = this;
        self.log.debug(0, 0, '>> loadInventoryCollection');
        var path = 'query/Indigenous/InventoryAvailability.aspx?accept=application/json';

        self._ziRequest(path, function(err, value) {
            if(err) {
                self.log.error(0,0, 'Error loading inventory:', err);
                fn();
            } else {
                value = JSON.parse(value);

                var data = value.response.payload.querydata.data.row;
                _.each(data, function(row){
                    try {
                        row.OITM_ItemCode = parseInt(row.OITM_ItemCode);
                    } catch(e) {
                        self.log.error('Error parsing row [' + row['@id'] + '.OITM_ItemCode', e);
                    }
                    try {
                        row.In_Stock = parseInt(row.In_Stock);
                    } catch(e) {
                        self.log.error('Error parsing row [' + row['@id'] + '.In_Stock', e);
                    }
                    try {
                        row.Committed = parseInt(row.Committed);
                    } catch(e) {
                        self.log.error('Error parsing row [' + row['@id'] + '.Committed', e);
                    }
                    try {
                        row.Available = parseInt(row.Available);
                    } catch(e) {
                        self.log.error('Error parsing row [' + row['@id'] + '.Available', e);
                    }
                    try {
                        row.OITM_SLength1 = parseFloat(row.OITM_SLength1);
                    } catch(e) {
                        self.log.error('Error parsing row [' + row['@id'] + '.OITM_SLength1', e);
                    }
                    try {
                        row.OITM_SWidth1 = parseFloat(row.OITM_SWidth1);
                    } catch(e) {
                        self.log.error('Error parsing row [' + row['@id'] + '.OITM_SWidth1', e);
                    }
                    try {
                        row.OITM_BHeight1 = parseFloat(row.OITM_BHeight1);
                    } catch(e) {
                        self.log.error('Error parsing row [' + row['@id'] + '.OITM_BHeight1', e);
                    }
                    try {
                        row.OITM_SWeight1 = parseFloat(row.OITM_SWeight1);
                    } catch(e) {
                        self.log.error('Error parsing row [' + row['@id'] + '.OITM_SWeight1', e);
                    }
                    try {
                        row.OITM_SVolume = parseFloat(row.OITM_SVolume);
                    } catch(e) {
                        self.log.error('Error parsing row [' + row['@id'] + '.OITM_SVolume', e);
                    }

                });
                self.log.debug(0,0, 'Bulk inserting [' + data.length + '] records');
                ziDao.dropCollection('new_inventory', function(){
                    ziDao.bulkInsert(data, 'new_inventory', function(err, value){
                        if(!err) {
                            ziDao.renameCollection('new_inventory', 'inventory', function(err, value){
                                self.log.debug(0, 0, '<< loadInventoryCollection');
                                fn(err, value);
                            });
                        } else {
                            self.log.error('Error during bulk insert:', err);
                            fn(err);
                        }

                    });
                });

            }
        });
    },

    getCustomers: function(accountId, userId, fn) {
        var self = this;
        self.log.debug(accountId, userId, '>> getCustomers');
        var path = 'query/Indigenous/CustomerList.aspx?accept=application/json';

        self._ziRequest(path, function(err, value){
            if(err) {
                self.log.error(accountId, userId, 'Error loading customers:', err);
                fn(err);
            } else {
                value = JSON.parse(value);
                self.log.debug(accountId, userId, '<< getCustomers');
                fn(null, value);
            }
        });
    },

    _ziRequest: function(path, fn) {
        var self = this;
        var url = ziConfig.ZED_PROTOCOL + ziConfig.ZED_USERNAME + ':' + ziConfig.ZED_PASSWORD + '@' + ziConfig.ZED_ENDPOINT;
        url += path;
        request(url, function(err, resp, body) {
            if(err) {
                self.log.error('Error calling url [' + url + ']', err);
                fn(err);
            } else {
                //self.log.debug('got this response:', resp);
                //self.log.debug('got this body:', body);
                fn(null, body);
            }
        });
    }

};
