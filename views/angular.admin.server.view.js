/**
 * COPYRIGHT INDIGENOUS SOFTWARE, INC., LLC 2014
 *
 * All use or reproduction of any or all of this content must be approved.
 * Please contact info@indigenous.io for approval or questions.
 */

var BaseView = require('./base.server.view');
var logger = $$.g.getLogger('angular.admin.server.veiw');
var segmentioConfig = require('../configs/segmentio.config.js');
var _req = null;
var urlUtils = require('../utils/urlutils');

var view = function(req,resp,options) {
    this.init.apply(this, arguments);
    _req = req;
};

_.extend(view.prototype, BaseView.prototype, {

    show: function(root) {
        logger.debug('>> show');
        var data = {
            router:"account/admin",
            root:root || "admin",
            location:"admin",
            includeHeader:true,
            includeFooter:true
        };

        var self = this;
        this.getAccountByHost(_req, function(err, value) {
            if (!err && value != null) {
                data.account = value.toJSON();
                //determine trial days remaining
                data.account.billing = data.account.billing || {};
                var trialDays = data.account.billing.trialLength || 15;//using 15 instead of 14 to give 14 FULL days
                var endDate = moment(data.account.billing.signupDate).add(trialDays, 'days');
                data.account.trialDaysRemaining = endDate.diff(moment(), 'days');
                if(data.account.trialDaysRemaining < 0) {
                    data.account.trialDaysRemaining = 0;
                }

                //logger.debug('getAccountByHost', data.account);
            } else {
                logger.warn('Error or null in getAccount');
                logger.error('Error: ' + err);
            }
            
            data.segmentIOWriteKey=segmentioConfig.SEGMENT_WRITE_KEY;

            data.showPreloader = false;
            data.includeJs = false;


            data = self.baseData(data);
            /*
             * Add some objects in case the user object is incomplete.
             */
            //data.user.user_preferences.welcome_alert.initial
            data.user.user_preferences = data.user.user_preferences || {};
            data.user.user_preferences.welcome_alert = data.user.user_preferences.welcome_alert || {};
            data.environment = urlUtils.getEnvironmentFromRequest(_req);
            logger.debug('<< show');
            //console.dir(data);
            self.resp.render('admin', data);
            //logger.debug('_cleanUp');
            self.cleanUp();
            //logger.debug('cleanUp_');
            data = self = null;
        });
    }
});

$$.v.AdminView = view;

module.exports = view;
