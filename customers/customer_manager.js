/**
 * COPYRIGHT INDIGENOUS SOFTWARE, INC., LLC 2016
 *
 * All use or reproduction of any or all of this content must be approved.
 * Please contact info@indigenous.io for approval or questions.
 */

var dao = require('./dao/customer.dao');
var accountDao = require('../dao/account.dao');
var userManager = require('../dao/user.manager');
var paymentsManager = require('../payments/payments_manager');
var securityManager = require('../security/sm')(false);
var orgDao = require('../organizations/dao/organization.dao');

var log = $$.g.getLogger('customer_manager');
var appConfig = require('../configs/app.config');
var async = require('async');


var s3dao = require('../dao/integrations/s3.dao');
var fs = require('fs');

var tmp = require('temporary');
var awsConfig = require('../configs/aws.config');
var webshot = require('webshot');

module.exports = {

    log:log,

    getMainCustomers: function(accountId, userId, sortBy, sortDir, skip, limit, term, fieldSearch, fn) {
        var self = this;
        self.log.debug(accountId, userId, '>> getMainCustomers');
        var query = {
            _id: {$nin: ['__counter__', 6]}
        };

        query = self._concatQuery(query, term, fieldSearch);

        var fields = null;
        accountDao.findWithFieldsLimitOrderAndTotal(query, skip, limit, sortBy, fields, $$.m.Account, sortDir, function(err, accounts){
            if(err) {
                self.log.error(accountId, userId, 'Error finding accounts:', err);
                return fn(err);
            } else {
                _.each(accounts.results, function(account){

                    var billing = account.get('billing') || {};
                    var trialDays = billing.trialLength || appConfig.trialLength;//using 15 instead of 14 to give 14 FULL days
                    var endDate = moment(billing.signupDate).add(trialDays, 'days');

                    var trialDaysRemaining = endDate.diff(moment(), 'days');
                    if(trialDaysRemaining < 0) {
                        trialDaysRemaining = 0;
                    }
                    account.set('trialDaysRemaining', trialDaysRemaining);
                });
                self.log.debug(accountId, userId, '<< getMainCustomers');
                return fn(null, accounts);
            }

        });
    },

    getOrganizationCustomers: function(accountId, userId, orgId, sortBy, sortDir, skip, limit, term, fieldSearch, fn) {
        var self = this;
        self.log.debug(accountId, userId, '>> getOrganizationCustomers');
        var query = {
            orgId: orgId
        };
        query = self._concatQuery(query, term, fieldSearch);
        var fields = null;
        accountDao.findWithFieldsLimitOrderAndTotal(query, skip,limit, sortBy, fields, $$.m.Account, sortDir, function(err, accounts){
            if(err) {
                self.log.error(accountId, userId, 'Error finding accounts:', err);
                return fn(err);
            } else {
                _.each(accounts.results, function(account){

                    var billing = account.get('billing') || {};
                    var trialDays = billing.trialLength || appConfig.trialLength;//using 15 instead of 14 to give 14 FULL days
                    var endDate = moment(billing.signupDate).add(trialDays, 'days');

                    var trialDaysRemaining = endDate.diff(moment(), 'days');
                    if(trialDaysRemaining < 0) {
                        trialDaysRemaining = 0;
                    }
                    account.set('trialDaysRemaining', trialDaysRemaining);
                });
                self.log.debug(accountId, userId, '<< getOrganizationCustomers');
                return fn(null, accounts);
            }
        });
    },

    getCustomers: function(accountId, userId, sortBy, sortDir, skip, limit, term, fieldSearch, fn) {
        fn(null, null);
    },


    getMainCustomerCount: function(accountId, userId, fn) {
        var self = this;
        self.log.debug(accountId, userId, '>> getMainCustomerCount');
        var query = {
            _id: {$nin: ['__counter__', 6]}
        };
        accountDao.findCount(query, $$.m.Account, function(err, count){
            if(err) {
                self.log.error(accountId, userId, 'Error getting customer count:', err);
                fn(err);
            } else {
                self.log.debug(accountId, userId, '<< getMainCustomerCount', count);
                fn(null, count);
            }
        });
    },

    getOrganizationCustomerCount: function(accountId, userId, orgId, fn) {
        var self = this;
        self.log.debug(accountId, userId, '>> getOrganizationCustomerCount');
        var query = {
            orgId: orgId
        };
        
        accountDao.findCount(query, $$.m.Account, function(err, count){
            if(err) {
                self.log.error(accountId, userId, 'Error getting customer count:', err);
                fn(err);
            } else {
                self.log.debug(accountId, userId, '<< getOrganizationCustomerCount', count);
                fn(null, count);
            }
        });
    },

    getCustomerCount: function(accountId, userId, fn) {
        fn(null, 0);
    },

    getOrgCustomer: function(req,accountId, userId, customerId, orgDomain, fn) {
        var self = this;
        self.log.debug(accountId, userId, '>> getOrgCustomer');

        async.waterfall([
            function(cb) {
                orgDao.getByOrgDomain(orgDomain, cb);
            },
            function(organization, cb) {
                if(!organization) {
                    cb('Organization not found');
                } else {
                    var query = {_id:customerId, orgId: organization.id()};
                    accountDao.findOne(query, $$.m.Account, function(err, account){
                        if(account) {
                            var billing = account.get('billing') || {};
                            var trialDays = billing.trialLength || appConfig.trialLength;//using 15 instead of 14 to give 14 FULL days
                            var endDate = moment(billing.signupDate).add(trialDays, 'days');

                            var trialDaysRemaining = endDate.diff(moment(), 'days');
                            if(trialDaysRemaining < 0) {
                                trialDaysRemaining = 0;
                            }
                            account.set('trialDaysRemaining', trialDaysRemaining);

                            if(account.orgId==appConfig.leadSourceOrgID){
                                account.set('accountIsActive', "Account is Active");
                                cb(null, account);
                            }else{
                                securityManager.verifySubscriptionWithoutSettingSessionVariables(req, customerId, function(err, isValid){
                                    if(account.orgId==appConfig.leadSourceOrgID || isValid){
                                        account.set('accountIsActive', "Account is Active");
                                    }else{
                                        account.set('accountIsActive', "Account is Inactive");
                                    }
                                    cb(err, account);
                                });
                            }
                        } else {
                            cb('account not found', null);
                        }
                    });
                }

            },
            function(account, cb) {
                userManager.getUserAccounts(customerId, false, function(err, users){
                    if(err) {
                        cb(err);
                    } else {
                        var userAry = [];
                        _.each(users, function(user){
                            userAry.push(user.toJSON('public', {accountId:customerId}));
                        });
                        if(account) {
                            account.set('users', userAry);
                        }

                        cb(null, account);
                    }

                });
            },
            function(account, cb) {
                paymentsManager.listInvoicesForAccount(account, null, null, null, null, null, function(err, invoices){
                    if(err) {
                        cb(err);
                    } else {
                        account.set('invoices', invoices.data);
                        _.each(invoices.data, function(invoice){
                            invoice.period_start = moment.unix(invoice.period_start).toDate();
                            invoice.period_end = moment.unix(invoice.period_end).toDate();
                            invoice.date = moment.unix(invoice.date).toDate();
                        });
                        self.log.debug('invoices:', invoices);
                        cb(null, account);
                    }
                });
            },
            function(account, cb) {
                //this is too slow.  hardcode testing data:
                var testing = false;
                if(testing) {
                    var totalCharges = 3135.75;
                    account.set('chargeDetails', {totalCharges:totalCharges});
                    cb(null, account);
                } else {
                    paymentsManager.listChargesForAccount(account, null, null, null, null, null, function(err, charges){
                        if(err) {
                            cb(err);
                        } else {
                            //self.log.debug('charges:', charges);
                            var flatCharges = _.flatten(charges.data);
                            account.set('charges', flatCharges);
                            var totalCharges = 0;
                            var totalRefunds = 0;
                            var totalFees = 0;
                            _.each(flatCharges, function(charge){
                                //self.log.debug('charge:', charge);
                                totalCharges += charge.amount || 0;
                                totalRefunds += charge.amount_refunded || 0;
                                totalFees += charge.fee || 0;
                            });
                            if(totalCharges > 0) {
                                totalCharges = totalCharges / 100;
                            }
                            if(totalRefunds > 0) {
                                totalRefunds = totalRefunds / 100;
                            }
                            if(totalFees > 0) {
                                totalFees = totalFees / 100;
                            }
                            account.set('chargeDetails', {totalCharges:totalCharges, totalRefunds:totalRefunds, totalFees: totalFees});
                            cb(null, account);
                        }
                    });
                }


            }
        ], function(err, customer){
            if(err) {
                self.log.error(accountId, userId, 'Error getting customer:', err);
                return fn(err);
            } else {
                self.log.debug(accountId, userId, '<< getMainCustomer');
                return fn(null, customer);
            }

        });
    },

    getMainCustomer: function(req,accountId, userId, customerId, fn) {
        var self = this;
        self.log.debug(accountId, userId, '>> getMainCustomer');

        async.waterfall([
            function(cb) {
                accountDao.getAccountByID(customerId, function(err, account){
                    if(account) {
                        var billing = account.get('billing') || {};
                        var trialDays = billing.trialLength || appConfig.trialLength;//using 15 instead of 14 to give 14 FULL days
                        var endDate = moment(billing.signupDate).add(trialDays, 'days');

                        var trialDaysRemaining = endDate.diff(moment(), 'days');
                        if(trialDaysRemaining < 0) {
                            trialDaysRemaining = 0;
                        }
                        account.set('trialDaysRemaining', trialDaysRemaining);

                        if(account.orgId==appConfig.leadSourceOrgID){
                                account.set('accountIsActive', "Account is Active");
                                cb(null, account);
                        }else{
                            securityManager.verifySubscriptionWithoutSettingSessionVariables(req, customerId, function(err, isValid){
                                if(account.orgId==appConfig.leadSourceOrgID || isValid){
                                    account.set('accountIsActive', "Account is Active");
                                }else{
                                    account.set('accountIsActive', "Account is Inactive");
                                }
                                cb(err, account);
                            });
                            }                        
                    } else {
                        cb('account not found', null);
                    }

                });
            },
            function(account, cb) {
                userManager.getUserAccounts(customerId, false, function(err, users){
                    if(err) {
                        cb(err);
                    } else {
                        var userAry = [];
                        _.each(users, function(user){
                            userAry.push(user.toJSON('public', {accountId:customerId}));
                        });
                        if(account) {
                            account.set('users', userAry);
                        }

                        cb(null, account);
                    }

                });
            },
            function(account, cb) {
                paymentsManager.listInvoicesForAccount(account, null, null, null, null, null, function(err, invoices){
                    if(err) {
                        cb(err);
                    } else {
                        account.set('invoices', invoices.data);
                        _.each(invoices.data, function(invoice){
                            invoice.period_start = moment.unix(invoice.period_start).toDate();
                            invoice.period_end = moment.unix(invoice.period_end).toDate();
                            invoice.date = moment.unix(invoice.date).toDate();
                        });
                        self.log.debug('invoices:', invoices);
                        cb(null, account);
                    }
                });
            },
            function(account, cb) {
                //this is too slow.  hardcode testing data:
                var testing = false;
                if(testing) {
                    var totalCharges = 3135.75;
                    account.set('chargeDetails', {totalCharges:totalCharges});
                    cb(null, account);
                } else {
                    paymentsManager.listChargesForAccount(account, null, null, null, null, null, function(err, charges){
                        if(err) {
                            cb(err);
                        } else {
                            //self.log.debug('charges:', charges);
                            var flatCharges = _.flatten(charges.data);
                            account.set('charges', flatCharges);
                            var totalCharges = 0;
                            var totalRefunds = 0;
                            var totalFees = 0;
                            _.each(flatCharges, function(charge){
                                //self.log.debug('charge:', charge);
                                totalCharges += charge.amount || 0;
                                totalRefunds += charge.amount_refunded || 0;
                                totalFees += charge.fee || 0;
                            });
                            if(totalCharges > 0) {
                                totalCharges = totalCharges / 100;
                            }
                            if(totalRefunds > 0) {
                                totalRefunds = totalRefunds / 100;
                            }
                            if(totalFees > 0) {
                                totalFees = totalFees / 100;
                            }
                            account.set('chargeDetails', {totalCharges:totalCharges, totalRefunds:totalRefunds, totalFees: totalFees});
                            cb(null, account);
                        }
                    });
                }


            }
        ], function(err, customer){
            if(err) {
                self.log.error(accountId, userId, 'Error getting customer:', err);
                return fn(err);
            } else {
                self.log.debug(accountId, userId, '<< getMainCustomer');
                return fn(null, customer);
            }

        });

    },


    getSingleCustomer: function(accountId, userId, customerId, fn) {
        var self = this;
        self.log.debug(accountId, userId, '>> getSingleCustomer');
        accountDao.getAccountByID(customerId, function(err, account){
            if(err) {
                self.log.error(accountId, userId, 'Error getting customer:', err);
                return fn(err);
            } else {
                self.log.debug(accountId, userId, '<< getSingleCustomer');
                return fn(null, account);
            }
        });
    },

    getSingleOrgCustomer: function(accountId, userId, customerId, orgDomain, fn) {
        var self = this;
        self.log.debug(accountId, userId, '>> getSingleOrgCustomer');
        orgDao.getByOrgDomain(orgDomain, function(err, organization){
            if(err) {
                self.log.error(accountId, userId, 'Error getting organization:', err);
                fn(err);
            } else if(!organization) {
                self.log.error(accountId, userId, 'Organization was not found');
                fn('Organization was not found');
            } else {
                var query = {_id:customerId, orgId:organization.id()};
                accountDao.findOne(query, $$.m.Account, function(err, account){
                    self.log.debug(accountId, userId, '<< getSingleOrgCustomer');
                    return fn(null, account);
                });
            }
        });
    },

    addOrgCustomerNotes: function(accountId, userId, customerId, note, orgDomain, fn) {
        var self = this;
        self.log.debug(accountId, userId, '>> addOrgCustomerNotes');
        orgDao.getByOrgDomain(orgDomain, function(err, organization){
            if(err) {
                self.log.error(accountId, userId, 'Error getting organization:', err);
                fn(err);
            } else if(!organization) {
                self.log.error(accountId, userId, 'No organization found');
                fn('No organization found');
            } else {
                accountDao.getAccountByIdAndOrg(customerId, organization.id(), function(err, account){
                    if(account) {
                        var date = moment();
                        var notes = account.get("notes") || [];
                        var _noteToPush = {
                            note: note,
                            user_id: userId,
                            date: date.toISOString()
                        };
                        notes.push(_noteToPush);
                        account.set("notes", notes);
                        self.log.debug(notes);

                        accountDao.saveOrUpdate(account, function(err, savedCustomer){
                            if(err) {
                                self.log.error(accountId, userId, 'Error saving customer notes:', err);
                                return fn(err);
                            } else {
                                self.log.debug(accountId, userId, '<< addCustomerNotes');
                                return fn(null, savedCustomer);
                            }
                        });
                    } else {
                        return fn('account not found', null);
                    }
                });
            }
        });
    },

    addCustomerNotes: function(accountId, userId, customerId, note, fn) {
        var self = this;
        self.log.debug(accountId, userId, '>> addCustomerNotes');
        accountDao.getAccountByID(customerId, function(err, account){
            if(account) {
                var date = moment();
                var notes = account.get("notes") || [];
                var _noteToPush = {
                    note: note,
                    user_id: userId,
                    date: date.toISOString()
                };
                notes.push(_noteToPush);
                account.set("notes", notes);
                self.log.debug(notes);
                
                accountDao.saveOrUpdate(account, function(err, savedCustomer){
                    if(err) {
                        self.log.error(accountId, userId, 'Error saving customer notes:', err);
                        return fn(err);
                    } else {
                        self.log.debug(accountId, userId, '<< addCustomerNotes');
                        return fn(null, savedCustomer);
                    }
                });
            } else {
                return fn('account not found', null);
            }

        });
    },

    updateCustomerInsights: function(accountId, userId, customerId, customerDetails, fn) {
        var self = this;
        self.log.debug(accountId, userId, '>> updateCustomerInsights');
        accountDao.getAccountByID(customerId, function(err, account){
            if(account) {
                var emailPreferences = account.get('email_preferences');
                emailPreferences.receiveInsights = customerDetails.receiveInsights;
                accountDao.saveOrUpdate(account, function(err, savedCustomer){
                    if(err) {
                        self.log.error("Error saving account:", err);
                        return fn(err);
                    } else {
                        self.log.debug(accountId, userId, '<< updateCustomerInsights');
                        fn(null, savedCustomer);
                    }
                });
            } else {
                self.log.error('Account not found');
                return fn('account not found');
            }
        });
    },

    updateCustomerOEM: function(accountId, userId, customerId, oem, fn) {
        var self = this;
        self.log.debug(accountId, userId, '>> updateCustomerOEM');
        accountDao.getAccountByID(customerId, function(err, account){
            if(account) {
                account.set('oem', oem);
                accountDao.saveOrUpdate(account, function(err, savedCustomer){
                    if(err) {
                        self.log.error("Error saving account:", err);
                        return fn(err);
                    } else {
                        self.log.debug(accountId, userId, '<< updateCustomerOEM');
                        fn(null, savedCustomer);
                    }
                });
            } else {
                self.log.error('Account not found');
                return fn('account not found');
            }
        });
    },

    updateCustomerShowHide: function(accountId, userId, customerId, customerDetails, fn) {
        var self = this;
        self.log.debug(accountId, userId, '>> updateCustomerShowHide');
        accountDao.getAccountByID(customerId, function(err, account){
            if(account) {
                account.set('showhide', customerDetails);
                accountDao.saveOrUpdate(account, function(err, savedCustomer){
                    if(err) {
                        self.log.error("Error saving account:", err);
                        return fn(err);
                    } else {
                        self.log.debug(accountId, userId, '<< updateCustomerShowHide');
                        fn(null, savedCustomer);
                    }
                });
            } else {
                self.log.error('Account not found');
                return fn('account not found');
            }
        });
    },

    updateCustomerTemplateAccount: function(accountId, userId, customerId, customerDetails, fn) {
        var self = this;
        self.log.debug(accountId, userId, '>> updateCustomerTemplateAccount');
        accountDao.getAccountByID(customerId, function(err, account){
            if(account) {
                var date = moment();
                
                account.set("isTemplateAccount", customerDetails.isTemplateAccount);                
                account.set("templateImageUrl", customerDetails.templateImageUrl);

                accountDao.saveOrUpdate(account, function(err, savedCustomer){
                    if(err) {
                        self.log.error(accountId, userId, 'Error saving customer template account:', err);
                        return fn(err);
                    } else {
                        self.log.debug(accountId, userId, '<< updateCustomerTemplateAccount');
                        if(customerDetails.generateScreenCap){
                            self.generateScreenshot(customerId, accountId, "index", function(err, url){
                                if(err) {
                                    self.log.error(accountId, userId, 'Error saving customer template account:', err);
                                    return fn(err);
                                } else{
                                    savedCustomer.set("templateImageUrl", url);
                                    accountDao.saveOrUpdate(account, function(err, updatedCustomer){
                                        if(err) {
                                            self.log.error(accountId, userId, 'Error saving customer template account:', err);
                                            return fn(err);
                                        }
                                        else{
                                            return fn(null, updatedCustomer);
                                        }
                                    })
                                }
                            });
                        } else{
                          return fn(null, savedCustomer);  
                        }
                        
                    }
                });
            } else {
                return fn('account not found', null);
            }

        });
    },

    refreshTemplateImage: function(accountId, userId, customerId, fn) {
        var self = this;
        self.log.debug(accountId, userId, '>> updateCustomerTemplateAccount');
        accountDao.getAccountByID(customerId, function(err, account){
            if(account) {
                var date = moment();
                self.generateScreenshot(customerId, accountId, "index", function(err, url){
                    if(err) {
                        self.log.error(accountId, userId, 'Error saving customer template account:', err);
                        return fn(err);
                    } else{
                        account.set("templateImageUrl", url);
                        accountDao.saveOrUpdate(account, function(err, updatedCustomer){
                            if(err) {
                                self.log.error(accountId, userId, 'Error saving customer template account:', err);
                                return fn(err);
                            }
                            else{
                                return fn(null, updatedCustomer);
                            }
                        })
                    }
                });
            } else {
                return fn('requested customer not found', null);
            }

        });
    },

    generateScreenshot: function(customerId, accountId,  pageHandle, fn) {
        var self = this;
        log.debug('>> generateScreenshot');
        
        accountDao.getServerUrlByAccount(customerId, function(err, serverUrl){
            if(err) {
                log.error('Error getting server url: ' + err);
                return fn(err, null);
            }


            if(serverUrl.indexOf('.local') >0) {
                serverUrl = serverUrl.replace('indigenous.local:3000', 'test.indigenous.io');
            }
            log.debug('got server url', serverUrl);

            var name = customerId + "_" + new Date().getTime() + '.png';
            var tempFile = {
                name: name,
                path: './tmp/' + name
            };
            var tempFileName = tempFile.path;
            //var ssURL = "http://bozu.test.indigenous.io/";
            var bucket = awsConfig.BUCKETS.ASSETS;
            var subdir = 'account_' + accountId;
            
            if(serverUrl.substring(0, 5) == 'http:') {
              serverUrl = serverUrl.substring(5, serverUrl.length);
            }
            //serverUrl = 'http://jupiter.test.indigenous.io';
            self._download(serverUrl, tempFileName, function(){
                log.debug('stored screenshot at ' + tempFileName, tempFile.path);
                tempFile.type = 'image/png';
                s3dao.uploadToS3(bucket, subdir, tempFile, null, function(err, value){
                    //fs.unlink(tempFile.path, function(err, value){});
                    if(err) {
                        log.error('Error uploading to s3: ' + err);
                        fn(err, null);
                    } else {
                        log.debug('Got the following from S3', value);
                        log.debug('<< generateScreenshot');
                        fn(null, 'http://' + bucket + '.s3.amazonaws.com/' + subdir + '/' + tempFile.name);
                    }
                });
            });
        });
    },

    _download: function(uri, file, callback){
        var self = this;
        var options = {
            shotSize: {
                width: 'window',
                height: 'all'
            },
            renderDelay: 15000,
            phantomConfig:{'ignore-ssl-errors': 'true', 'debug':'true', 'ssl-protocol':'any'}
        };
        self.log.debug('calling webshot [' + uri + ']');
        webshot(uri, file, options, function(err) {
            self.log.debug('returned from webshot');
            if(err) {
                self.log.error('Error during webshot:', err);
            }
            callback(file);
        });
    },

    _concatQuery: function(query, term, fieldSearch){
        var self = this;
        if(term){

            term = term.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&');   
            var regex = new RegExp('\.*'+term+'\.*', 'i');
            var orQuery = [
                {_id:parseInt(term)},            
                {subdomain:regex},
                {domain:regex},
                {customDomain:regex},
                {accountUrl: regex},
                {'business.name':regex},
                {'billing.plan':regex},
                {'billing.signupDate':regex},
                {'billing.details.zip':regex},
                {'billing.details.state':regex}
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
                // Filter on email address
                
                if(value){
                    if(key == "_id"){
                        obj[key] = parseInt(value);    
                    } else {
                        obj[key] = new RegExp(value, 'i');
                    }
                    
                    fieldSearchArr.push(obj);
                }
            }
            if(fieldSearchArr.length){
                query["$and"] = fieldSearchArr;
            }
        }
        return query;
    }

};
