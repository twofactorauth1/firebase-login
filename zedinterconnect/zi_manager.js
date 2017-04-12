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

    inventorySearch: function(accountId, userId, term, fn) {
        var self = this;
        self.log.debug(accountId, userId, '>> inventorySearch');
        var regex = new RegExp('\.*'+term+'\.', 'i');

        var query = {
            $or:[
                {'@id':regex},
                {OITM_ItemCode:regex},
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
        var fields = null;
        var collection = 'inventory';
        var skip = 0;
        var limit = 0;
        var sortBy = null;
        var sortDir = null;

        ziDao.findRawWithFieldsLimitAndOrder(query, skip, limit, sortBy, fields, collection, sortDir, function(err, value){
            if(err) {
                self.log.error(accountId, userId, 'Error searching cached inventory:', err);
                fn(err);
            } else {
                self.log.debug(accountId, userId, '<< inventorySearch');
                fn(null, value);
            }
        });
    },

    inventoryFieldSearch: function(accountId, userId, field, value, fn) {
        var self = this;
        self.log.debug(accountId, userId, '>> inventoryFieldSearch');
        var query = {};
        query[field] = value;
        var fields = null;
        var collection = 'inventory';
        var skip = 0;
        var limit = 0;
        var sortBy = null;
        var sortDir = null;
        self.log.debug('Using query:', query);
        ziDao.findRawWithFieldsLimitAndOrder(query, skip, limit, sortBy, fields, collection, sortDir, function(err, value){
            if(err) {
                self.log.error(accountId, userId, 'Error searching cached inventory:', err);
                fn(err);
            } else {
                self.log.debug(accountId, userId, '<< inventoryFieldSearch');
                fn(null, value);
            }
        });
    },

    aging: function(accountId, userId, cardCodeFrom, cardCodeTo, dateString, fn) {
        var self = this;
        self.log.debug(accountId, userId, '>> aging');
        var path = 'query/Indigenous/CustomerAging2.aspx?0=' + cardCodeFrom + '&1=' + cardCodeTo + '&2=' + dateString + '&accept=application/json';

        self._ziRequest(path, function(err, value) {
            if (err) {
                self.log.error(accountId, userId, 'Error calling zed', err);
                fn(err);
            } else {
                self.log.debug(accountId, userId, '<< aging');
                fn(null, value);
            }
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
        //response.payload.data.row
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