var _ = require('underscore');
var async = require('async');
var fs = require('fs');
var moment = require('moment');
var ns = require('../utils/namespaces'),
    BlogPost = require('../cms/model/blogpost'),
    app = require('../app'),
    async = require('async'),
    cmsManager = require('../cms/cms_manager'),
    accountDao = require('../dao/account.dao'),
    socialConfigManager = require('../socialconfig/socialconfig_manager'),
    productManager = require('../products/product_manager'),
    orderManager = require('../orders/order_manager'),
    contactDao = require('../dao/contact.dao'),
    campaignManager = require('../campaign/campaign_manager'),
    userActivityManager = require('../useractivities/useractivity_manager'),
    userManager = require('../dao/user.manager'),
    contactDao = require('../dao/contact.dao'),
    appConfig = require('../configs/app.config');


var accountActivity = {

    log: $$.g.getLogger("accountActivity"),

    runReport: function(callback) {
        var self = this;
        var reportAry = [109, 45, 97, 79, 21, 37, 38, 12, 15, 126, 129, 130, 132, 133, 134, 135, 136, 137,
                            138, 139, 140, 141, 142, 158, 161,169,170,171,172,173,174, 175,176,177,178,179,
                            181,182,183,184];
        var activityAry = [];
        async.each(reportAry, function(accountId, cb){
            self.getActivityForAccount(accountId, function(err, activity){
                if(activity) {
                    activityAry.push(activity);
                }
                cb();
            });
        }, function done(err){
            //first, last, email, city, state, country, Day 11, Day 14
            self.log.debug('AccountId,first,last,email,city,state,country,Name,Custom Domain,Signup Date,Trial Days Remaining,day11,day14,Last Activity,Pointed Domain,Pages Created,Posts Created,Social Integrations,Stripe Integration,' +
                'Products,Orders,Contacts,Campaigns');

            var sortedAry = _.sortBy(activityAry, 'accountId');
            var csv = "";
            _.each(sortedAry, function(activity){
                csv += '\n' + activity.accountId + ',' +
                    activity.firstName + ',' +
                    activity.lastName + ',' +
                    activity.email + ',' +
                    activity.city + ',' +
                    activity.state + ',' +
                    activity.country + ',' +
                    activity.name + ',' +
                    activity.customDomain + ',' +
                    activity.signupDate + ',' +
                    activity.trialDaysRemaining + ',' +
                    activity.conversionDate + ',' +
                    activity.day11 + ',' +
                    activity.day14 + ',' +
                    activity.lastActivity + ',' +
                    activity.pointedDomain +',' +
                    activity.pages + ',' +
                    activity.posts +',' +
                    activity.socialIntegrations + ',' +
                    activity.stripeIntegrated + ',' +
                    activity.products +',' +
                    activity.orders + ',' +
                    activity.contacts + ',' +
                    activity.campaigns;
            });
            self.log.debug(csv);
            callback();
        });
        //self.getActivityForAccount(109, callback);
    },

    getActivityForAccount: function(accountId, fn) {
        var self = this;
        self.log.debug('>> getActivity');

        var activity = {
            accountId: accountId
        };

        async.waterfall([
            function getAccount(cb){
                accountDao.getAccountByID(accountId, function(err, account){
                    if(err) {
                        self.log.error('Error getting account', err);
                        cb(err);
                    } else {
                        cb(null, account);
                    }
                });
            },
            function getPages(account, cb){
                var defaultPageHandles = ['coming-soon', 'single-post', 'order-processing-email',
                'new-order-email', 'order-cancelled-email', 'order-completed-email', 'blog', 'customer-invoice-email',
                    'welcome-aboard'];
                var websiteId = account.get('website').websiteId;
                cmsManager.getPagesByWebsiteId(websiteId, accountId, function(err, pages){
                    if(err) {
                        self.log.error('Error getting pages', err);
                        cb(err);
                    } else {
                        var countedPages = [];//modified defaults or new pages
                        _.each(pages, function(page){
                            if(!_.contains(defaultPageHandles, page.get('handle'))){
                                countedPages.push(page);
                            }
                        });
                        activity.pages = countedPages.length;
                        cb(null, account);
                    }
                });
            },
            function getPosts(account, cb){
                cmsManager.listBlogPosts(accountId, 0, $$.m.BlogPost.allStatus, function(err, posts){
                    if(err) {
                        self.log.error('Error getting posts', err);
                        cb(err);
                    } else {
                        activity.posts = posts.length;
                        cb(null, account);
                    }
                });
            },
            function getSocialIntegrations(account, cb){
                socialConfigManager.getSocialConfig(accountId, null, function(err, config){
                    if(err) {
                        self.log.error('Error getting socialconfig', err);
                        cb(err);
                    } else {
                        if(config && config.get('socialAccounts') && config.get('socialAccounts').length>0) {
                            _.each(config.get('socialAccounts'), function(socialAccount){

                            });
                            var types = _.pluck(config.get('socialAccounts'), 'type');
                            var typeString ='"' +  _.reduce(types, function(memo, type){return memo + ',' + type}) + '"';
                            activity.socialIntegrations = typeString;
                        } else {
                            activity.socialIntegrations = 'NONE';
                        }
                        cb(null, account);
                    }
                });
            },
            function getStripeIntegration(account, cb){
                var accountCredentials = account.get('credentials');
                var stripeIntegrated = 'N';
                if(accountCredentials && accountCredentials.length >0) {

                    _.each(accountCredentials, function(cred){
                        if(cred.type === 'stripe') {
                            stripeIntegrated = 'Y';
                        }
                    });
                }
                activity.stripeIntegrated = stripeIntegrated;
                cb(null, account);
            },
            function getProducts(account, cb){
                productManager.listProducts(accountId, 0,0, function(err, products){
                    if(err) {
                        self.log.error('Error fetching products', err);
                        cb(err);
                    } else {
                        products = products || [];
                        activity.products = products.length;
                        cb(null, account);
                    }
                });
            },
            function getOrders(account, cb){
                orderManager.listOrdersByAccount(accountId, function(err, orders){
                    if(err) {
                        self.log.error('Error fetching orders', err);
                        cb(err);
                    } else {
                        orders = orders || [];
                        activity.orders = orders.length;
                        cb(null, account);
                    }
                });
            },
            function getContacts(account, cb){
                contactDao.getContactsAll(accountId, 0, 0, function(err, contacts){
                    if(err) {
                        self.log.error('Error fetching contacts', err);
                        cb(err);
                    } else {
                        contacts = contacts || [];
                        activity.contacts = contacts.length;
                        cb(null, account);
                    }
                });
            },
            function getCampaigns(account, cb){
                campaignManager.findCampaigns({accountId:accountId}, function(err, campaigns){
                    if(err) {
                        self.log.error('Error fetching campaigns', err);
                        cb(err);
                    } else {
                        campaigns = campaigns || [];
                        activity.campaigns = campaigns.length;
                        cb(null, account);
                    }
                });
            },
            function getLastActivity(account, cb) {
                userActivityManager.listActivities(accountId, 0, 0, function(err, activities){
                    if(err) {
                        self.log.error('Error fetching user activities', err);
                        cb(err);
                    } else {
                        var activityTimestamp = _.last(activities).get('start');
                        activity.lastActivity = moment(activityTimestamp).format('MM/DD/YYYY HH:mm');
                        cb(null, account);
                    }
                });
            },
            function getAccountAttributes(account, cb) {
                activity.name = account.get('subdomain');
                activity.customDomain = account.get('customDomain');
                activity.signupDate = moment(account.get('created').date).format('MM/DD/YYYY HH:mm');
                var endDate = moment(activity.signupDate).add(14, 'days');
                activity.trialDaysRemaining = endDate.diff(moment(), 'days');
                if(activity.trialDaysRemaining < 0) {
                    activity.trialDaysRemaining = 0;
                }
                if(account.get('customDomain') !== '') {
                    activity.pointedDomain = 'Y';
                } else {
                    activity.pointedDomain = 'N';
                }

                activity.day11 = moment(activity.signupDate).add(11, 'days').format('MM/DD/YYYY');
                activity.day14 = endDate.format('MM/DD/YYYY');
                var billing = account.get('billing');
                if(billing.conversionDate) {
                    activity.conversionDate = moment(billing.conversionDate).format('MM/DD/YYYY HH:mm');
                } else {
                    activity.conversionDate = '';
                }
                cb(null, account);
            },
            function getUserForAccount(account, cb) {
                userManager.getUserAccounts(account.id(), function(err, users){
                    if(err) {
                        self.log.error('Error fetching user accounts:', err);
                        cb(err);
                    } else {
                        //find the non-admin user
                        var sortedUsers = _.sortBy(users, function(user){return user.id();});
                        var targetUser = _.last(sortedUsers);
                        self.log.debug('The target user for account [' + account.id() + '] is [' + targetUser.get('username') + ']' );
                        cb(null, account, targetUser);
                    }
                });
            },
            function getContactForAccount(account, user, cb) {
                contactDao.getContactByEmailAndAccount(user.get('username'), appConfig.mainAccountID, function(err, contact){
                    if(err) {
                        self.log.error('Error fetching contacts: ', err);
                        cb(err);
                    } else {
                        self.log.debug('Found this contact', contact);
                        if(contact) {
                            self.log.debug('contact name: ' + contact.get('first') + ' ' + contact.get('last'));
                            activity.firstName = contact.get('first');
                            activity.lastName = contact.get('last');
                            try {
                                var address = contact.get('details')[0].addresses[0];
                            } catch(exception) {
                                //whatever
                            }

                            if(address) {
                                activity.city = address.city;
                                activity.state = address.state;
                                activity.zip = address.zip;
                                activity.country = address.country;
                            }
                        }
                        self.log.debug('user name: ' + user.get('first') + ' ' + user.get('last'));
                        activity.email = user.get('username');

                        cb();
                    }
                });
            }
        ], function done(err){
            self.log.info('Activity:', activity);
            fn(err, activity);
        });



    }



};

module.exports = accountActivity;