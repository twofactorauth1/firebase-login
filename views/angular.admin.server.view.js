/**
 * COPYRIGHT INDIGENOUS SOFTWARE, INC., LLC 2014
 *
 * All use or reproduction of any or all of this content must be approved.
 * Please contact info@indigenous.io for approval or questions.
 */

var BaseView = require('./base.server.view');
var cmsManager = require('../cms/cms_manager');
var logger = $$.g.getLogger('angular.admin.server.veiw');
var _req = null;
var urlUtils = require('../utils/urlutils');
var intercomConfig = require('../configs/intercom.config');
var CryptoJS = require('crypto-js');
var appConfig = require('../configs/app.config');

var view = function(req,resp,options) {
    this.init.apply(this, arguments);
    _req = req;
};

_.extend(view.prototype, BaseView.prototype, {

    show: function(root) {
        logger.debug('>> show [' + _req.originalUrl + ']');
        var self = this;
        var data = {
            router:"account/admin",
            root:root || "admin",
            location:"admin",
            includeHeader:true,
            includeFooter:true
        };

        self.getAccountByHost(_req, function(err, account) {
            if (!err && account != null) {
                self.getOrganizationByAccountId(account.id(), function(err, org){
                    if(err || !org) {
                        logger.warn('Could not find organization for account:', account);
                    }
                    data.account = account.toJSON();
                    if(!data.account.orgId) {
                        data.account.orgId = 0;
                    }
                    if(org && account.id() === org.get('adminAccount')) {
                        data.account.isOrgAdmin = true;
                    } else {
                        data.account.isOrgAdmin = false;
                        logger.debug('org:', org);
                        logger.debug('account:', account);
                    }
                    logger.info('data.account.isOrgAdmin', data.account.isOrgAdmin);
                    //determine trial days remaining
                    data.account.billing = data.account.billing || {};
                    var trialDays = data.account.billing.trialLength || appConfig.trialLength;//using 15 instead of 14 to give 14 FULL days
                    var endDate = moment(data.account.billing.signupDate).add(trialDays, 'days');
                    data.account.trialDaysRemaining = endDate.diff(moment(), 'days');
                    if(data.account.trialDaysRemaining < 0) {
                        data.account.trialDaysRemaining = 0;
                    }

                    data.segmentIOWriteKey='';

                    data.showPreloader = false;
                    data.includeJs = false;


                    data = self.baseData(data);
                    /*
                     * Add some objects in case the user object is incomplete.
                     */

                    data.user.user_preferences = data.user.user_preferences || {};
                    data.user.user_preferences.welcome_alert = data.user.user_preferences.welcome_alert || {};
                    data.environment = urlUtils.getEnvironmentFromRequest(_req);
                    if(!data.user.intercomHash) {
                        logger.debug('calculating hash');
                        data.user.intercomHash = CryptoJS.HmacSHA256(data.user.email, intercomConfig.INTERCOM_SECRET_KEY).toString(CryptoJS.enc.Hex);
                        logger.trace('hash:', data.user.intercomHash);
                        //TODO: save this to the user for next time.
                    }


                    var statusArray = [$$.m.BlogPost.status.PRIVATE,$$.m.BlogPost.status.DRAFT,$$.m.BlogPost.status.FUTURE,$$.m.BlogPost.status.PUBLISHED];
                    logger.debug('listing blog posts');


                    cmsManager.listBlogPosts(data.account._id, 50, statusArray, function (err, value) {
                        logger.debug('done listing blog posts');
                        if (err) {
                            console.error('<< angular.admin.server.view: listBlogPosts error ', err);
                        } else {
                            data.serverProps.posts = JSON.stringify(_.map(value, function(val){ return val.toJSON(); }));
                        }
                        logger.debug('listing pages');
                        cmsManager.getPagesByWebsiteId(data.account.website.websiteId, data.account._id, function(err, value) {
                            logger.debug('done listing pages');
                            if (err) {
                                console.error('<< angular.admin.server.view: getPagesByWebsiteId error ', err);
                            } else {
                                data.serverProps.pages = JSON.stringify(_.map(value, function(val){ return val.toJSON(); }));
                            }

                            //console.dir(data);
                            logger.debug('Starting render');
                            if(data.account.orgId && data.account.orgId === 2) {
                                logger.debug('Rendering var admin');
                                self.resp.send("Not supported");
                            } else if(data.account.orgId && data.account.orgId === 1){
                                logger.debug('Rendering rvlvr admin');
                                self.resp.render('var/rvlvr/admin', data);
                            } else if(data.account.orgId && data.account.orgId === 4){
                                logger.debug('Rendering techevent admin');
                                self.resp.render('var/techevent/admin', data);
                            } else if(data.account.orgId && data.account.orgId === 5){
                                logger.debug('Rendering leadsource admin');
                                self.resp.render('var/leadsource/admin', data);
                            } else if(data.account.orgId && data.account.orgId === 6){
                                logger.debug('Rendering AMRVLVR admin');
                                self.resp.render('var/am/admin', data);
                            } else {
                                self.resp.render('admin', data);
                            }

                            logger.debug('<< show [' + _req.originalUrl + ']');
                            //logger.debug('_cleanUp');
                            self.cleanUp();
                            //logger.debug('cleanUp_');
                            data = self = null;

                        });

                    });
                });


                //logger.debug('getAccountByHost', data.account);
            } else {
                logger.warn('Error or null in getAccount');
                logger.error('Error: ' + err);
                app.render('404.html', {}, function(err, html){
                    if(err) {
                        self.log.error('Error during render:', err);
                    }
                    self.resp.status(404).send(html);
                });
            }

        });

    }
});

$$.v.AdminView = view;

module.exports = view;
