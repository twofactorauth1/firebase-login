/**
 * COPYRIGHT INDIGENOUS SOFTWARE, INC., LLC 2015
 *
 * All use or reproduction of any or all of this content must be approved.
 * Please contact info@indigenous.io for approval or questions.
 */

require('../../dao/base.dao.js');
var config = require('../../configs/leaddyno.config');
var request = require('request');
var dao = {

    recordPurchase: function(email, plan_code, purchase_amount, fn){
        var self = this;
        self.log.debug('>> recordPurchase');
        if(config.LEAD_DYNO_ENABLED === true){
            var _body = {
                key: config.LEAD_DYNO_PRIVATE_KEY,
                email: email,
                plan_code: plan_code,
                purchase_amount: purchase_amount
            };

            var url = config.LEAD_DYNO_API_URL + '/purchases';
            var options = {
                url:url,
                body: _body,
                json: true
            };

            request.post(options, function(err, response, body){
                if(err) {
                    self.log.error('Error recording purchase with LeadDyno:', err);
                    return fn(err, null);
                } else {
                    self.log.debug('response:', body);
                    self.log.debug('<< recordPurchase');
                    return fn(null, body);
                }
            });
        } else {
            self.log.debug('Skipping call to LeadDyno because it is not enabled.');
            fn(null, 'skipped');
        }


    },



    options: {
        name:"leaddyno.dao"
    }


};

dao = _.extend(dao, $$.dao.BaseDao.prototype, dao.options).init();

$$.dao.LeadDynoDao = dao;

module.exports = dao;
