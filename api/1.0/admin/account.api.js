/**
 * COPYRIGHT INDIGENOUS SOFTWARE, INC., LLC 2014
 *
 * All use or reproduction of any or all of this content must be approved.
 * Please contact info@indigenous.io for approval or questions.
 */

var baseApi = require('../../base.api');
var userManager = require('../../../dao/user.manager');
var userDao = require('../../../dao/user.dao');
var appConfig = require('../../../configs/app.config');
var accountDao = require('../../../dao/account.dao');
var accountManager = require('../../../accounts/account.manager');

var api = function() {
    this.init.apply(this, arguments);
};

_.extend(api.prototype, baseApi.prototype, {

    base: "admin/account",

    dao: accountDao,

    initialize: function() {

        app.post(this.url(':id/trial/:newlength'), this.isAuthApi.bind(this), this.updateTrialLength.bind(this));
        app.post(this.url(':id/cancel'), this.isAuthApi.bind(this), this.cancelAccount.bind(this));
    },

    updateTrialLength: function(req, resp) {
        var self = this;
        var userId = self.userId(req);
        var accountId = parseInt(req.params.id);
        var newLength = parseInt(req.params.newlength);
        self.log.debug(null, userId, '>> updateTrialLength');
        self._isAdmin(req, function(err, value) {
            if (value !== true) {
                return self.send403(resp);
            } else {
                accountDao.getAccountByID(accountId, function(err, account){
                    if(err) {
                        self.log.error('Error getting account:', err);
                        self.wrapError(resp, 500, 'Error getting account', 'Error getting account');
                    } else {
                        var billing = account.get('billing');
                        billing.trialLength = newLength;

                        //check for trial length and unlock/lock appropriately

                        var endDate = moment(billing.signupDate).add(billing.trialLength, 'days');
                        var trialDaysRemaining = endDate.diff(moment(), 'days');
                        if(trialDaysRemaining > 0) {
                            account.set('locked_sub', false);
                        } else {
                            account.set('locked_sub', true);
                        }
                        accountDao.saveOrUpdate(account, function(err, savedAccount){
                            self.log.debug(null, userId, '<< updateTrialLength');
                            return self.sendResultOrError(resp, err, savedAccount, 'Error updating trial');
                        });
                    }
                });

            }
        });
    },

    cancelAccount: function(req, resp) {
        var self = this;
        var userId = self.userId(req);
        var accountId = parseInt(req.params.id);
        var reason = req.body.reason || '';
        var cancelNow = false;
        if(req.body.cancelNow && req.body.cancelNow === 'true') {
            cancelNow = true;
        }

        self.log.debug(accountId, userId, '>> cancelAccount (' + accountId + ','  + reason + ',' + cancelNow + ')');
        self._isAdmin(req, function(err, value) {
            if (value !== true) {
                return self.send403(resp);
            } else {
                accountManager.cancelAccount(parseInt(self.accountId(req)), userId, accountId, reason, cancelNow, function(err, value){
                    self.log.debug(accountId, userId, '<< cancelAccount');
                    return self.sendResultOrError(resp, err, value, 'Error cancelling account');
                });
            }
        });
    },

    /**
     *
     * @param req
     * @param fn
     * @private
     */
    _isAdmin: function(req, fn) {
        var self = this;
        if(self.userId(req) === 1 || self.userId(req)===4) {
            fn(null, true);
        } else if(_.contains(req.session.permissions, 'manager')){
            fn(null, true);
        } else {
            fn(null, false);
        }
    }

});

module.exports = new api();