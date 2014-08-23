/**
 * COPYRIGHT INDIGENOUS SOFTWARE, INC., LLC 2014
 *
 * All use or reproduction of any or all of this content must be approved.
 * Please contact info@indigenous.io for approval or questions.
 */

var baseApi = require('../base.api');
var contactDao = require('../../dao/contact.dao');
var contactActivityDao = require('../../dao/contactactivity.dao');
var cookies = require('../../utils/cookieutil');
var Contact = require('../../models/contact');

var api = function() {
    this.init.apply(this, arguments);
};

_.extend(api.prototype, baseApi.prototype, {

    base: "contact",

    dao: contactDao,

    initialize: function() {
        //GET
        app.get(this.url(':id'), this.isAuthApi, this.getContactById.bind(this));
        app.post(this.url(''), this.isAuthApi, this.createContact.bind(this));
        app.put(this.url(''), this.isAuthApi, this.updateContact.bind(this));
        app.delete(this.url(':id'), this.isAuthApi, this.deleteContact.bind(this));
        app.get(this.url(''), this.isAuthApi, this.listContacts.bind(this));
        app.get(this.url('filter/:letter'), this.isAuthApi, this.getContactsByLetter.bind(this));



      //  app.post("/signupnews", this.signUpNews.bind(this));
        app.post(this.url('signupnews'), this.isAuthApi, this.signUpNews.bind(this));


        app.get(this.url(':accountId/contacts/:letter/:skip', "account"), this.isAuthApi, this.getContactsForAccountByLetter.bind(this));

        app.get(this.url(':accountId/contacts/:letter', "account"), this.isAuthApi, this.getContactsForAccountByLetter.bind(this));

        app.get(this.url(':id/activity'), this.isAuthApi, this.getActivityByContactId.bind(this));
        app.get(this.url('activity/:id'), this.isAuthApi, this.getActivityById.bind(this));
        app.post(this.url('activity'), this.isAuthApi, this.createActivity.bind(this));
        app.put(this.url('activity'), this.isAuthApi, this.updateActivity.bind(this));

        //duplicate check
        app.get(this.url('duplicates/check'), this.isAuthApi, this.checkForDuplicates.bind(this));
        app.post(this.url('duplicates/merge'), this.isAuthApi, this.mergeDuplicates.bind(this));
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
                //TODO - add granular security - VIEW_CONTACT
                var contactAccountId = value.get('accountId');
                resp.send(value.toJSON("public"));
            } else {
                self.wrapError(resp, 401, null, err, value);
            }
        });
    },


    createContact: function(req,resp) {
        var self = this;
        self.log.debug('>> createContact');
        var accountId = parseInt(self.accountId(req));
        //TODO: Add Security - MODIFY_CONTACT
        this._saveOrUpdateContact(req, resp, true);
    },


    updateContact: function(req,resp) {
        var self = this;
        self.log.debug('>> updateContact');
        var accountId = parseInt(self.accountId(req));
        //TODO: Add Security - MODIFY_CONTACT
        this._saveOrUpdateContact(req, resp, false);
    },


    _saveOrUpdateContact: function(req, resp, isNew) {
        //TODO - add granular security
        var self = this;
        var accountId = parseInt(self.accountId(req));
        //TODO: Add Security - MODIFY_CONTACT
        var contact = new $$.m.Contact(req.body);

        if (isNew === true) {
            contact.set("accountId", accountId);
            contact.createdBy(this.userId(req), $$.constants.social.types.LOCAL);
        }

        contactDao.saveOrUpdate(contact, function(err, value) {
            if (!err) {
                self.sendResult(resp, value);
            } else {
                self.wrapError(resp, 500, "There was an error updating contact", err, value);
            }
        });
    },


    deleteContact: function(req,resp) {

        //TODO - add granular security
        var self = this;
        var contactId = req.params.id;
        var accountId = parseInt(self.accountId(req));
        //TODO: Add Security - MODIFY_CONTACT

        if (!contactId) {
            this.wrapError(resp, 400, null, "Invalid paramater for ID");
        }

        contactId = parseInt(contactId);
        contactDao.removeById(contactId, function(err, value) {
            if (!err && value != null) {
                self.sendResult(resp, value);
            } else {
                self.wrapError(resp, 401, null, err, value);
            }
        });



    },

    listContacts: function(req, res) {
        var self = this;
        var accountId = parseInt(self.accountId(req));
        var skip = parseInt(req.query['skip'] || 0);
        var limit = parseInt(req.query['limit'] || 0);
        self.log.debug('>> listContacts');
        //TODO: Add Security - VIEW_CONTACT

        contactDao.getContactsAll(accountId, skip, limit, function(err, value){
            self.log.debug('<< listContacts');
            self.sendResultOrError(res, err, value, "Error listing Contacts");
            self = null;
        });
    },

    getContactsByLetter: function(req, res) {
        var self = this;
        var accountId = parseInt(self.accountId(req));
        var skip = parseInt(req.query['skip'] || 0);
        var limit = parseInt(req.query['limit'] || 0);
        var letter = req.params.letter;
        self.log.debug('>> getContactsByLetter');
        //TODO: Add Security - VIEW_CONTACT

        contactDao.getContactsShort(accountId, letter, limit, function (err, value) {
            self.log.debug('<< getContactsByLetter');
            self.sendResultOrError(res, err, value, "Error listing contacts by letter [" + letter + "]");
            self = null;
        });

    },


    getContactsForAccountByLetter: function(req,resp) {
        //TODO - add granular security

        var self = this;
        var accountId = req.params.accountId;
        var letter = req.params.letter;
        var skip = req.params.skip || 0;
        var limit = parseInt(req.query['limit'] || 0);

        if (!accountId) {
            return self.wrapError(resp, 400, null, "Invalid parameter for account id");
        }

        accountId = parseInt(accountId);
        //TODO: Add Security - VIEW_CONTACT

        if (letter == null || letter == "") {
            letter = "a";
        }

        if (!(letter == "all") && letter.length > 1) {
            return self.wrapError(resp, 401, null, "Invalid parameter for :letter");
        }

        if(letter == "all" ) {
            contactDao.getContactsAll(accountId,skip, limit, function(err, value) {
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

    },

    checkForDuplicates: function(req, res) {
        var self = this;
        self.log.debug('>> checkForDuplicates');

        var accountId = parseInt(self.accountId(req));
        //TODO: Add Security - VIEW_CONTACT

        contactDao.findDuplicates(accountId, function(err, value){
            self.log.debug('<< checkForDuplicates');
            self.sendResultOrError(res, err, value, "Error checking for duplicate contacts");
            self = null;
        });
    },

    /**
     *
     * Body of request can be empty or an array of contact IDs to merge.
     */
    mergeDuplicates:function(req, res) {
        var self = this;
        self.log.debug('>> mergeDuplicates');

        var accountId = parseInt(self.accountId(req));
        //TODO: Add Security - MODIFY_CONTACT
        var dupeAry = _.toArray(req.body);

        contactDao.mergeDuplicates(dupeAry, accountId, function(err, value){
            self.log.debug('<< mergeDuplicates');
            self.sendResultOrError(res, err, value, "Error merging duplicate contacts");
            self = null;
        });

    },
    //endregion CONTACT

    signUpNews: function(req, resp) {
        var self = this, contact, accountToken, deferred;
        self.log.debug('>> signUpNews');
        console.log(req.body);
        var email = req.body.email;
        console.log('Email: '+JSON.stringify(email));
        var accountId = parseInt(self.accountId(req));
        //TODO: Add Security - MODIFY_CONTACT

        var accountToken = cookies.getAccountToken(req);
        console.log('Account Token: '+accountToken);

        contactDao.createContactFromData(req.body, accountToken, function (err, value) {
            if (!err) {
                req.flash("info", "Account created successfully");
            return self.sendResult(resp, value);
         //       return resp.redirect("/");
            } else {
                req.flash("error", value.toString());
            return self.wrapError(resp, 500, "account already Exists", err, value);
           //     return resp.redirect("/");
            }
        });
    },



    //region CONTACT ACTIVITY
    getActivityByContactId: function(req,resp) {
        //TODO - add granular security

        var self = this;
        var contactId = req.params.id;

        if (!contactId) {
            return self.wrapError(resp, 400, null, "Invalid parameter for contact id");
        }

        contactId = parseInt(contactId);
        var accountId = parseInt(self.accountId(req));
        //TODO: Add Security - VIEW_CONTACT
        contactActivityDao.getByContactId(contactId, function(err, value) {
            if (!err) {
                return self.sendResult(resp, value);
            } else {
                return self.wrapError(resp, 500, "failed to retrieve activity by contact id", err, value);
            }
        });
    },


    getActivityById: function(req,resp) {

    },


    createActivity: function(req,resp) {

    },


    updateActivity: function(req,resp) {

    }
    //endregion CONTACT ACTIVITY
});

module.exports = new api();

