/**
 * COPYRIGHT INDIGENOUS SOFTWARE, INC., LLC 2017
 *
 * All use or reproduction of any or all of this content must be approved.
 * Please contact info@indigenous.io for approval or questions.
 */

var dao = require('./dao/purchase_order.dao.js');
var log = $$.g.getLogger("purchase_order_manager");
var async = require('async');

require('./model/purchase_order');


var accountDao = require('../dao/account.dao');




module.exports = {

	listPurchaseOrders: function (accountId, userId, fn) {
        
        log.debug(accountId, userId, '>> listPurchaseOrders');
        var query = {
            account_id: accountId
        };

        dao.findMany(query, $$.m.PurchaseOrder, function (err, orders) {
            if (err) {
                log.error(accountId, userId, 'Error listing orders: ', err);
                return fn(err, null);
            } else {
        		log.debug(accountId, userId, '<< listPurchaseOrders');
                return fn(null, orders);
            }
        });
    }
    
};
