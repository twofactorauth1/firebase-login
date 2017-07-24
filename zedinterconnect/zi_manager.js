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
var emailMessageManager = require('../emailmessages/emailMessageManager');
var ERR_MSG = 'We are having trouble retrieving these results.  Please try again later';
var scheduledJobsManager = require('../scheduledjobs/scheduledjobs_manager');
var orgManager = require('../organizations/organization_manager');


var ziManager = {
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

        self._addUserInventoryFilter(accountId, userId, query, function(err, query){
            ziDao.findRawWithFieldsLimitAndOrder(query, skip, limit, sortBy, fields, collection, sortDir, function(err, value){
                if(err) {
                    self.log.error(accountId, userId, 'Error getting cached inventory:', err);
                    fn(err);
                } else {
                    self.log.debug(accountId, userId, '<< cachedInventory');
                    fn(null, value);
                }
            });
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
                            'OITM_ItemCode': {'$in': watchList} 
                        };
                        self._addUserInventoryFilter(accountId, userId, query, function(err, query){
                            ziDao.findRawWithFieldsLimitAndOrder(query, null, null, null, fields, collection, null, function(err, value){
                                if(err) {
                                    self.log.error(accountId, userId, 'Error getting dashboard inventory:', err);
                                    fn(err);
                                } else {
                                    self.log.debug(accountId, userId, '<< getDashboardInventory');
                                    fn(null, value);
                                }
                            });
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
        self._addUserInventoryFilter(accountId, userId, query, function(err, query){
            ziDao.findRawWithFieldsLimitAndOrder(query, _skip, _limit, sortBy, fields, collection, sortDir, function(err, value){
                if(err) {
                    self.log.error(accountId, userId, 'Error searching cached inventory:', err);
                    fn(err);
                } else {
                    self.log.debug(accountId, userId, '<< inventoryFilter');
                    fn(null, value);
                }
            });
        });

    },

    inventorySearch: function(accountId, userId, term, fieldSearch, skip, limit, sortBy, sortDir, fn) {
        var self = this;
        self.log.debug(accountId, userId, '>> inventorySearch');
        var regex = new RegExp('\.*'+term+'\.*', 'i');
        var query = {};
        var orQuery = [
                    {'@id':regex},
                    {OITM_ItemCode:parseInt(term)},
                    {OITM_ItemName:regex},
                    {OITM_U_dscription:regex},
                    {OITB_ItmsGrpNam:regex},
                    {In_Stock:regex},
                    {Committed:regex},
                    {Available:regex},
                    {_shortVendorName:regex},
                    {OLGT_UnitName:regex},
                    {OITM_SLength1:regex},
                    {OLGT_UnitName_10:regex},
                    {OITM_SWidth1:regex},
                    {OITM_BHeight1:regex},
                    {OWGT_UnitName:regex},
                    {OITM_SWeight1:regex},
                    {OITM_SVolume:regex}
                ];
        if(fieldSearch){
            var fieldSearchArr = [];

            for(var i=0; i <= Object.keys(fieldSearch).length - 1; i++){
                var key = Object.keys(fieldSearch)[i];
                var value = fieldSearch[key];
                self.log.debug('value:', value);
                if(value){
                    if(key == 'Available'){
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
            if(term){
                query["$or"] = orQuery;
            }
        } else {
            query = {
                $or: orQuery
            };
        }
        self.log.debug('query:', query);

        var fields = null;
        var collection = 'inventory';
        var _skip = skip || 0;
        var _limit = limit || 0;

        self._addUserInventoryFilter(accountId, userId, query, function(err, query){
            ziDao.findRawWithFieldsLimitAndOrder(query, _skip, _limit, sortBy, fields, collection, sortDir, function(err, value){
                if(err) {
                    self.log.error(accountId, userId, 'Error searching cached inventory:', err);
                    fn(err);
                } else {
                    self.log.debug(accountId, userId, '<< inventorySearch');
                    fn(null, value);
                }
            });
        });

    },


    productSearch: function(accountId, userId, term, skip, limit, sortBy, sortDir, filter, fn) {
        var self = this;
        self.log.debug(accountId, userId, '>> productSearch');
        var query = {};
        if(filter){
            query._shortVendorName = new RegExp('^' + filter);
        }
        
        if(term){
            term = term.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&');
            var regex = new RegExp('\.*'+term+'\.*', 'i');
            var orQuery = [                    
                {OITM_ItemName:regex}
            ];
            if(!filter){
                orQuery = [                    
                    {OITM_ItemName:regex},
                    {_shortVendorName:regex}
                ];
            }
            query["$or"] = orQuery;
        }

        self.log.debug('query:', query);

        var fields = null;
        var collection = 'inventory';
        var _skip = skip || 0;
        var _limit = limit || 0;

        self._addUserInventoryFilter(accountId, userId, query, function(err, query){
            ziDao.findRawWithFieldsLimitAndOrder(query, _skip, _limit, sortBy, fields, collection, sortDir, function(err, value){
                if(err) {
                    self.log.error(accountId, userId, 'Error searching cached products:', err);
                    fn(err);
                } else {
                    self.log.debug(accountId, userId, '<< productSearch');
                    fn(null, value);
                }
            });
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
        self._addUserInventoryFilter(accountId, userId, query, function(err, query){
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
        });

    },

    participantSearch: function(accountId, userId, term, skip, limit, sortBy, sortDir, fn) {
        var self = this;
        self.log.debug(accountId, userId, '>> participantSearch');
        
        var query = {};
        if(term){
            term = term.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&');
            var regex = new RegExp('\.*'+term+'\.*', 'i');
            var orQuery = [                    
                {OCRD_CardCode:regex},
                {OCRD_CardName:regex}
            ];
            query["$or"] = orQuery;       
        }

        self.log.debug('query:', query);

        var fields = null;
        var collection = 'customer';
        var _skip = skip || 0;
        var _limit = limit || 0;

        
        ziDao.findRawWithFieldsLimitAndOrder(query, skip, limit, sortBy, fields, collection, sortDir, function(err, value){
            if(err) {
                self.log.error(accountId, userId, 'Error searching participantsh:', err);
                fn(err);
            } else {
                self.log.debug(accountId, userId, '<< participantSearch');
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
            } else if(!value){
                fn(ERR_MSG);
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
        var query = {};
        if(cardCodeAry && cardCodeAry.length > 0 && cardCodeAry[0] === 'admin') {

        } else{
            var optRegexp = [];
            cardCodeAry.forEach(function(opt){
                optRegexp.push(  new RegExp(opt, "i") );
            });
            query._CustStatmentHdr_CardCode = {$in: optRegexp};
        }

        var stageAry = [];
        var match = {$match:query};
        stageAry.push(match);

        var group = {
            $group: {_id: "$_CustStatmentDtl_TransId",
                totalInvoice: { $sum: "$INV1_LineTotal" },
                items: {
                    $push: {
                        cardCode: "$_CustStatmentHdr_CardCode",
                        dueDate: "$_CustStatmentDtl_DueDate",
                        currency: "$_CustStatmentHdr_Currency"
                        
                    }
                }
            }
        };
        stageAry.push(group);

        
        ziDao.aggregateWithCustomStagesAndCollection(stageAry, 'ledger', function(err, resultAry){
            if(err) {
                self.log.error(accountId, userId, 'Error searching cached ledger:', err);
                fn(err);
            } else {
                self.log.debug(accountId, userId, '<< getLedgerWithLimit');
                if(limit > 0) {
                    resultAry = _.first(_.sortBy(resultAry, function(result) { 
                        return result.items[0].dueDate && Date.parse(result.items[0].dueDate) }),
                    limit);
                }
                fn(err, resultAry);
            }
        });
        

        // ziDao.findRawWithFieldsLimitAndOrder(query, null, null, null, null, "ledger", null, function(err, resultAry){
        //     if(err) {
        //         self.log.error(accountId, userId, 'Error searching cached ledger:', err);
        //         fn(err);
        //     } else {

        //         var groupResultObject = _.groupBy(resultAry.results, function(result){
        //             return result._CustStatmentDtl_TransId
        //         });

        //         var groupResultArray =  _(groupResultObject).map(function(g, key) {
        //             return { 
        //                 invoiceNumber: key,
        //                 cardCode: g[0]._CustStatmentHdr_CardCode,
        //                 dueDate: g[0]._CustStatmentDtl_DueDate,
        //                 currency: g[0]._CustStatmentHdr_Currency,
        //                 totalInvoice: _(g).reduce(function(m,x) { return m + parseFloat(x.INV1_LineTotal) ; }, 0) };
        //             });
                


        //         self.log.debug(accountId, userId, '<< getLedgerWithLimit');
        //         fn(err, resultAry);
        //     }
        // });
        
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
                //value = self.getParsedJson(value);
                if(value === false){
                    return fn(ERR_MSG);
                }
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
                    if(row.OITM_ItemName) {
                        row._itemName = row.OITM_ItemName.toLowerCase();
                    }
                    if(row.OITM_U_dscription) {
                        row._description = row.OITM_U_dscription.toLowerCase();
                    }
                    if(row.OMRC_FirmName) {
                        if(row.OMRC_FirmName === 'Juniper Hardware') {
                            row._firmName = '_' + row.OMRC_FirmName.toLowerCase();
                        } else {
                            row._firmName = row.OMRC_FirmName.toLowerCase();
                        }
                        row._vendorName = row.OMRC_FirmName.toLowerCase();
                        row._shortVendorName = self._getTruncatedVendorName(row._vendorName);
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

    getCustomers: function(accountId, userId, cardCodeAry, skip, limit, sortBy, sortDir, term, fieldSearch, fn) {
        var self = this;
        self.log.debug(accountId, userId, '>> getCustomers');
        var query = {};
        if(cardCodeAry && cardCodeAry.length > 0 && cardCodeAry[0] === 'admin') {

        }
        else{
            var optRegexp = [];
            cardCodeAry.forEach(function(opt){
                optRegexp.push(  new RegExp(opt, "i") );
            });
            query.OCRD_CardCode = {$in:optRegexp};
        }
        
        var fields = null;
        var collection = 'customer'; 

        if(term){
            term = term.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&');   
            var regex = new RegExp('\.*'+term+'\.*', 'i');
            var orQuery = [                          
                {OCRD_CardCode:regex},
                {OCRD_CardName:regex},
                {OCRD_Phone1:regex},
                {OCRD_Fax:regex},
                {OCRD_Address:regex},
                {OCRD_City:regex},
                {OCRD_State1:regex},
                {OCRD_ZipCode:regex}
            ];
            query["$or"] = orQuery;
        }
        if(fieldSearch){
            var fieldSearchArr = [];
            for(var i=0; i <= Object.keys(fieldSearch).length - 1; i++){
                var key = Object.keys(fieldSearch)[i];
                var value = fieldSearch[key];
                self.log.debug('value:', value);                
                var obj = {};
                value = value.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&');                
                if(value){                    
                    obj[key] = new RegExp(value, 'i');                    
                    fieldSearchArr.push(obj);
                }
            }
            if(fieldSearchArr.length){
                query["$and"] = fieldSearchArr;
            }
        }      
        self.log.debug('query:', query);
        ziDao.findRawWithFieldsLimitAndOrder(query, skip, limit, sortBy, fields, collection, sortDir, function(err, value){
            if(err) {
                self.log.error(accountId, userId, 'Error searching cached customers:', err);
                fn(err);
            } else {
                self.log.debug(accountId, userId, '<< getCustomers');
                fn(null, value);
            }
        });
    },

    getCustomerNameForCardCode: function(accountId, userId, cardCode, fn) {
        var self = this;
        self.log.debug(accountId, userId, '>> getCustomerNameForCardCode [' + cardCode + ']');
        if(!cardCode) {
            self.log.error(accountId, userId, 'No card code specified');
            return fn('No card code specified');
        }
        var query = {'OCRD_CardCode': new RegExp(cardCode, 'i')};
        var collection = 'customer';
        ziDao.findRawWithFieldsLimitAndOrder(query, 0, 1, null, null, collection, null, function(err, resp) {
            if(err) {
                self.log.error(accountId, userId, 'Error getting customer:', err);
                fn(err);
            } else {
                var companyName = '';
                if(resp && resp.results && resp.results.length) {
                    companyName = resp.results[0].OCRD_CardName;
                }
                if(companyName === '') {
                    self.log.warn('Could not match a card code:' + cardCode, cardCode);
                }
                self.log.debug(accountId, userId, '<< getCustomerNameForCardCode');
                fn(null, companyName);
            }
        });
    },

    runInventoryJob:function() {
        var self = this;
        self.log.debug(0, 0, '>> runInventoryJob');
        try {
            self.loadInventoryCollection(function () {
                self.log.debug(0,0, 'Loading customers');
                self.loadCustomerCollection(function(){
                    self.log.debug(0,0, 'Loading ledger');
                    var dateString = moment().format("M/DD/YY");
                    self.loadLedgerCollection(dateString, function(){
                        self.log.debug(0,0, 'Scheduling next run');
                        //schedule next run

                        var code = '$$.u.ziManager.runInventoryJob();';
                        var send_at = moment().minute(0);

                        send_at = moment(send_at).add(1, 'hours');
                        self.log.debug('Scheduling ahead an hour');

                        var scheduledJob = new $$.m.ScheduledJob({
                            accountId: 0,
                            scheduledAt: moment(send_at).toDate(),
                            runAt: null,
                            job: code
                        });
                        scheduledJobsManager.scheduleJob(scheduledJob, function (err, value) {
                            if (err || !value) {
                                self.log.error(0, 0, 'Error scheduling job with manager:', err);
                            } else {
                                self.log.debug(0, 0, 'scheduled next job:', value.get('scheduledAt'));
                            }
                            self.log.debug(0, 0, '<< runInventoryJob');
                        });
                    });
                });

            });
        } catch(exception) {
            self.log.error('Error scheduling inventoryjob:', exception);
            emailMessageManager.notifyAdmin('devops@indigenous.io', 'devops@indigenous.io', null,
                'Error loading scheduled inventory:', '', exception, function(_err, value){
                    fn(err);
                });
        }
    },

    loadCustomerCollection: function(fn) {
        var self = this;
        self.log.debug(0, 0, '>> loadCustomerCollection');
        var path = 'query/Indigenous/CustomerList.aspx?accept=application/json';

        self._ziRequest(path, function(err, value) {
            if(err) {
                self.log.error(0,0, 'Error loading customers:', err);
                fn();
            } else {
                //value = self.getParsedJson(value);
                if(value === false){
                    return fn(ERR_MSG);
                }
                if(value && value.response && value.response.payload && value.response.payload.querydata && value.response.payload.querydata.data){
                    var data = value.response.payload.querydata.data.row;
                    _.each(data, function(row){
                        try {
                            row.OCRD_CardCode = row.OCRD_CardCode;
                        } catch(e) {
                            self.log.error('Error parsing row [' + row['@id'] + '.OCRD_CardCode', e);
                        }
                        try {
                            row.OCRD_CardName = row.OCRD_CardName;
                        } catch(e) {
                            self.log.error('Error parsing row [' + row['@id'] + '.OCRD_CardName', e);
                        }
                        try {
                            row.OCRD_Phone1 = row.OCRD_Phone1;
                        } catch(e) {
                            self.log.error('Error parsing row [' + row['@id'] + '.OCRD_Phone1', e);
                        }
                        try {
                            row.OCRD_Currency = row.OCRD_Currency;
                        } catch(e) {
                            self.log.error('Error parsing row [' + row['@id'] + '.OCRD_Currency', e);
                        }
                        try {
                            row.OCRD_Address = row.OCRD_Address;
                        } catch(e) {
                            self.log.error('Error parsing row [' + row['@id'] + '.OCRD_Address', e);
                        }
                        try {
                            row.OCRD_City = row.OCRD_City;
                        } catch(e) {
                            self.log.error('Error parsing row [' + row['@id'] + '.OCRD_City', e);
                        }
                        try {
                            row.OCRD_State1 = row.OCRD_State1;
                        } catch(e) {
                            self.log.error('Error parsing row [' + row['@id'] + '.OCRD_State1', e);
                        }
                        try {
                            row.OCRD_ZipCode = row.OCRD_ZipCode;
                        } catch(e) {
                            self.log.error('Error parsing row [' + row['@id'] + '.OCRD_ZipCode', e);
                        }                   
                        if(row.OCRD_CardName) {
                            row._cardName = row.OCRD_CardName.toLowerCase();
                        }
                        if(row.OCRD_City) {
                            row._city = row.OCRD_City.toLowerCase();
                        }
                        if(row.OCRD_State1) {
                            row._state = row.OCRD_State1.toLowerCase();
                        }
                        if(row.OCRD_ZipCode) {
                            row._zip = parseInt(row.OCRD_ZipCode);
                        }
                    });
                    self.log.debug(0,0, 'Bulk inserting [' + data.length + '] records');
                    ziDao.dropCollection('new_customer', function(){
                        ziDao.bulkInsert(data, 'new_customer', function(err, value){
                            if(!err) {
                                ziDao.renameCollection('new_customer', 'customer', function(err, value){
                                    self.log.debug(0, 0, '<< loadCustomerCollection');
                                    fn(err, value);
                                });
                            } else {
                                self.log.error('Error during bulk insert:', err);
                                fn(err);
                            }

                        });
                    });
                }
                else{
                    self.log.error('Unable to get data from api');
                }
            }
        });
    },

    loadLedgerCollection: function(dateString, fn) {
        var self = this;
        self.log.debug(0, 0, '>> loadLedgerCollection');
        var path = 'query/Indigenous/CustomerAging2.aspx?0=0&1=L9999999&2=' + dateString + '&accept=application/json';

        self._ziRequest(path, function(err, value) {
            if(err) {
                self.log.error(0,0, 'Error loading ledger collection:', err);
                fn();
            } else {
                //value = self.getParsedJson(value);
                if(value === false){
                    return fn(ERR_MSG);
                }

                if(value && value.response && value.response.payload && value.response.payload.querydata && value.response.payload.querydata.data){
                    var data = value.response.payload.querydata.data.row;
                    _.each(data, function(row){
                        try {
                            row.CompanyName = row.CompanyName;
                        } catch(e) {
                            self.log.error('Error parsing row [' + row['@id'] + '.CompanyName', e);
                        }
                        try {
                            row.CompanyAddr = row.CompanyAddr;
                        } catch(e) {
                            self.log.error('Error parsing row [' + row['@id'] + '.CompanyAddr', e);
                        }
                        try {
                            row.Phone = row.Phone;
                        } catch(e) {
                            self.log.error('Error parsing row [' + row['@id'] + '.Phone', e);
                        }
                        try {
                            row.Fax = row.Fax;
                        } catch(e) {
                            self.log.error('Error parsing row [' + row['@id'] + '.Fax', e);
                        }
                        try {
                            row.CompanyCurrency = row.CompanyCurrency;
                        } catch(e) {
                            self.log.error('Error parsing row [' + row['@id'] + '.CompanyCurrency', e);
                        }
                        try {
                            row._CustStatmentHdr_CardCode = row._CustStatmentHdr_CardCode;
                        } catch(e) {
                            self.log.error('Error parsing row [' + row['@id'] + '._CustStatmentHdr_CardCode', e);
                        }
                        try {
                            row._CustStatmentHdr_CardName = row._CustStatmentHdr_CardName;
                        } catch(e) {
                            self.log.error('Error parsing row [' + row['@id'] + '._CustStatmentHdr_CardName', e);
                        }
                        try {
                            row._CustStatmentHdr_CardType = row._CustStatmentHdr_CardType;
                        } catch(e) {
                            self.log.error('Error parsing row [' + row['@id'] + '._CustStatmentHdr_CardType', e);
                        }
                        try {
                            row._CustStatmentHdr_Balance = parseFloat(row._CustStatmentHdr_Balance);
                        } catch(e) {
                            self.log.error('Error parsing row [' + row['@id'] + '._CustStatmentHdr_Balance', e);
                        } 
                        try {
                            row._CustStatmentHdr_BalanceFC = parseFloat(row._CustStatmentHdr_BalanceFC);
                        } catch(e) {
                            self.log.error('Error parsing row [' + row['@id'] + '._CustStatmentHdr_BalanceFC', e);
                        } 
                        try {
                            row._CustStatmentHdr_BalanceSys = parseFloat(row._CustStatmentHdr_BalanceSys);
                        } catch(e) {
                            self.log.error('Error parsing row [' + row['@id'] + '._CustStatmentHdr_BalanceSys', e);
                        } 
                        try {
                            row._CustStatmentHdr_Currency = row._CustStatmentHdr_Currency;
                        } catch(e) {
                            self.log.error('Error parsing row [' + row['@id'] + '._CustStatmentHdr_Currency', e);
                        } 
                        try {
                            row._CustStatmentHdr_Address = row._CustStatmentHdr_Address;
                        } catch(e) {
                            self.log.error('Error parsing row [' + row['@id'] + '._CustStatmentHdr_Address', e);
                        } 
                        try {
                            row._CustStatmentHdr_Block = row._CustStatmentHdr_Block;
                        } catch(e) {
                            self.log.error('Error parsing row [' + row['@id'] + '._CustStatmentHdr_Block', e);
                        } 
                        try {
                            row._CustStatmentHdr_City = row._CustStatmentHdr_City;
                        } catch(e) {
                            self.log.error('Error parsing row [' + row['@id'] + '._CustStatmentHdr_City', e);
                        } 
                        try {
                            row._CustStatmentHdr_State1 = row._CustStatmentHdr_State1;
                        } catch(e) {
                            self.log.error('Error parsing row [' + row['@id'] + '._CustStatmentHdr_State1', e);
                        }
                        try {
                            row._CustStatmentHdr_ZipCode = row._CustStatmentHdr_ZipCode;
                        } catch(e) {
                            self.log.error('Error parsing row [' + row['@id'] + '._CustStatmentHdr_ZipCode', e);
                        }
                        try {
                            row._CustStatmentHdr_Country = row._CustStatmentHdr_Country;
                        } catch(e) {
                            self.log.error('Error parsing row [' + row['@id'] + '._CustStatmentHdr_Country', e);
                        }
                        try {
                            row._CustStatmentHdr_AgeCat1 = parseFloat(row._CustStatmentHdr_AgeCat1);
                        } catch(e) {
                            self.log.error('Error parsing row [' + row['@id'] + '._CustStatmentHdr_AgeCat1', e);
                        }
                        try {
                            row._CustStatmentHdr_AgeCat2 = parseFloat(row._CustStatmentHdr_AgeCat2);
                        } catch(e) {
                            self.log.error('Error parsing row [' + row['@id'] + '._CustStatmentHdr_AgeCat2', e);
                        }
                        try {
                            row._CustStatmentHdr_AgeCat3 = parseFloat(row._CustStatmentHdr_AgeCat3);
                        } catch(e) {
                            self.log.error('Error parsing row [' + row['@id'] + '._CustStatmentHdr_AgeCat3', e);
                        }
                        try {
                            row._CustStatmentHdr_AgeCat4 = parseFloat(row._CustStatmentHdr_AgeCat4);
                        } catch(e) {
                            self.log.error('Error parsing row [' + row['@id'] + '._CustStatmentHdr_AgeCat4', e);
                        }
                        try {
                            row._CustStatmentHdr_AgeCat5 = parseFloat(row._CustStatmentHdr_AgeCat5);
                        } catch(e) {
                            self.log.error('Error parsing row [' + row['@id'] + '._CustStatmentHdr_AgeCat5', e);
                        }
                        try {
                            row._CustStatmentHdr_AgeCat6 = parseFloat(row._CustStatmentHdr_AgeCat6);
                        } catch(e) {
                            self.log.error('Error parsing row [' + row['@id'] + '._CustStatmentHdr_AgeCat6', e);
                        }
                        try {
                            row._CustStatmentHdr_PymntGroup = row._CustStatmentHdr_PymntGroup;
                        } catch(e) {
                            self.log.error('Error parsing row [' + row['@id'] + '._CustStatmentHdr_PymntGroup', e);
                        }
                        try {
                            row._CustStatmentDtl_BatchNum = parseInt(row._CustStatmentDtl_BatchNum);
                        } catch(e) {
                            self.log.error('Error parsing row [' + row['@id'] + '._CustStatmentDtl_BatchNum', e);
                        }
                        try {
                            row._CustStatmentDtl_TransId = parseInt(row._CustStatmentDtl_TransId);
                        } catch(e) {
                            self.log.error('Error parsing row [' + row['@id'] + '._CustStatmentDtl_TransId', e);
                        }
                        try {
                            row._CustStatmentDtl_TransType = row._CustStatmentDtl_TransType;
                        } catch(e) {
                            self.log.error('Error parsing row [' + row['@id'] + '._CustStatmentDtl_TransType', e);
                        }
                        try {
                            row._CustStatmentDtl_CreatedBy = parseInt(row._CustStatmentDtl_CreatedBy);
                        } catch(e) {
                            self.log.error('Error parsing row [' + row['@id'] + '._CustStatmentDtl_CreatedBy', e);
                        }
                        try {
                            row._CustStatmentDtl_DtlCardCode = row._CustStatmentDtl_DtlCardCode;
                        } catch(e) {
                            self.log.error('Error parsing row [' + row['@id'] + '._CustStatmentDtl_DtlCardCode', e);
                        }
                        try {
                            row._CustStatmentDtl_RefDate = row._CustStatmentDtl_RefDate;
                        } catch(e) {
                            self.log.error('Error parsing row [' + row['@id'] + '._CustStatmentDtl_RefDate', e);
                        }
                        try {
                            row._CustStatmentDtl_TaxDate = row._CustStatmentDtl_TaxDate;
                        } catch(e) {
                            self.log.error('Error parsing row [' + row['@id'] + '._CustStatmentDtl_TaxDate', e);
                        }
                        try {
                            row._CustStatmentDtl_DueDate = row._CustStatmentDtl_DueDate;
                        } catch(e) {
                            self.log.error('Error parsing row [' + row['@id'] + '._CustStatmentDtl_DueDate', e);
                        }
                        try {
                            row._CustStatmentDtl_LineMemo = row._CustStatmentDtl_LineMemo;
                        } catch(e) {
                            self.log.error('Error parsing row [' + row['@id'] + '._CustStatmentDtl_LineMemo', e);
                        }
                        try {
                            row._CustStatmentDtl_Ref1 = row._CustStatmentDtl_Ref1;
                        } catch(e) {
                            self.log.error('Error parsing row [' + row['@id'] + '._CustStatmentDtl_Ref1', e);
                        }
                        try {
                            row._CustStatmentDtl_Amount = parseFloat(row._CustStatmentDtl_Amount);
                        } catch(e) {
                            self.log.error('Error parsing row [' + row['@id'] + '._CustStatmentDtl_Amount', e);
                        }
                        try {
                            row._CustStatmentDtl_SYSCred = parseFloat(row._CustStatmentDtl_SYSCred);
                        } catch(e) {
                            self.log.error('Error parsing row [' + row['@id'] + '._CustStatmentDtl_SYSCred', e);
                        }
                        try {
                            row._CustStatmentDtl_SYSDeb = parseFloat(row._CustStatmentDtl_SYSDeb);
                        } catch(e) {
                            self.log.error('Error parsing row [' + row['@id'] + '._CustStatmentDtl_SYSDeb', e);
                        }
                        try {
                            row._CustStatmentDtl_SourceLine = parseInt(row._CustStatmentDtl_SourceLine);
                        } catch(e) {
                            self.log.error('Error parsing row [' + row['@id'] + '._CustStatmentDtl_SourceLine', e);
                        }
                        try {
                            row._CustStatmentDtl_Document_ID = row._CustStatmentDtl_Document_ID;
                        } catch(e) {
                            self.log.error('Error parsing row [' + row['@id'] + '._CustStatmentDtl_Document_ID', e);
                        }
                        try {
                            row._CustStatmentDtl_Customer_PO_No = row["_CustStatmentDtl_Customer_PO_No."];
                        } catch(e) {
                            self.log.error('Error parsing row [' + row['@id'] + '._CustStatmentDtl_Customer_PO_No.', e);
                        }
                        try {
                            row._CustStatmentDtl_Source_Document_ID = parseInt(row._CustStatmentDtl_Source_Document_ID);
                        } catch(e) {
                            self.log.error('Error parsing row [' + row['@id'] + '._CustStatmentDtl_Source_Document_ID', e);
                        }
                        try {
                            row._CustStatmentDtl_TranType = row._CustStatmentDtl_TranType;
                        } catch(e) {
                            self.log.error('Error parsing row [' + row['@id'] + '._CustStatmentDtl_TranType', e);
                        }
                        try {
                            row._CustStatmentDtl_SAPTranType = row._CustStatmentDtl_SAPTranType;
                        } catch(e) {
                            self.log.error('Error parsing row [' + row['@id'] + '._CustStatmentDtl_SAPTranType', e);
                        }
                        try {
                            row._CustStatmentDtl_MatchNumber = row._CustStatmentDtl_MatchNumber;
                        } catch(e) {
                            self.log.error('Error parsing row [' + row['@id'] + '._CustStatmentDtl_MatchNumber', e);
                        }
                        try {
                            row._CustStatmentDtl_ApplyDocId = row._CustStatmentDtl_ApplyDocId;
                        } catch(e) {
                            self.log.error('Error parsing row [' + row['@id'] + '._CustStatmentDtl_ApplyDocId', e);
                        }
                        try {
                            row._CustStatmentDtl_SortPos = parseInt(row._CustStatmentDtl_SortPos);
                        } catch(e) {
                            self.log.error('Error parsing row [' + row['@id'] + '._CustStatmentDtl_SortPos', e);
                        }
                        try {
                            row._CustStatmentDtl_DocAmount = parseFloat(row._CustStatmentDtl_DocAmount);
                        } catch(e) {
                            self.log.error('Error parsing row [' + row['@id'] + '._CustStatmentDtl_DocAmount', e);
                        }
                        try {
                            row._CustStatmentDtl_Check_Num = parseInt(row._CustStatmentDtl_Check_Num);
                        } catch(e) {
                            self.log.error('Error parsing row [' + row['@id'] + '._CustStatmentDtl_Check_Num', e);
                        }
                        try {
                            row._CustStatmentDtl_DocAmountFC = parseFloat(row._CustStatmentDtl_DocAmountFC);
                        } catch(e) {
                            self.log.error('Error parsing row [' + row['@id'] + '._CustStatmentDtl_DocAmountFC', e);
                        }
                        try {
                            row._CustStatmentDtl_Currency = row._CustStatmentDtl_Currency;
                        } catch(e) {
                            self.log.error('Error parsing row [' + row['@id'] + '._CustStatmentDtl_Currency', e);
                        }
                        try {
                            row.OINV_U_VARPO = row.OINV_U_VARPO;
                        } catch(e) {
                            self.log.error('Error parsing row [' + row['@id'] + '.OINV_U_VARPO', e);
                        }
                        try {
                            row.INV1_LineNum = parseInt(row.INV1_LineNum);
                        } catch(e) {
                            self.log.error('Error parsing row [' + row['@id'] + '.INV1_LineNum', e);
                        }
                        try {
                            row.INV1_VisOrder = parseInt(row.INV1_VisOrder);
                        } catch(e) {
                            self.log.error('Error parsing row [' + row['@id'] + '.INV1_VisOrder', e);
                        }
                        try {
                            row.INV1_ItemCode = row.INV1_ItemCode;
                        } catch(e) {
                            self.log.error('Error parsing row [' + row['@id'] + '.INV1_ItemCode', e);
                        }
                        try {
                            row.INV1_Dscription = row.INV1_Dscription;
                        } catch(e) {
                            self.log.error('Error parsing row [' + row['@id'] + '.INV1_Dscription', e);
                        }
                        try {
                            row.INV1_U_dscription = row.INV1_U_dscription;
                        } catch(e) {
                            self.log.error('Error parsing row [' + row['@id'] + '.INV1_U_dscription', e);
                        }
                        try {
                            row.INV1_Quantity = parseFloat(row.INV1_Quantity);
                        } catch(e) {
                            self.log.error('Error parsing row [' + row['@id'] + '.INV1_Quantity', e);
                        }
                        try {
                            row.INV1_Price = parseFloat(row.INV1_Price);
                        } catch(e) {
                            self.log.error('Error parsing row [' + row['@id'] + '.INV1_Price', e);
                        }
                        try {
                            row.INV1_WhsCode = row.INV1_WhsCode;
                        } catch(e) {
                            self.log.error('Error parsing row [' + row['@id'] + '.INV1_WhsCode', e);
                        }
                        try {
                            row.INV1_LineTotal = parseFloat(row.INV1_LineTotal);
                        } catch(e) {
                            self.log.error('Error parsing row [' + row['@id'] + '.INV1_LineTotal', e);
                        }
                        delete row["_CustStatmentDtl_Customer_PO_No."];

                    });
                    self.log.debug(0,0, 'Bulk inserting [' + data.length + '] records');
                    ziDao.dropCollection('new_ledger', function(){
                        ziDao.bulkInsert(data, 'new_ledger', function(err, value){
                            if(!err) {
                                ziDao.renameCollection('new_ledger', 'ledger', function(err, value){
                                    self.log.debug(0, 0, '<< loadLedgerCollection');
                                    fn(err, value);
                                });
                            } else {
                                self.log.error('Error during bulk insert:', err);
                                fn(err);
                            }

                        });
                    });
                }
                else{
                    self.log.error('Unable to get data from api');
                }
            }
        });
    },

    getLedgerItem: function(accountId, userId, itemId, fn) {
        var self = this;
        self.log.debug(accountId, userId, '>> getLedgerItem');
        var query = {'_CustStatmentHdr_CardCode': new RegExp(itemId, 'i')};
        var collection = 'ledger';
        ziDao.findRawWithFieldsLimitAndOrder(query, null, null, null, null, collection, null, function(err, resp) {
            if(err) {
                self.log.error(accountId, userId, 'Error getting ledger item:', err);
                fn(err);
            } else {
                self.log.debug(accountId, userId, '<< getLedgerItem');
                fn(null, resp);
            }
        });
    },

    exportCustomerStatement: function(accountId, userId, itemId, fn) {
        var self = this;
        self.log.debug(accountId, userId, '>> exportCustomerStatement');
        self.getLedgerItem(accountId, userId, itemId, function(err, value){
            var results = value.results;
            var ledgerDetails = _.uniq(results, function(ld){
                return ld._CustStatmentDtl_TransId;
            });
            _.each(ledgerDetails, function(ledger){
                ledger.invoiceTotal = self._calculateInvoiceTotal(ledger, results);
            })
            var headers = ['Invoice', 'VAR PO', 'Invoice Date', 'Due Date', 'Invoice Total'];
            var csv = headers + '\n';
            _.each(ledgerDetails, function(item){
                csv += self._parseString(item._CustStatmentDtl_Document_ID);
                csv += self._parseString(item.OINV_U_VARPO);
                csv += self._parseString(self._parseValueToDate(item._CustStatmentDtl_RefDate));
                csv += self._parseString(self._parseValueToDate(item._CustStatmentDtl_DueDate));
                csv += self._parseString(self._parseCurrency("$", item.invoiceTotal));
                csv += '\n';
            });
            
            self.log.debug(accountId, userId, '<< exportCustomerStatement');
            fn(null, csv);
        })
    },


    getCustomerItem: function(accountId, userId, itemId, fn) {
        var self = this;
        self.log.debug(accountId, userId, '>> getCustomerItem');
        var query = {'OCRD_CardCode': new RegExp(itemId, 'i')};
        var collection = 'customer';
        ziDao.findRawWithFieldsLimitAndOrder(query, 0, 1, null, null, collection, null, function(err, resp) {
            if(err) {
                self.log.error(accountId, userId, 'Error getting customer item:', err);
                fn(err);
            } else {
                if(resp && resp.results) {
                    self.log.debug(accountId, userId, '<< getCustomerItem');
                    fn(null, resp.results[0]);
                } else {
                    fn();
                }
            }
        });
    },

    getCustomerInvoices: function(accountId, userId, customerId, transactionId, fn) {
        var self = this;
        self.log.debug(accountId, userId, '>> getCustomerInvoices');
        console. log(transactionId);
        console. log(customerId);
        var query = {
            '_CustStatmentHdr_CardCode': new RegExp(customerId, 'i'),
            '_CustStatmentDtl_TransId': transactionId
        };
        var collection = 'ledger';
        ziDao.findRawWithFieldsLimitAndOrder(query, null, null, null, null, collection, null, function(err, resp) {
            if(err) {
                self.log.error(accountId, userId, 'Error getting invoices:', err);
                fn(err);
            } else {
                self.log.debug(accountId, userId, '<< getCustomerInvoices');
                fn(null, resp);
            }
        });
    },

    listVendors: function(accountId, userId, fn) {
        var self = this;
        self.log.debug(accountId, userId, '>> listVendors');
        var query = {};
        var collection = 'inventory';
        var key = "_shortVendorName";
        ziDao.distinctWithCollection(key, query, collection, function(err, resp) {
            if(err) {
                self.log.error(accountId, userId, 'Error getting vendors:', err);
                fn(err);
            } else {
                fn(null, resp);
            }
        });
    },

    customerExists: function(accountId, userId, cardCodes, fn) {
        var self = this;
        self.log.debug(accountId, userId, '>> customerExists [' + cardCodes + ']');
        var query = {};
        var optRegexp = [];
        cardCodes.forEach(function(opt){
            optRegexp.push(  new RegExp(opt, "i") );
        });
        query.OCRD_CardCode = {$in: optRegexp};
        
        var collection = 'customer';
        ziDao.findRawWithFieldsLimitAndOrder(query, null, null, null, null, collection, null, function(err, resp){
            if(err) {
                self.log.error(accountId, userId, 'Error getting customer:', err);
                fn(err);
            } else {
                self.log.debug(accountId, userId, '<< customerExists');
                fn(null, resp);
            }
        });
    },

    _ziRequest: function(path, fn) {
        var self = this;
        var url = ziConfig.ZED_PROTOCOL + ziConfig.ZED_USERNAME + ':' + ziConfig.ZED_PASSWORD + '@' + ziConfig.ZED_ENDPOINT;
        url += path;
        request(url, function(err, resp, body) {
            if(err) {
                var text = 'Error calling url [' + url + ']';
                self.log.error(text, err);

                emailMessageManager.notifyAdmin('devops@indigenous.io', 'devops@indigenous.io', null,
                    'Error calling Zed Interconnect', text, err, function(_err, value){
                    fn(err);
                });

            } else {
                //self.log.debug('got this response:', resp);
                //self.log.debug('got this body:', body);
                var parsedJson;
                try {
                    parsedJson = JSON.parse(body);
                } catch(err) {
                    var text = 'Error parsing response from url [' + url + ']';
                    self.log.error(text, err);
                    emailMessageManager.notifyAdmin('devops@indigenous.io', 'devops@indigenous.io', null,
                        'Error calling Zed Interconnect', text, err, function(_err, value){
                            fn(null, {});
                    });
                }
                fn(null, parsedJson);
            }
        });
    },

    _addUserInventoryFilter: function(accountId, userId, query, fn) {

        userDao.getById(userId, $$.m.User, function(err, user) {
            orgManager.getOrgByAccountId(accountId, userId, function (err, organization) {
                if (!user || !organization) {
                    fn(err);
                } else {
                    var orgConfig = user.getOrgConfig(organization.id());
                    if (orgConfig.inventoryFilter) {
                        query = _.extend(query, orgConfig.inventoryFilter);
                    }
                    fn(null, query);
                }
            });
        });
    },

    _getTruncatedVendorName: function(name){
        var textToRemoveArray = ["hardware", "service", "services", "support", "education", "software", "networks", "license"];
        var _textToRemoveArray = _.map(textToRemoveArray, function(item){
            return " " + item.trim(); 
        })
        var regexString = _textToRemoveArray.join("|");
        var regex = new RegExp(regexString + "\s*$", "gi");
        return name.replace(regex, "");
    },

    _calculateInvoiceTotal: function(ledger, results){
        var _sum = 0;
        if(results){
            var invoiceDetails = _.filter(results, function(row){
                return row._CustStatmentDtl_TransId == ledger._CustStatmentDtl_TransId
            })

            if(invoiceDetails && invoiceDetails.length){
                ledger.lineItems = invoiceDetails.length;

                _.each(invoiceDetails, function(order){
                    if(order.INV1_LineTotal)
                        _sum+= parseFloat(order.INV1_LineTotal);
                })
            }
        }
        return _sum;
    },

    _parseString: function(text){
        if(text==undefined)
            return ',';
        // "" added for number value
        text= "" + text;
        if(text.indexOf(',')>-1)
            return "\"" + text + "\",";
        else
            return text+",";
    },

    _parseCurrency: function(symbol, value){
        return symbol + " " + parseFloat(value).toFixed(2).replace(/(\d)(?=(\d{3})+\.)/g, "$1,");
    },

    _parseValueToDate: function(value){
        if(value){
            var formattedDate = moment(Date.parse(value)).format("M/DD/YYYY");
            return formattedDate;
        }
    }

};
$$.u = $$.u || {};
$$.u.ziManager = ziManager;

module.exports = ziManager;