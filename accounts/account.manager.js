
var LOG = $$.g.getLogger("account.manager");
var accountDao = require('../dao/account.dao');
var appConfig = require('../configs/app.config');
var assetManager = require('../assets/asset_manager');

var async = require('async');

var defaultBusiness = {
    "logo" : '',
    "name" : '',
    "description" : '',
    "category" : '',
    "size" : '',
    "phones" : [],
    "addresses" : [],
    "type" :'',
    "nonProfit" : false,
    "emails": [],
    'splitHours': false,
    'hours': [
        {'day': "Mon", 'start':"9:00 am",'end':"5:00 pm", 'start2':"9:00 am", 'end2':"5:00 pm", 'closed':false, 'split':false, 'wholeday':false},
        {'day': "Tue", 'start':"9:00 am",'end':"5:00 pm", 'start2':"9:00 am", 'end2':"5:00 pm", 'closed':false, 'split':false, 'wholeday':false},
        {'day': "Wed", 'start':"9:00 am",'end':"5:00 pm", 'start2':"9:00 am", 'end2':"5:00 pm", 'closed':false, 'split':false, 'wholeday':false},
        {'day': "Thu", 'start':"9:00 am",'end':"5:00 pm", 'start2':"9:00 am", 'end2':"5:00 pm", 'closed':false, 'split':false, 'wholeday':false},
        {'day': "Fri", 'start':"9:00 am",'end':"5:00 pm", 'start2':"9:00 am", 'end2':"5:00 pm", 'closed':false, 'split':false, 'wholeday':false},
        {'day': "Sat", 'start':"9:00 am",'end':"5:00 pm", 'start2':"9:00 am", 'end2':"5:00 pm", 'closed':true, 'split':false, 'wholeday':false},
        {'day': "Sun", 'start':"9:00 am",'end':"5:00 pm", 'start2':"9:00 am", 'end2':"5:00 pm", 'closed':true, 'split':false, 'wholeday':false}]
};
var defaultBilling = {
    "userId" : '',
    "stripeCustomerId": '',
    "cardToken": '',
    "signupDate": new Date(),
    "trialLength": 31
};

var accountManager = {
    log:LOG,

    copyAccountTemplate:function(accountId, userId, srcAccountId, destSubdomain, fn){
        var self = this;
        self.log.debug(accountId, userId, '>> copyAccountTemplate');
        var rollbackHandler = {};
        var idMap = {};
        async.waterfall([
            function(cb) {
                accountDao.getAccountByID(srcAccountId, cb);
            },
            function(account, cb) {
                if(!account) {
                    cb('source account with id[' + srcAccountId + '] not found');
                } else {
                    //clear out important sections of the account object
                    account.set('_id', '');
                    account.set('subdomain', destSubdomain);
                    account.set('customDomain', '');
                    account.set('domain', '');
                    account.set('token', '');
                    idMap.websiteId = account.get('website').websiteId;
                    account.set('business', defaultBusiness);
                    account.set('billing', defaultBilling);
                    var created = {date:new Date(), by:userId};
                    account.set('created', created);
                    account.set('modified', created);
                    account.set('accountUrl', 'https://' + destSubdomain + '.' + appConfig.subdomain_suffix);
                    account.set('signupPage', 'API');
                    account.set('ownerUser', '');
                    accountDao.saveOrUpdate(account, cb);
                }
            },
            function(account, cb){
                if(!account) {
                    cb('Could not create new account');
                } else {
                    self.log.debug(accountId, userId, 'Created new account with id:' + account.id());
                    self._copyAssets(srcAccountId, account.id(), idMap, function(err, updatedIdMap){

                    });
                }
            }
        ], function(err){

        });
    },

    _copyAssets: function(accountId, userId, srcAccountId, destAccountId, idMap, fn) {
        var self = this;

        assetManager.listAssets(srcAccountId, 0, 0, function(err, assets){
            if(err) {
                self.log.error('Error listing assets:', err);
                fn(err);
            } else {
                async.eachLimit(assets, 10, function(asset, cb){
                    asset.set('_id', null);
                    asset.set('accountId', destAccountId);
                    var created = {date:new Date(), by:userId};
                    asset.set('created', created);
                    asset.set('modified', created);
                    var sourceUrl = asset.get('url');
                    var destUrl = sourceUrl.replace(/account_\d+/g, 'account_' + destAccountId);
                    asset.set('url', destUrl);
                    assetManager.copyS3Asset(accountId, userId, sourceUrl, destUrl, function(err, value){
                        if(err) {
                            self.log.error('Error copying asset:', err);
                            fn(err);
                        } else {
                            assetManager.updateAsset(asset, function(err, value){
                                if(err) {
                                    self.log.error('Error saving asset:', err);
                                    cb();
                                } else {
                                    cb();
                                }
                            });
                        }
                    });
                }, function(err){

                });
            }
        });
    }
};

module.exports = accountManager;
$$.u = $$.u||{};
$$.u.AccountManger = accountManager;