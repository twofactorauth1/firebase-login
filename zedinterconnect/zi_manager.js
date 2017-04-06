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