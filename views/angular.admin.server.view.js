/**
 * COPYRIGHT INDIGENOUS SOFTWARE, INC., LLC 2014
 *
 * All use or reproduction of any or all of this content must be approved.
 * Please contact info@indigenous.io for approval or questions.
 */

var BaseView = require('./base.server.view');
var logger = $$.g.getLogger('angular.admin.server.veiw');
var segmentioConfig = require('../configs/segmentio.config.js')

var view = function(req,resp,options) {
    this.init.apply(this, arguments);
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
        this.getAccount(function(err, value) {
            if (!err && value != null) {
                data.account = value.toJSON();
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
            logger.debug('<< show');
            console.dir(data);
            self.resp.render('admin', data);
            logger.debug('_cleanUp');
            self.cleanUp();
            logger.debug('cleanUp_');
            data = self = null;
        });
    }
});

$$.v.AdminView = view;

module.exports = view;
