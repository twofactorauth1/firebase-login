/**
 * COPYRIGHT INDIGENOUS SOFTWARE, INC., LLC 2015
 *
 * All use or reproduction of any or all of this content must be approved.
 * Please contact info@indigenous.io for approval or questions.
 */

var _log = $$.g.getLogger("affiliate_manager");
var async = require('async');
var config = require('../configs/leaddyno.config');
var dao = require('./dao/leaddyno.dao');

module.exports = {

    log: _log,

    recordPurchase: function(email, amount, fn) {
        var self = this;
        self.log.debug('>> recordPurchase');
        dao.recordPurchase(email, config.LEAD_DYNO_DEFAULT_PLAN, amount, function(err, value){
            if(err) {
                self.log.error('Error recording purchase:', err);
                return fn(err, null);
            } else {
                self.log.debug('<< recordPurchase');
                return fn(err, value);
            }
        });

    }


}