/**
 * COPYRIGHT INDIGENOUS SOFTWARE, INC., LLC 2014
 *
 * All use or reproduction of any or all of this content must be approved.
 * Please contact info@indigenous.io for approval or questions.
 */

var baseApi = require('../base.api');
var accountDao = require('../../dao/account.dao');
var contactDao = require('../../dao/contact.dao');
var cmsDao = require('../../cms/dao/cms.dao');
var contactActivityManager = require('../../contactactivities/contactactivity_manager.js');
var cookies = require('../../utils/cookieutil');
var Contact = require('../../models/contact');
var request = require('request');
var fullContactConfig = require('../../configs/fullcontact.config');

var mandrillHelper = require('../../utils/mandrillhelper');
var notificationConfig = require('../../configs/notification.config');
var fs = require('fs');

var api = function () {
    this.init.apply(this, arguments);
};

_.extend(api.prototype, baseApi.prototype, {

    base: "contact",

    dao: contactDao,

    initialize: function () {
        //GET
        app.get(this.url('activities'), this.isAuthAndSubscribedApi.bind(this), this.findActivities.bind(this));
        app.get(this.url('shortform'), this.isAuthAndSubscribedApi.bind(this), this.getContactsShortForm.bind(this));
        app.get(this.url('shortform/:letter'), this.isAuthAndSubscribedApi.bind(this), this.getContactsShortForm.bind(this));
        app.get(this.url(':id'), this.isAuthAndSubscribedApi.bind(this), this.getContactById.bind(this));
        app.post(this.url(''), this.isAuthAndSubscribedApi.bind(this), this.createContact.bind(this));
        app.put(this.url(''), this.isAuthAndSubscribedApi.bind(this), this.updateContact.bind(this));
        app.delete(this.url(':id'), this.isAuthAndSubscribedApi.bind(this), this.deleteContact.bind(this));
        app.get(this.url(''), this.isAuthAndSubscribedApi.bind(this), this.listContacts.bind(this)); // for all contacts
        app.get(this.url('filter/:letter'), this.isAuthAndSubscribedApi.bind(this), this.getContactsByLetter.bind(this)); // for individual letter


        //  app.post("/signupnews", this.signUpNews.bind(this));
        //app.post(this.url('signupnews'), this.isAuthApi, this.signUpNews.bind(this));
        app.post(this.url('signupnews'), this.setup, this.signUpNews.bind(this));

        app.get(this.url(':accountId/contacts/:letter/:skip', "account"), this.isAuthAndSubscribedApi.bind(this), this.getContactsForAccountByLetter.bind(this));

        app.get(this.url(':accountId/contacts/:letter', "account"), this.isAuthAndSubscribedApi.bind(this), this.getContactsForAccountByLetter.bind(this));

        app.get(this.url(':id/activity'), this.isAuthAndSubscribedApi.bind(this), this.getActivityByContactId.bind(this));
        app.get(this.url('activity/:id'), this.isAuthAndSubscribedApi.bind(this), this.getActivityById.bind(this));
        app.post(this.url('activity'), this.isAuthAndSubscribedApi.bind(this), this.createActivity.bind(this));
        app.post(this.url('activity/:id'), this.isAuthAndSubscribedApi.bind(this), this.updateActivity.bind(this));
        //searching

        // http://localhost:3000/api/1.0/contact/:id/fullcontact
        app.post(this.url(':id/fullcontact'), this.isAuthAndSubscribedApi.bind(this), this.updateContactByFullContactApi.bind(this));

        //duplicate check
        app.get(this.url('duplicates/check'), this.isAuthAndSubscribedApi.bind(this), this.checkForDuplicates.bind(this));
        app.post(this.url('duplicates/merge'), this.isAuthAndSubscribedApi.bind(this), this.mergeDuplicates.bind(this));
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
        var accountId = parseInt(self.accountId(req));

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
            contact.createdBy(this.userId(req), $$.constants.social.types.LOCAL);
            contact.created("date", new Date().getTime());
        }

        contactDao.saveOrUpdateContact(contact, function (err, value) {
            if (!err) {
                self.log.debug('>> saveOrUpdate', value);
                self.sendResult(resp, value);
            } else {
                self.wrapError(resp, 500, "There was an error updating contact", err, value);
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
                        self.sendResult(resp, value);
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
                return self.send403(req);
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
                return self.send403(req);
            } else {
                contactDao.getContactsShort(accountId, skip, letter, limit, function (err, value) {
                    self.log.debug('<< getContactsByLetter');
                    self.sendResultOrError(res, err, value, "Error listing contacts by letter [" + letter + "]");
                    self = null;
                });
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
                return self.send403(req);
            } else {
                contactDao.findContactsShortForm(accountId, letter, skip, limit, fields, function(err, list){
                    self.log.debug('<< getContactsShortForm');
                    self.sendResultOrError(res, err, list, "Error getting contact short form by letter [" + letter + "]");
                    self = null;
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
                return self.send403(req);
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
                return self.send403(req);
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
                return self.send403(req);
            } else {
                var dupeAry = _.toArray(req.body);

                contactDao.mergeDuplicates(dupeAry, accountId, function (err, value) {
                    self.log.debug('<< mergeDuplicates');
                    self.sendResultOrError(res, err, value, "Error merging duplicate contacts");
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
                //TODO: check if contact exists
                var query = {};
                query.accountId = value.id();
                query['details.emails.email'] = req.body.details[0].emails[0].email;
                
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
                    contact.created("date", new Date().getTime());
                    contactDao.saveOrUpdateContact(contact, function(err, savedContact){
                        if(err) {
                            self.log.error('Error signing up: ' + err);
                            req.flash("error", 'There was a problem signing up.  Please try again later.');
                            return self.wrapError(resp, 500, "There was a problem signing up.  Please try again later.", err, value);
                        } else {
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
                                    cmsDao.getPageByType(query.accountId, null, 'email', function(err, emailPage){
                                        if(err || emailPage === null) {
                                            self.log.debug('Could not get email page.  Using default.');
                                            fs.readFile(notificationConfig.WELCOME_HTML, 'utf-8', function(err, htmlContent){
                                                if(err) {
                                                    self.log.error('Error getting welcome email file.  Welcome email not sent for accountId ' + value.id());
                                                } else {
                                                    var contactEmail = savedContact.getEmails()[0].email;
                                                    var contactName = savedContact.get('first') + ' ' + savedContact.get('last');
                                                    self.log.debug('sending email to: ',contactEmail);
                                                    mandrillHelper.sendAccountWelcomeEmail(notificationConfig.WELCOME_FROM_EMAIL,
                                                        notificationConfig.WELCOME_FROM_NAME, contactEmail, contactName, notificationConfig.WELCOME_EMAIL_SUBJECT,
                                                        htmlContent, value.id(), savedContact.id(), function(err, result){});
                                                }

                                            });
                                        } else {
                                            var component = emailPage.get('components')[0];
                                            self.log.debug('Using this for data', component);
                                            app.render('emails/base_email', component, function(err, html){
                                                if(err) {
                                                    self.log.error('error rendering html: ' + err);
                                                    self.log.warn('email will not be sent.');
                                                } else {
                                                    var contactEmail = savedContact.getEmails()[0].email;
                                                    var contactName = savedContact.get('first') + ' ' + savedContact.get('last');
                                                    self.log.debug('sending email to: ',contactEmail);
                                                    var fromEmail = component.from_email || notificationConfig.WELCOME_FROM_EMAIL;
                                                    var fromName = component.from_name || notificationConfig.WELCOME_FROM_NAME;
                                                    var emailSubject = component.email_subject || notificationConfig.WELCOME_EMAIL_SUBJECT;
                                                    mandrillHelper.sendAccountWelcomeEmail(fromEmail, fromName, contactEmail, contactName, emailSubject, html, value.id(), savedContact.id(), function(err, result){});
                                                }
                                            });
                                        }
                                    });
                                }
                            });




                            //req.flash("info", "Thank you for subscribing.");
                            return self.sendResult(resp, savedContact);
                        }
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
                return self.send403(req);
            } else {
                var skip = req.query['skip'];
                var limit = req.query['limit'];

                contactActivityManager.listActivitiesByContactId(accountId, contactId, skip, limit, function(err, value){
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
                return self.send403(req);
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
                return self.send403(req);
            } else {
                var contactActivity = new $$.m.ContactActivity(req.body);
                contactActivity.set('accountId', accountId);

                contactActivityManager.createActivity(contactActivity, function(err, value){
                    self.log.debug('<< getActivityById');
                    self.sendResultOrError(resp, err, value, "Error getting activity by ID.");
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
     *
     */
    findActivities: function(req, res) {
        var self = this;
        self.log.debug('>> findActivities');

        var accountId = parseInt(self.accountId(req));
        self.log.debug('>> accountId', accountId);
        self.checkPermissionForAccount(req, self.sc.privs.VIEW_CONTACT, accountId, function(err, isAllowed) {
            if (isAllowed !== true) {
                return self.send403(req);
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
                var skip = req.query['skip'];
                var limit = req.query['limit'];

                contactActivityManager.findActivities(accountId, contactId, activityTypeAry, noteText, detailText,
                    beforeTimestamp, afterTimestamp, skip, limit, function(err, list){
                        self.log.debug('<< findActivities');
                        self.sendResultOrError(res, err, list, "Error finding activities");
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
                        return self.send403(req);
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

    }
    //endregion CONTACT ACTIVITY
});

module.exports = new api();
