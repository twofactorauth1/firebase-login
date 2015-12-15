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
        /*
        var reportAry = [12,15,21,37,38,45,79,80,97,109,126,129,130,132,133,134,135,136,137,138,139,140,141,142,
                         158,161,169,170,171,172,173,174,175,176,177,178,179,181,182,183,184,185,186,187,188,189,
                         190,191,192,193,194,195,196,197,198,199,200,201,202,203,204,205,206,207,208,209,210,211,
                         212,213,217,218,219,220,221,222,223,224,225,226,227,229,232,233,234,235,236,237,238,239,
                         241,242,243,244,245,246,247,248,249,250,251,252,253,254,255,256,257,258,259,260,261,262,
                         263,264,265,266,267,268,269,270,271,272,273,274,275,276,277,278,279,280,281,282,283,284,
                         285,286,287,288,289,290,291,292,293,296,297,298,299,302,303,304,305,306,307,308,310,311,
                         312,313,314,316,317,318,319,320,321,322,323,324,325,326,329,331,332,333,334,335,336,337,
                         338,339,340,341,342,343,344,345,347,348,350,351,352,353,354,356,357,358,359,360,361,363,
                         364,365,366,367,368,369,370,371,372,373,375,376,377,379,380,381,382,385,386,387,388,71,
                         389,390,391,392,393,394,395,396,397,398,399,400,402,403,404,405,407,408,409,410,412,413,
                         414,415,417,418,419,420,421,422,423,424,425,426,427,428,429,430,431];

        var reportAry2 = [432,438,439,440,443,
                         444,445,446,448,449,450,451,452,453,454,455,456,457,458,459,460,461,462,463,464,465,466,
                         467,468,469,470,471,472,473,474,475,476,477,478,479,480,481,482,483,484,485,486,487,488,
                         489,490,491,492,493,494,495,496,497,498,499,500,501,502,503,504,505,506,507,508,509,510,
                         511,512,513,514,515,516,517,518,519,520,521,522,523,524,525,526,527,528,529,530,531,532,
                         533,535,537,538,539,540,544,545,546,547,548,549,550,552,553,554,555,556,557,558,559,
                         560,561,562,563,564,565,566,567,568,569,570,571,572,573,574,576,577,578,579,580,581,582,
                         583,584,585,586,587,590,591,592,593,594,595,596,597,598,599,600,601,602,603,605,606,607,
                         608,609,610,611,612,613,614,615,616,617,618,619,620,621,622,623,624,625,626,627,628,629,
                         630,631,632,633,634,635,636,637,638,639,640,641,642,643,644,645,646,647,648,649,650,651,
                         652,653,654,655,656,657,658,659,660,661,662,663,664,665,666,667,668,669,670,671,672,673,
                         674,675,676,677,678,679,680,681,682,683,684,685,686,687,688,689,690,691,692,693,694,695,
                         696,697,698,699,700,701,702,703,704,705,706,707,708,709,710,711,712,713,714,715,716,717,
                         718,719,720,721,722,723,724,725,726,727,728,729,730,731,732,733,734,735,736,737,738,739,
                         740,741,742,743,744,745,746,747,748,749,750,751,752,753,754,755,756,758,759,760,761,762,
                         763,764,765,766,767,768,769,770,771,772,773,774,775,776,777,778,779,780,781,782,783,784,
                         785,786,787,788,789,790,791,792,793,794,795,796,797,798,799,800,801,802,803,804,805,806,
                         807,808,809,810,811,812,813,814,815,816,817,818,819,820,821,822,823,824,825,826,827,828,
                         829,830,831,832,833,834,835,836,837,838,839,840,841,842,843,844,845,847,848,849,850,851,
                         852,853,854,855,856,857,858,859,860,861,862,863,864,865,866,867,868,869,870,871,872,873,
                         874,875,876,877,878,879,880,881,882,883,884,885,886,887,888,889,890,891,892];
        */
        accountDao.findMany({_id: {$ne:'__counter__'}}, $$.m.Account, function(err, list){
            var accountIDs = _.map(list, function(account){return account.id();});
            var activityAry = [];
            async.eachLimit(accountIDs, 20, function(accountId, cb){
                self.getActivityForAccount(accountId, function(err, activity){
                    if(activity) {
                        activityAry.push(activity);
                    }
                    cb();
                });
            }, function done(err){
                //first, last, email, city, state, country, Day 11, Day 14
                self.log.debug('AccountId,First,Last,email,City,State,Country,Phone,Name,Custom Domain,Signup Date,' +
                    'Trial Days Remaining,Day11,Day14,Last Activity,Pointed Domain,Pages Created,Posts Created,' +
                    'Social Integrations,Stripe Integration,Products,Orders,Contacts,Campaigns');

                var sortedAry = _.sortBy(activityAry, 'accountId');
                var csv = "";

                _.each(sortedAry, function(activity){
                    /*
                     * remove undefineds
                     */
                    activity.firstName = activity.firstName ||'';
                    activity.lastName = activity.lastName ||'';
                    activity.email = activity.email ||'';
                    activity.city = activity.city ||'';
                    activity.state = activity.state ||'';
                    activity.country = activity.country ||'';
                    activity.phone = activity.phone ||'';
                    activity.name = activity.name ||'';
                    activity.customDomain = activity.customDomain ||'';
                    activity.signupDate = activity.signupDate ||'';
                    activity.trialDaysRemaining = activity.trialDaysRemaining ||'';
                    activity.conversionDate = activity.conversionDate ||'';
                    activity.day11 = activity.day11 ||'';
                    activity.day14 = activity.day14 ||'';
                    activity.lastActivity = activity.lastActivity ||'';
                    activity.pointedDomain = activity.pointedDomain ||'';
                    activity.pages = activity.pages ||'';
                    activity.posts = activity.posts ||'';
                    activity.socialIntegrations = activity.socialIntegrations ||'';
                    activity.stripeIntegrated = activity.stripeIntegrated ||'';
                    activity.products = activity.products ||'';
                    activity.orders = activity.orders ||'';
                    activity.contacts = activity.contacts ||'';
                    activity.campaigns = activity.campaigns ||'';

                    csv += '\n' + activity.accountId + ',' +
                        '"' + activity.firstName + '",' +
                        '"' + activity.lastName + '",' +
                        activity.email + ',' +
                        activity.city + ',' +
                        activity.state + ',' +
                        activity.country + ',' +
                        activity.phone + ',' +
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
                        if(activities && activities.length > 0) {
                            var activityTimestamp = _.last(activities).get('start');
                            activity.lastActivity = moment(activityTimestamp).format('MM/DD/YYYY HH:mm');
                            cb(null, account);
                        } else {
                            activity.lastActivity = 'NEVER';
                            cb(null, account);
                        }

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

                if(account.get('business.phones') !== '') {
                    var business = account.get('business');
                    var phoneAry = business.phones;
                    activity.phone = '';

                    if(phoneAry && phoneAry.length > 0) {
                        activity.phone = phoneAry[0].number;
                    }
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
                //account.ownerUser if available
                if(account.get('ownerUser')) {
                    userManager.getUserById(account.get('ownerUser'), function(err, user){
                        if(err) {
                            self.log.error('Error fetching owner User:', err);
                            cb(err);
                        } else {
                            self.log.debug('The target user for account [' + account.id() + '] is [' + user.get('username') + ']' );
                            cb(null, account, user);
                        }
                    });
                } else {
                    userManager.getUserAccounts(account.id(), function(err, users){
                        if(err) {
                            self.log.error('Error fetching user accounts:', err);
                            cb(err);
                        } else {
                            //find the non-admin user
                            var sortedUsers = _.sortBy(users, function(user){return user.id();});
                            var targetUser = _.last(sortedUsers);
                            //self.log.debug('The target user for account [' + account.id() + ']...');
                            //self.log.debug('The target user for account [' + account.id() + '] is [' + targetUser.get('username') + ']' );
                            cb(null, account, targetUser);
                        }
                    });
                }
            },
            function getContactForAccount(account, user, cb) {
                if(!user) {
                    self.log.warn('\n\n\nNO user for account:', account);
                    cb();
                }
                try {
                    contactDao.getContactByEmailAndAccount(user.get('username'), appConfig.mainAccountID, function(err, contact){
                        if(err) {
                            self.log.error('Error fetching contacts: ', err);
                            cb(err);
                        } else {
                            //self.log.debug('Found this contact', contact);
                            if(contact) {
                                //self.log.debug('contact name: ' + contact.get('first') + ' ' + contact.get('last'));
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
                            //self.log.debug('user name: ' + user.get('first') + ' ' + user.get('last'));
                            activity.email = user.get('username');

                            cb();
                        }
                    });
                } catch(exception) {
                    self.log.error('Exception working on account and user:', {account:account, user:user});
                    self.log.error('The exception was:', exception);
                    cb();
                }

            }
        ], function done(err){
            self.log.info('Activity:', activity);
            fn(err, activity);
        });
    },

    cleanupAccounts: function(callback) {
        var self = this;
        var deleteTheseAccounts = [2,3,8,9,10,11,17,18,19,22,24,25,26,27,28,30,39,40,41,43,46,48,50,68,69,73,74,81,82,
            83,84,85,86,87,91,96,98,102,106,121,123];

        async.eachSeries(deleteTheseAccounts, function(accountId, cb){
            self.log.debug('deleting ' + accountId);
            accountDao.deleteAccountAndArtifacts(accountId, function(err, value){
                if(err) {
                    self.log.error('Error deleting account [' + accountId + ']: ', err);
                }
                cb();
            });
        }, function done(err){
            self.log.debug('Done deleting accounts');
            callback();
        });
    },

    cleanupContacts: function(callback) {
        var self = this;
        var query = {'created.date': { $type: 2}};
        contactDao.findMany(query, $$.m.Contact, function(err, contacts){
            if(err) {
                self.log.error('Error getting contacts:', err);
                callback();
            } else {
                async.each(contacts, function(contact, cb){
                    try {
                        var created = contact.get('created');

                        if (created && _.isString(contact.get('created').date)) {
                            created.date = moment(created.date).toDate();
                        }
                        contactDao.saveOrUpdate(contact, function(err, contact){
                            if(err) {
                                self.log.error('Error updating contact:', err);
                                cb();
                            } else {
                                cb();
                            }
                        });
                    } catch(exception) {
                        self.log.error('Exception:', exception);
                        cb();
                    }

                }, function done(err){
                    self.log.debug('done');
                    callback();
                });
            }
        });
    }

};

module.exports = accountActivity;
