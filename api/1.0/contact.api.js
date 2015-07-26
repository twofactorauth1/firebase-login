/**
 * COPYRIGHT INDIGENOUS SOFTWARE, INC., LLC 2014
 *
 * All use or reproduction of any or all of this content must be approved.
 * Please contact info@indigenous.io for approval or questions.
 */

var baseApi = require('../base.api');
var accountDao = require('../../dao/account.dao');
var contactDao = require('../../dao/contact.dao');
var userDao = require('../../dao/user.dao');
var cmsDao = require('../../cms/dao/cms.dao');
var campaignManager = require('../../campaign/campaign_manager');
var contactActivityManager = require('../../contactactivities/contactactivity_manager.js');
var userManager = require('../../dao/user.manager');
var cookies = require('../../utils/cookieutil');
var Contact = require('../../models/contact');
var request = require('request');
var fullContactConfig = require('../../configs/fullcontact.config');

var mandrillHelper = require('../../utils/mandrillhelper');
var notificationConfig = require('../../configs/notification.config');
var fs = require('fs');
var geoIPUtil = require('../../utils/geoiputil');

var api = function () {
    this.init.apply(this, arguments);
};

_.extend(api.prototype, baseApi.prototype, {

    base: "contact",

    dao: contactDao,

    initialize: function () {
        //GET
        app.get(this.url('myip'), this.getMyIp.bind(this));
        app.get(this.url('activities'), this.isAuthAndSubscribedApi.bind(this), this.findActivities.bind(this));
        app.get(this.url('activities/all'), this.isAuthAndSubscribedApi.bind(this), this.findActivities.bind(this));
        app.get(this.url('activities/read'), this.isAuthAndSubscribedApi.bind(this), this.findReadActivities.bind(this));
        app.get(this.url('activities/unread'), this.isAuthAndSubscribedApi.bind(this), this.findUnreadActivities.bind(this));

        app.get(this.url('shortform'), this.isAuthAndSubscribedApi.bind(this), this.getContactsShortForm.bind(this));
        app.get(this.url('shortform/:letter'), this.isAuthAndSubscribedApi.bind(this), this.getContactsShortForm.bind(this));
        app.get(this.url('search/email/:email'), this.isAuthAndSubscribedApi.bind(this), this.search.bind(this));
        app.get(this.url('search/name/:name'), this.isAuthAndSubscribedApi.bind(this), this.search.bind(this));
        app.get(this.url('search/:term'), this.isAuthAndSubscribedApi.bind(this), this.search.bind(this));
        app.get(this.url(':id'), this.isAuthAndSubscribedApi.bind(this), this.getContactById.bind(this));
        /*
         * Temp remove security for create contact.  Eventually, we will need to move this to a public API.
         */
        //app.post(this.url(''), this.isAuthAndSubscribedApi.bind(this), this.createContact.bind(this));
        app.post(this.url(''), this.setup.bind(this), this.createContact.bind(this));
        app.put(this.url(''), this.isAuthAndSubscribedApi.bind(this), this.updateContact.bind(this));
        app.delete(this.url(':id'), this.isAuthAndSubscribedApi.bind(this), this.deleteContact.bind(this));
        app.get(this.url(''), this.isAuthAndSubscribedApi.bind(this), this.listContacts.bind(this)); // for all contacts
        app.get(this.url('filter/:letter'), this.isAuthAndSubscribedApi.bind(this), this.getContactsByLetter.bind(this)); // for individual letter

        app.post(this.url(':id/user'), this.isAuthAndSubscribedApi.bind(this), this.createAccountUserFromContact.bind(this));
        //  app.post("/signupnews", this.signUpNews.bind(this));
        //app.post(this.url('signupnews'), this.isAuthApi, this.signUpNews.bind(this));
        app.post(this.url('signupnews'), this.setup.bind(this), this.signUpNews.bind(this));

        app.get(this.url(':accountId/contacts/:letter/:skip', "account"), this.isAuthAndSubscribedApi.bind(this), this.getContactsForAccountByLetter.bind(this));

        app.get(this.url(':accountId/contacts/:letter', "account"), this.isAuthAndSubscribedApi.bind(this), this.getContactsForAccountByLetter.bind(this));

        app.get(this.url(':id/activity'), this.isAuthAndSubscribedApi.bind(this), this.getActivityByContactId.bind(this));
        app.get(this.url(':id/activity/all'), this.isAuthAndSubscribedApi.bind(this), this.getActivityByContactId.bind(this));
        app.get(this.url(':id/activity/read'), this.isAuthAndSubscribedApi.bind(this), this.getReadActivityByContactId.bind(this));
        app.get(this.url(':id/activity/unread'), this.isAuthAndSubscribedApi.bind(this), this.getUnreadActivityByContactId.bind(this));

        app.get(this.url('activity/:id'), this.isAuthAndSubscribedApi.bind(this), this.getActivityById.bind(this));
        app.post(this.url('activity'), this.isAuthAndSubscribedApi.bind(this), this.createActivity.bind(this));
        app.post(this.url('activity/:id/read'), this.isAuthAndSubscribedApi.bind(this), this.markActivityRead.bind(this));
        app.post(this.url('activity/:id'), this.isAuthAndSubscribedApi.bind(this), this.updateActivity.bind(this));
        //searching

        // http://localhost:3000/api/1.0/contact/:id/fullcontact
        app.post(this.url(':id/fullcontact'), this.isAuthAndSubscribedApi.bind(this), this.updateContactByFullContactApi.bind(this));

        //duplicate check
        app.get(this.url('duplicates/check'), this.isAuthAndSubscribedApi.bind(this), this.checkForDuplicates.bind(this));
        app.post(this.url('duplicates/merge'), this.isAuthAndSubscribedApi.bind(this), this.mergeDuplicates.bind(this));

        app.post(this.url('importcsv'), this.isAuthApi.bind(this), this.importCsvContacts.bind(this));
    },

    getMyIp: function(req, resp) {
        var self = this;
        var ip = self.ip(req);
        self.sendResult(resp, ip);
    },

    //region CONTACT
    getContactById: function(req,resp) {

        var self = this;
        self.log.debug('>> getContactById');
        var contactId = req.params.id;

        if (!contactId) {
            this.wrapError(resp, 400, null, "Invalid paramater for ID");
        }

        contactId = parseInt(contactId);

        contactDao.getById(contactId, function(err, value) {
            self.log.debug('<< getContactById');
            if(!err && !value) {
                self.wrapError(resp, 404, null, 'Contact not found.', 'Contact not found.');
            } else if (!err && value != null) {

                var contactAccountId = value.get('accountId');
                self.checkPermissionAndSendResponse(req, self.sc.privs.VIEW_CONTACT, resp, value.toJSON("public"));
                //resp.send(value.toJSON("public"));
            } else {
                self.wrapError(resp, 401, null, err, value);
            }
        });
    },


    createContact: function (req, resp) {
        var self = this;
        self.log.debug('>> createContact');
        var accountId = parseInt(self.currentAccountId(req));

        self.checkPermissionForAccount(req, self.sc.privs.MODIFY_CONTACT, accountId, function(err, isAllowed) {
            if (isAllowed !== true) {
                return self.send403(req);
            } else {
                self._saveOrUpdateContact(req, resp, true);

            }
        });

    },


    updateContact: function (req, resp) {
        var self = this;
        self.log.debug('>> updateContact');
        var accountId = parseInt(self.accountId(req));

        self.checkPermissionForAccount(req, self.sc.privs.MODIFY_CONTACT, accountId, function(err, isAllowed) {
            if (isAllowed !== true) {
                return self.send403(req);
            } else {
                self._saveOrUpdateContact(req, resp, false);

            }
        });

    },


    _saveOrUpdateContact: function (req, resp, isNew) {

        var self = this;
        self.log.debug('>> _saveOrUpdateContact');
        var accountId = parseInt(self.accountId(req));

        var contact = new $$.m.Contact(req.body);
       
        if (isNew === true) {
            contact.set("accountId", accountId);
            if(this.userId(req)) {                
                contact.createdBy(this.userId(req), $$.constants.social.types.LOCAL);
            }
        }
        
        contactDao.saveOrUpdateContact(contact, function (err, value) {
            if (!err) {
                self.log.debug('>> saveOrUpdate', value);
                self.sendResult(resp, value);
                if(isNew===true) {
                    self.createUserActivity(req, 'CREATE_CONTACT', null, {id: value.id()}, function(){});
                } else {
                    self.createUserActivity(req, 'UPDATE_CONTACT', null, {id: value.id()}, function(){});
                }

            } else {
                self.wrapError(resp, 500, "There was an error updating contact", err, value);
            }
        });
    },

    importCsvContacts: function (req, resp) {
        var self = this;
        self.log.debug('>> importCsvContacts');
        var accountId = parseInt(self.currentAccountId(req));

        var contact = new $$.m.Contact(req.body);

        self.checkPermissionForAccount(req, self.sc.privs.MODIFY_CONTACT, accountId, function(err, isAllowed) {
            if (isAllowed !== true) {
                return self.send403(req);
            } else {
                self.log.debug('contacts ', contact);
            }
        });

    },


    deleteContact: function (req, resp) {

        var self = this;
        var contactId = req.params.id;
        var accountId = parseInt(self.accountId(req));

        self.checkPermissionForAccount(req, self.sc.privs.MODIFY_CONTACT, accountId, function(err, isAllowed) {
            if (isAllowed !== true) {
                return self.send403(req);
            } else {
                if (!contactId) {
                    self.wrapError(resp, 400, null, "Invalid paramater for ID");
                }

                contactId = parseInt(contactId);
                contactDao.removeById(contactId, function (err, value) {
                    if (!err && value != null) {
                        self.sendResult(resp, {deleted:true});
                        self.createUserActivity(req, 'DELETE_CONTACT', null, {id: contactId}, function(){});
                    } else {
                        self.wrapError(resp, 401, null, err, value);
                    }
                });
            }
        });
    },

    listContacts: function (req, res) {
        var self = this;
        var accountId = parseInt(self.accountId(req));
        var skip = parseInt(req.query['skip'] || 0);
        var limit = parseInt(req.query['limit'] || 0);
        self.log.debug('>> listContacts');

        self.checkPermissionForAccount(req, self.sc.privs.VIEW_CONTACT, accountId, function(err, isAllowed) {
            if (isAllowed !== true) {
                return self.send403(res);
            } else {
                contactDao.getContactsAll(accountId, skip, limit, function (err, value) {
                    self.log.debug('<< listContacts');
                    self.sendResultOrError(res, err, value, "Error listing Contacts");
                    self = null;
                });
            }
        });

    },

    getContactsByLetter: function (req, res) {
        var self = this;
        var accountId = parseInt(self.accountId(req));
        var skip = parseInt(req.query['skip'] || 0);
        var limit = parseInt(req.query['limit'] || 0);
        var letter = req.params.letter;
        self.log.debug('>> getContactsByLetter');

        self.checkPermissionForAccount(req, self.sc.privs.VIEW_CONTACT, accountId, function(err, isAllowed) {
            if (isAllowed !== true) {
                return self.send403(res);
            } else {
                contactDao.getContactsShort(accountId, skip, letter, limit, function (err, value) {
                    self.log.debug('<< getContactsByLetter');
                    self.sendResultOrError(res, err, value, "Error listing contacts by letter [" + letter + "]");
                    self = null;
                });
            }
        });
    },

    search: function(req, resp) {
        var self = this;
        self.log.debug('>> search');
        var accountId = parseInt(self.accountId(req));
        var skip = parseInt(req.query['skip'] || 0);
        var limit = parseInt(req.query['limit'] || 0);
        var term = null;



        self.checkPermissionForAccount(req, self.sc.privs.VIEW_CONTACT, accountId, function(err, isAllowed) {
            if (isAllowed !== true) {
                return self.send403(resp);
            } else {
                if(req.params.email) {
                    term = req.params.email;
                    contactDao.findContactsByEmail(accountId, term, function(err, contacts){
                        self.log.debug('<< search');
                        self.sendResultOrError(resp, err, contacts, "Error finding contacts");
                    });
                } else {
                    self.log.debug('<< search');
                    self.sendResult({ok:true});
                }
            }
        });
    },

    getContactsShortForm: function(req, res) {
        var self = this;
        self.log.debug('>> getContactsShortForm');
        var accountId = parseInt(self.accountId(req));
        var skip = parseInt(req.query['skip'] || 0);
        var limit = parseInt(req.query['limit'] || 0);
        var letter = req.params.letter || 'all';
        var fields = {_id:1, first:1, last:1, photo:1};
        if(req.query['fields'] !== undefined) {
            if (req.query['fields'] instanceof Array) {
                var fieldsList = req.query['fields'];
            } else {
                var fieldsList = req.query['fields'].split(',');
            }
            fields = {};
            _.each(fieldsList, function(element, index, list){
                fields[element] = 1;
            });
            //fields = _.object(fieldsList, [1]);
            //console.dir(fields);
        }


        self.checkPermissionForAccount(req, self.sc.privs.VIEW_CONTACT, accountId, function(err, isAllowed) {
            if (isAllowed !== true) {
                return self.send403(res);
            } else {
                contactDao.findContactsShortForm(accountId, letter, skip, limit, fields, function(err, list){
                    self.log.debug('<< getContactsShortForm');
                    self.sendResultOrError(res, err, list, "Error getting contact short form by letter [" + letter + "]");
                    self = null;
                });
            }
        });
    },

    /**
     *
     * @param req
     * @param resp
     */
    createAccountUserFromContact: function(req, resp) {
        var self = this;
        self.log.debug('>> createAccountUserFromContact');
        var accountId = parseInt(self.accountId(req));
        var contactId = parseInt(req.params.id);
        var username = req.body.username;
        var password = req.body.password;
        self.log.debug('Creating user with username [' + username + '] and password [' + password + ']');

        self.checkPermissionForAccount(req, self.sc.privs.MODIFY_CONTACT, accountId, function(err, isAllowed){
            if (isAllowed !== true) {
                return self.send403(resp);
            } else {
                contactDao.getById(contactId, $$.m.Contact, function(err, contact){
                    if(err) {
                        self.log.error('Error getting contact : ' + err);
                        return self.wrapError(resp, 500, err, 'Error getting contact');
                    } else if(contact === null) {
                        self.log.debug('Could not find contact');
                        return self.wrapError(resp, 404, null, 'Contact not found');
                    } else {
                        userManager.createAccountUserFromContact(accountId, username, password, contact, req.user, function(err, user){
                            self.log.debug('<< createAccountUserFromContact');
                            var responseObj = null;
                            if(user) {
                                responseObj =  user.toJSON("public", {accountId:self.accountId(req)});
                            }
                            self.createUserActivity(req, 'CREATE_USER', null, {contactId: contactId}, function(){});
                            return self.sendResultOrError(resp, err, responseObj, 'Error creating user');
                        });
                    }
                });
            }
        });

    },


    getContactsForAccountByLetter: function (req, resp) {

        var self = this;
        var accountId = req.params.accountId;
        var letter = req.params.letter;
        var skip = req.params.skip || 0;
        var limit = parseInt(req.query['limit'] || 0);

        if (!accountId) {
            return self.wrapError(resp, 400, null, "Invalid parameter for account id");
        }

        accountId = parseInt(accountId);

        self.checkPermissionForAccount(req, self.sc.privs.VIEW_CONTACT, accountId, function(err, isAllowed) {
            if (isAllowed !== true) {
                return self.send403(resp);
            } else {
                if (letter == null || letter == "") {
                    letter = "a";
                }

                if (!(letter == "all") && letter.length > 1) {
                    return self.wrapError(resp, 401, null, "Invalid parameter for :letter");
                }

                if (letter == "all") {
                    contactDao.getContactsAll(accountId, skip, limit, function (err, value) {
                        if (!err) {
                            return self.sendResult(resp, value);
                        } else {
                            return self.wrapError(resp, 500, "failed to retrieve contacts by letter", err, value);
                        }
                    });
                } else {
                    contactDao.getContactsShort(accountId, letter, limit, function (err, value) {
                        if (!err) {
                            return self.sendResult(resp, value);
                        } else {
                            return self.wrapError(resp, 500, "failed to retrieve contacts by letter", err, value);
                        }
                    });
                }
            }
        });

    },

    checkForDuplicates: function (req, res) {
        var self = this;
        self.log.debug('>> checkForDuplicates');

        var accountId = parseInt(self.accountId(req));

        self.checkPermissionForAccount(req, self.sc.privs.VIEW_CONTACT, accountId, function(err, isAllowed) {
            if (isAllowed !== true) {
                return self.send403(res);
            } else {
                contactDao.findDuplicates(accountId, function (err, value) {
                    self.log.debug('<< checkForDuplicates');
                    self.sendResultOrError(res, err, value, "Error checking for duplicate contacts");
                    self = null;
                });
            }
        });

    },

    /**
     *
     * Body of request can be empty or an array of contact IDs to merge.
     */
    mergeDuplicates: function (req, res) {
        var self = this;
        self.log.debug('>> mergeDuplicates');

        var accountId = parseInt(self.accountId(req));

        self.checkPermissionForAccount(req, self.sc.privs.MODIFY_CONTACT, accountId, function(err, isAllowed) {
            if (isAllowed !== true) {
                return self.send403(res);
            } else {
                var dupeAry = _.toArray(req.body);

                contactDao.mergeDuplicates(dupeAry, accountId, function (err, value) {
                    self.log.debug('<< mergeDuplicates');
                    self.sendResultOrError(res, err, value, "Error merging duplicate contacts");
                    self.createUserActivity(req, 'MERGE_CONTACTS', null, null, function(){});
                    self = null;
                });
            }
        });


    },
    //endregion CONTACT

    /**
     * No Security needed.
     * @param req
     * @param resp
     */
    signUpNews: function (req, resp) {
        var self = this, contact, accountToken, deferred;
        self.log.debug('>> signUpNews');

        accountDao.getAccountByHost(req.get("host"), function(err, value) {
            if(err) {
                self.log.error('Error signing up: ' + err);
                req.flash("error", value.toString());
                return self.wrapError(resp, 500, "There was a problem signing up.  Please try again later.", err, value);
            } else {
                console.dir(req.body);
                self.log.debug('signing up contact with account: ' + value.get('token'));
                var emailPreferences = value.get('email_preferences');
                if(emailPreferences.new_customer === true && !req.body.activity) {

                    var accountId = value.id();
                    var vars = [];
                    var toAddress = value.get('business').email;
                    var toName = '';
                    mandrillHelper.sendNewCustomerEmail(toAddress, toName, accountId, vars, function(err, value){
                        self.log.debug('email sent');
                    });

                }
                //TODO: check if contact exists
                var query = {};
                query.accountId = value.id();
                query['details.emails.email'] = req.body.details[0].emails[0].email;
                var skipWelcomeEmail = req.body.skipWelcomeEmail;
                var fromContactEmail = req.body.fromEmail;
                var emailId = req.body.emailId;
                var emailSubject = req.body.emailSubject;
                var fromContactName = req.body.fromName;
                var activity = req.body.activity;
                delete req.body.skipWelcomeEmail;
                delete req.body.fromEmail;
                delete req.body.fromName;
                delete req.body.emailId;
                delete req.body.emailSubject;
                delete req.body.activity;

                contactDao.findMany(query, $$.m.Contact, function(err, list){
                    if(err) {
                        self.log.error('Error checking for existing contact: ' + err);
                        return self.wrapError(resp, 500, "There was a problem signing up.  Please try again later")
                    }
                    if(list.length > 0) {
                        return self.wrapError(resp, 409, "This user already exists for this account.");
                    }
                    var contact = new $$.m.Contact(req.body);
                    contact.set('accountId', value.id());
                    contact.set('type', 'ld');
                    if(contact.get('fingerprint')) {
                        contact.set('fingerprint', ''+contact.get('fingerprint'));
                    }
                    geoIPUtil.getGeoForIP(self.ip(req), function(err, value){
                        self.log.debug('Got the following: ', value);
                        if(!err) {
                            /*
                             Assume: {
                             "ip": "8.8.8.8",
                             "city": "Mountain View",
                             "region": "California",
                             "country": "US",
                             "loc": "37.3860,-122.0838",
                             "postal": "94040"
                             }
                             */
                            var city = value['city'] || '';
                            var state = value['state'] || '';
                            var zip = value['postal'] || '';
                            var country = value['country'] || '';
                            var countryCode = value['country'] || '';
                            var displayName = 'GEOIP';
                            var lat = '';
                            var lon = '';
                            if(value.loc) {
                                lat = value['loc'].split(',')[0];
                                lon = value['loc'].split(',')[1];
                            }
                            self.log.debug('creating address from ' + city + ', ' + state + ', ' + zip + ', ' + country);
                            contact.createAddress(null, null, null, null, city, state, zip, country, countryCode, displayName, lat, lon, true, true);
                        }
                        contactDao.saveOrUpdateContact(contact, function(err, savedContact){
                            if(err) {
                                self.log.error('Error signing up: ' + err);
                                req.flash("error", 'There was a problem signing up.  Please try again later.');
                                return self.wrapError(resp, 500, "There was a problem signing up.  Please try again later.", err, value);
                            } else {
                                /*
                                 * If there is a campaign associated with this signup, update it async.
                                 */
                                if(req.query.campaignId || req.body.campaignId) {
                                    var campaignId = req.query.campaignId;
                                    if(req.body.campaignId) {
                                        campaignId = req.body.campaignId;
                                    }
                                    self.log.debug('Updating campaign with id: ' + campaignId);
                                    campaignManager.handleCampaignSignupEvent(value.id(), campaignId, savedContact.id(), function(err, value){
                                        if(err) {
                                            self.log.error('Error handling campaign signup: ' + err);
                                            return;
                                        } else {
                                            self.log.debug('Handled signup.');
                                            return;
                                        }
                                    });
                                }
                                //TODO: add a param to not send the welcome.
                                if(skipWelcomeEmail !== 'true' && skipWelcomeEmail !== true) {
                                    /*
                                     * Send welcome email.  This is done asynchronously.
                                     *
                                     * Here are the steps... maybe this should go somewhere else?
                                     *
                                     * 1. Get the account from session
                                     * 2. Get Page with page_type:email (if it does not exist, goto: 8)
                                     * 3. Get the HTML from the email component
                                     * 4. Set it as data.content
                                     * 5. Call app.render('email/base_email', data...
                                     * 6. Pass it to mandrillHelper
                                     * 7. RETURN
                                     * 8. Get the default welcome html if no page exists
                                     * 9. Call mandrillHelper
                                     */

                                    accountDao.getAccountByID(query.accountId, function(err, account){
                                        if(err) {
                                            self.log.error('Error getting account: ' + err);
                                            self.log.error('No email will be sent.');
                                        } else {
                                            cmsDao.getPageById(emailId, function(err, emailPage){
                                                if(err || emailPage === null) {
                                                    self.log.debug('Could not get email page.  Using default.');
                                                    fs.readFile(notificationConfig.WELCOME_HTML, 'utf-8', function(err, htmlContent){
                                                        if(err) {
                                                            self.log.error('Error getting welcome email file.  Welcome email not sent for accountId ' + value.id());
                                                        } else {
                                                            self.log.debug('value ', value);
                                                            var contactEmail = savedContact.getEmails()[0];
                                                            var contactName = savedContact.get('first') + ' ' + savedContact.get('last');
                                                            var fromEmail = fromContactEmail || notificationConfig.WELCOME_FROM_EMAIL;
                                                            self.log.debug('sending email to: ', contactEmail);
                                                            self.log.debug('sending email from: ', fromContactEmail);

                                                            var vars = [];
                                                            mandrillHelper.sendAccountWelcomeEmail(fromEmail,
                                                                notificationConfig.WELCOME_FROM_NAME, contactEmail.email, contactName, notificationConfig.WELCOME_EMAIL_SUBJECT,
                                                                '<h1>hey</h1>', value.ip, savedContact.id(), vars, function(err, result){});
                                                        }

                                                    });
                                                } else {
                                                    var component = emailPage.get('components')[0];
                                                    self.log.debug('Using this for data', emailPage.get('_id'));
                                                    self.log.debug('Using this account for data', account);
                                                    self.log.debug('This component:', component);
                                                    if(!component.logourl && account && account.attributes.business) {
                                                        component.logourl = account.attributes.business.logo;
                                                    }

                                                    component.logo.replace('"//', '"http://');
                                                    component.text = component.text.replace('"//', '"http://').replace(new RegExp('FHEMAIL', 'g'), savedContact.getEmails()[0].email);
                                                    component.title = component.title.replace('"//', '"http://').replace(new RegExp('FHEMAIL', 'g'), savedContact.getEmails()[0].email);
                                                    app.render('emails/base_email', component, function(err, html){
                                                        if(err) {
                                                            self.log.error('error rendering html: ' + err);
                                                            self.log.warn('email will not be sent.');
                                                        } else {
                                                            console.log('savedContact ', savedContact);
                                                            var contactEmail = savedContact.getEmails()[0].email;
                                                            var contactName = savedContact.get('first') + ' ' + savedContact.get('last');
                                                            self.log.debug('sending email to: ',contactEmail);


                                                            var fromEmail = fromContactEmail || component.from_email || notificationConfig.WELCOME_FROM_EMAIL;
                                                            // var fromName = component.fromName || notificationConfig.WELCOME_FROM_NAME;
                                                            // var emailSubject = emailSubject || notificationConfig.WELCOME_EMAIL_SUBJECT;
                                                            var vars = [];

                                                            self.log.debug('notificationConfig.WELCOME_FROM_EMAIL ', notificationConfig.WELCOME_FROM_EMAIL);
                                                            self.log.debug('notificationConfig.WELCOME_FROM_NAME ', notificationConfig.WELCOME_FROM_NAME);
                                                            self.log.debug('contactEmail.email ', contactEmail);
                                                            self.log.debug('contactName ', contactName);
                                                            self.log.debug('emailSubject ', emailSubject);
                                                            self.log.debug('fromContactName ', fromContactName);
                                                            self.log.debug('notificationConfig.WELCOME_EMAIL_SUBJECT ', notificationConfig.WELCOME_EMAIL_SUBJECT);
                                                            //self.log.debug('value.id() ', value.id());
                                                            self.log.debug('savedContact.id() ', savedContact.id());
                                                            self.log.debug('vars ', vars);
                                                            self.log.debug('notificationConfig.WELCOME_FROM_EMAIL ', notificationConfig.WELCOME_FROM_EMAIL);

                                                            try{
                                                                mandrillHelper.sendAccountWelcomeEmail(fromEmail, fromContactName, contactEmail, contactName, emailSubject, html, query.accountId, savedContact.id(), vars, function(err, result){
                                                                    self.log.debug('result: ', result);
                                                                });
                                                            } catch(exception) {
                                                                self.log.error(exception);
                                                            }

                                                            if(activity){
                                                                var accountEmail = null;
                                                                if(account && account.attributes.business && account.attributes.business.emails && account.attributes.business.emails[0] && account.attributes.business.emails[0].email)
                                                                {
                                                                    self.log.debug('user email: ', account.attributes.business.emails[0].email);
                                                                    accountEmail = account.attributes.business.emails[0].email;
                                                                    self._sendEmailOnCreateAccount(req, resp, accountEmail, activity.contact, account._id, component)
                                                                }
                                                                else{
                                                                    userDao.getUserAccount(query.accountId, function(err, user){
                                                                        self.log.debug('user: ', user);
                                                                        self.log.debug('user email: ', user.attributes.email);
                                                                        accountEmail = user.attributes.email;
                                                                        self._sendEmailOnCreateAccount(req, resp, accountEmail, activity.contact, account._id, component);
                                                                    })
                                                                }

                                                            }
                                                        }
                                                    });
                                                }
                                            });
                                        }
                                    });
                                } else {
                                    self.log.debug('Skipping email.');
                                }
                                //create contact_form activity
                                if(activity){
                                    var contactActivity = new $$.m.ContactActivity({
                                        accountId: query.accountId,
                                        contactId: savedContact.id(),
                                        activityType: activity.activityType,
                                        note: activity.note,
                                        start:new Date(),
                                        extraFields: activity.contact,
                                        sessionId: activity.sessionId
                                    });
                                    contactActivityManager.createActivity(contactActivity, function(err, value){
                                        if(err) {
                                            self.log.error('Error creating subscribe activity: ' + err);
                                            //if we can't create the activity... that's fine.  We have already created the contact.
                                        }
                                    });
                                }

                                //create contact activity
                                var activity = new $$.m.ContactActivity({
                                    accountId: query.accountId,
                                    contactId: savedContact.id(),
                                    activityType: $$.m.ContactActivity.types.FORM_SUBMISSION,
                                    start:new Date()
                                });
                                contactActivityManager.createActivity(activity, function(err, value){
                                    if(err) {
                                        self.log.error('Error creating subscribe activity: ' + err);
                                        //if we can't create the activity... that's fine.  We have already created the contact.
                                    }
                                    return self.sendResult(resp, savedContact);
                                });


                            }
                        });
                    });

                });



            }
        });

    },


    //region CONTACT ACTIVITY
    getActivityByContactId: function (req, resp) {

        var self = this;
        self.log.debug('>> getActivityByContactId');

        var contactId = req.params.id;
        var accountId = parseInt(self.accountId(req));
        if (!contactId) {
            return self.wrapError(resp, 400, null, "Invalid parameter for contact id");
        }
        contactId = parseInt(contactId);

        self.checkPermissionForAccount(req, self.sc.privs.VIEW_CONTACT, accountId, function(err, isAllowed) {
            if (isAllowed !== true) {
                return self.send403(resp);
            } else {
                var skip, limit;
                if(req.query.skip) {
                    skip = parseInt(req.query.skip);
                }
                if(req.query.limit) {
                    limit = parseInt(req.query.limit);
                }
                

                contactActivityManager.listActivitiesByContactId(accountId, contactId, skip, limit, null, function(err, value){
                    self.log.debug('<< getActivityByContactId');
                    self.sendResultOrError(resp, err, value, "Error getting activity by contactId.");
                    self = null;
                });
            }
        });

    },

    getReadActivityByContactId: function(req, resp) {
        var self = this;
        self.log.debug('>> getActivityByContactId');

        var contactId = req.params.id;
        var accountId = parseInt(self.accountId(req));
        if (!contactId) {
            return self.wrapError(resp, 400, null, "Invalid parameter for contact id");
        }
        contactId = parseInt(contactId);

        self.checkPermissionForAccount(req, self.sc.privs.VIEW_CONTACT, accountId, function(err, isAllowed) {
            if (isAllowed !== true) {
                return self.send403(resp);
            } else {
                var skip, limit;
                if(req.query.skip) {
                    skip = parseInt(req.query.skip);
                }
                if(req.query.limit) {
                    limit = parseInt(req.query.limit);
                }


                contactActivityManager.listActivitiesByContactId(accountId, contactId, skip, limit, 'true', function(err, value){
                    self.log.debug('<< getActivityByContactId');
                    self.sendResultOrError(resp, err, value, "Error getting activity by contactId.");
                    self = null;
                });
            }
        });
    },

    getUnreadActivityByContactId: function(req, resp) {
        var self = this;
        self.log.debug('>> getActivityByContactId');

        var contactId = req.params.id;
        var accountId = parseInt(self.accountId(req));
        if (!contactId) {
            return self.wrapError(resp, 400, null, "Invalid parameter for contact id");
        }
        contactId = parseInt(contactId);

        self.checkPermissionForAccount(req, self.sc.privs.VIEW_CONTACT, accountId, function(err, isAllowed) {
            if (isAllowed !== true) {
                return self.send403(resp);
            } else {
                var skip, limit;
                if(req.query.skip) {
                    skip = parseInt(req.query.skip);
                }
                if(req.query.limit) {
                    limit = parseInt(req.query.limit);
                }


                contactActivityManager.listActivitiesByContactId(accountId, contactId, skip, limit, 'false', function(err, value){
                    self.log.debug('<< getActivityByContactId');
                    self.sendResultOrError(resp, err, value, "Error getting activity by contactId.");
                    self = null;
                });
            }
        });
    },


    getActivityById: function (req, resp) {
        var self = this;
        self.log.debug('>> getActivityById');
        var activityId = req.params.id;

        self.checkPermissionForAccount(req, self.sc.privs.VIEW_CONTACT, accountId, function(err, isAllowed) {
            if (isAllowed !== true) {
                return self.send403(resp);
            } else {
                if (!activityId) {
                    return self.wrapError(resp, 400, null, "Invalid parameter for activity id");
                }

                contactActivityManager.getActivityById(activityId, function(err, value){
                    self.log.debug('<< getActivityById');
                    self.sendResultOrError(resp, err, value, "Error getting activity by ID.");
                    self = null;
                });
            }
        });

    },


    createActivity: function (req, resp) {
        var self = this;
        self.log.debug('>> createActivity');

        var accountId = parseInt(self.accountId(req));
        self.checkPermissionForAccount(req, self.sc.privs.MODIFY_CONTACT, accountId, function(err, isAllowed) {
            if (isAllowed !== true) {
                return self.send403(resp);
            } else {
                var contactActivity = new $$.m.ContactActivity(req.body);
                contactActivity.set('accountId', accountId);

                contactActivityManager.createActivity(contactActivity, function(err, value){
                    self.log.debug('<< getActivityById');
                    self.sendResultOrError(resp, err, value, "Error getting activity by ID.");
                    self.createUserActivity(req, 'CREATE_ACTIVITY', null, null, function(){});
                    self = null;
                });
            }
        });

    },

    /**
     * The following query parameters are allowed (but none are required):
     * - contactId
     * - activityType (multiple types can be passed separated by a comma)
     * - note (the search will be a substring match.  No need to pass wildcards)
     * - detail (the search will be a substring match.  No need to pass wildcards)
     * - before (a timestamp for searching.  All results will have a start time <= this parameter)
     * - after (a timestamp for searching.  All results will have a start time >= this parameter)
     * - skip
     * - limit
     * - read (a boolean indicating if the activity has been 'seen')
     *
     */
    findActivities: function(req, res) {
        var self = this;
        self.log.debug('>> findActivities');

        return self._doFindActivities(req, res, null, 'findActivities');

    },

    findReadActivities: function(req, resp) {
        var self = this;
        self.log.debug('>> findReadActivities');

        return self._doFindActivities(req, resp, 'true', 'findReadActivities');
    },

    findUnreadActivities: function(req, resp) {
        var self = this;
        self.log.debug('>> findUnreadActivities');

        return self._doFindActivities(req, resp, 'false', 'findUnreadActivities');
    },

    _doFindActivities: function(req, resp, read, method) {
        var self = this;

        var accountId = parseInt(self.accountId(req));
        self.log.debug('>> accountId', accountId);
        self.checkPermissionForAccount(req, self.sc.privs.VIEW_CONTACT, accountId, function(err, isAllowed) {
            if (isAllowed !== true) {
                return self.send403(resp);
            } else {
                var contactId = req.query['contactId'];
                var activityTypes = req.query['activityType'];
                var activityTypeAry = [];
                if(activityTypes) {
                    if(activityTypes.indexOf(',') != -1) {
                        activityTypeAry = activityTypes.split(',');
                    } else {
                        activityTypeAry.push(activityTypes);
                    }
                }
                var noteText = req.query['note'];
                var detailText = req.query['detail'];
                var beforeTimestamp = req.query['before'];
                var afterTimestamp = req.query['after'];

                var skip, limit;
                if(req.query.skip) {
                    skip = parseInt(req.query.skip);
                }
                if(req.query.limit) {
                    limit = parseInt(req.query.limit);
                }
                var includeDeleted = false;
                if(req.query.includeDeleted && req.query.includeDeleted === 'true') {
                    includeDeleted = true;
                }


                contactActivityManager.findActivities(accountId, contactId, activityTypeAry, noteText, detailText,
                    beforeTimestamp, afterTimestamp, skip, limit, read, includeDeleted, function(err, list){
                        self.log.debug('<< ' + method);
                        self.sendResultOrError(resp, err, list, "Error finding activities");
                        self = null;
                    });
            }
        });
    },

    //Update data from FullContact API
    updateContactByFullContactApi: function (req, resp) {
        var self = this,
            email,
            flag = true,
            contactId;

        self.log.debug('>> updateContactByFullContactApi');

        contactId = parseInt(req.param('id'));
        //Getting Contact Data via ContactId
        if (!contactId) {
            self.wrapError(resp, 400, null, "Invalid paramater for ID");
        }

        contactDao.getById(contactId, function (err, value) {
            var flag = true;
            if (!err && value != null && value.attributes.details.length > 0) {

                self.checkPermissionForAccount(req, self.sc.privs.MODIFY_CONTACT, value.get('contactId'), function(err, isAllowed) {
                    if (isAllowed !== true) {
                        return self.send403(resp);
                    } else {
                        value.attributes.details.forEach(function (obj) {
                            if (obj.emails && obj.emails.length) {
                                obj.emails.forEach(function (eml) {
                                    email = eml;
                                })
                            }
                        });

                        //Get EmailId via req.body (Presently it is working only for one record in an array)
                        if (email) {
                            // Hit FullContactAPI
                            // https://api.fullcontact.com/v2/person.json?email=your-email-id&apiKey=your-key

                            request('https://api.fullcontact.com/v2/person.json?email=' + email + '&apiKey=' + fullContactConfig.key, function (error, response, body) {

                                if (!error && response.statusCode == 200) {
                                    body = JSON.parse(body);
                                    body["type"] = "fullcontact";

                                    value.attributes.details.forEach(function (detail) {
                                        if (detail.type == "fullcontact") {
                                            flag = false;
                                            detail = body;
                                        }
                                    });

                                    if (flag) {
                                        value.attributes.details.push(body);
                                    }

                                    //Update the Contact Data into DataBase
                                    contactDao.saveOrUpdate(value, function (err, vl) {
                                        if (!err) {
                                            self.sendResult(resp, vl);
                                        } else {
                                            self.wrapError(resp, 500, "There was an error updating contact", err, vl);
                                        }
                                    });
                                } else {
                                    console.log('FullContact has no data related to this user');
                                    resp.send({status: 'No Data Found with FullContact API'});
                                }
                            });
                        } else {
                            self.log.debug('>> updateContactByFullContactApi: email not found');
                            resp.send({status: 'email not found'});
                        }
                    }
                });
            }
            else {
                self.wrapError(resp, 401, null, err, value);
            }
        });


    },

    updateActivity: function (req, resp) {

    },

    markActivityRead: function(req, resp) {
        var self = this;
        self.log.debug('>> markActivityRead');
        var accountId = parseInt(self.accountId(req));
        var activityId = req.params.id;

        self.checkPermissionForAccount(req, self.sc.privs.VIEW_CONTACT, accountId, function(err, isAllowed) {
            if (isAllowed !== true) {
                return self.send403(resp);
            } else {
                contactActivityManager.markActivityRead(activityId, function(err, value){
                    self.log.debug('<< markActivityRead');
                    self.sendResultOrError(resp, err, value, 'Error marking activity as read.');
                    self.createUserActivity(req, 'MARK_ACTIVITY_READ', null, {activityId: activityId}, function(){});
                    return;
                });
            }
        });

    },
    _sendEmailOnCreateAccount: function(req, resp, accountEmail, fields, accountId, comp) {
        var self = this;
        var component = {};
        component.logourl = comp.logourl;
        var text = [];
         for(var attributename in fields){
            text.push("<b>"+attributename+"</b>: "+fields[attributename]);
        }
        self.log.debug(fields);
        component.title = "New customer created";
        component.text = text;
        app.render('emails/new_customer_created', component, function(err, html){
            if(err) {
                self.log.error('error rendering html: ' + err);
                self.log.warn('email will not be sent to account owner.');
            } else {
                self.log.debug('sending email to: ', accountEmail);

                var fromEmail = notificationConfig.FROM_EMAIL;
                var fromName =  notificationConfig.WELCOME_FROM_NAME;
                var emailSubject = notificationConfig.NEW_CUSTOMER_EMAIL_SUBJECT;
                var vars = [];
                
                mandrillHelper.sendBasicEmail(fromEmail, fromName, accountEmail, null, emailSubject, html, accountId, vars, function(err, result){
                    self.log.debug('result: ', result);
                });
            }
        });
    }
    
    //endregion CONTACT ACTIVITY
});

module.exports = new api();
