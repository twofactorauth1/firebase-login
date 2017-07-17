/**
 * COPYRIGHT INDIGENOUS SOFTWARE, INC., LLC 2017
 *
 * All use or reproduction of any or all of this content must be approved.
 * Please contact info@indigenous.io for approval or questions.
 */

var quoteDao = require('./dao/quote.dao.js');
var log = $$.g.getLogger("quote_manager");
var async = require('async');
var s3dao = require('../dao/integrations/s3.dao.js');
var awsConfig = require('../configs/aws.config');
var appConfig = require('../configs/app.config');
var notificationConfig = require('../configs/notification.config');
var userDao = require('../dao/user.dao');
var emailMessageManager = require('../emailmessages/emailMessageManager');
var userManager = require('../dao/user.manager');
require('./model/quote');
var ziManager = require('../zedinterconnect/zi_manager');

var accountDao = require('../dao/account.dao');
var quoteCartItemDao = require('./dao/quote_cart_item.dao.js');

module.exports = {
	
    listQuoteItems: function(accountId, userId, fn) {
        var self = this;
        self.log = log;
        log.debug(accountId, userId, '>> listQuoteItems');
        var query = {
            'accountId':accountId,
            'userId': userId 
        };
       
        quoteCartItemDao.findMany(query, $$.m.QuoteCartItem, function(err, list){
            if(err) {
                log.error('Exception listing promotions: ' + err);
                fn(err, null);
            } else {
    			log.debug(accountId, userId, '<< listQuoteItems');
                fn(null, list);
            }
        });
    },

    saveUpdateCartQuoteItems: function(accountId, userId, quoteCartItem, fn) {
        var self = this;
        log.debug(accountId, userId, '>> saveUpdateCartQuoteItems');
        quoteCartItemDao.saveOrUpdate(quoteCartItem, function(err, value){
            if(err) {
                self.log.error('Error saving quoteCartItem: ' + err);
                return fn(err, null);
            } else {
                log.debug(accountId, userId, '<< saveUpdateCartQuoteItems');
                fn(null, value);
            }
        });
    }
    
};
