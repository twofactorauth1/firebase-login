var BaseApi = require('../base.api');
var ContactDao = require('../../dao/contact.dao');
var ContactActivityDao = require('../../dao/contactactivity.dao');
var cookies = require('../../utils/cookieutil');
var Contact = require('../../models/contact');

var api = function() {
    this.init.apply(this, arguments);
};

_.extend(api.prototype, BaseApi.prototype, {

    base: "contact",

    dao: ContactDao,

    initialize: function() {
        //GET
        app.get(this.url(':id'), this.isAuthApi, this.getContactById.bind(this));
        app.post(this.url(''), this.isAuthApi, this.createContact.bind(this));
        app.put(this.url(''), this.isAuthApi, this.updateContact.bind(this));
        app.delete(this.url(':id'), this.isAuthApi, this.deleteContact.bind(this));

        app.get(this.url(':accountId/contacts/:letter', "account"), this.isAuthApi, this.getContactsForAccountByLetter.bind(this));

        app.get(this.url(':id/activity'), this.isAuthApi, this.getActivityByContactId.bind(this));
        app.get(this.url('activity/:id'), this.isAuthApi, this.getActivityById.bind(this));
        app.post(this.url('activity'), this.isAuthApi, this.createActivity.bind(this));
        app.put(this.url('activity'), this.isAuthApi, this.updateActivity.bind(this));
    },



    //region CONTACT
    getContactById: function(req,resp) {
        //TODO - add granular security
        var self = this;
        var contactId = req.params.id;

        if (!contactId) {
            this.wrapError(resp, 400, null, "Invalid paramater for ID");
        }

        contactId = parseInt(contactId);
        ContactDao.getById(contactId, function(err, value) {
            if (!err) {
                resp.send(value.toJSON("public"));
            } else {
                self.wrapError(resp, 401, null, err, value);
            }
        });
    },


    createContact: function(req,resp) {
        this._saveOrUpdateContact(req, resp);
    },


    updateContact: function(req,resp) {
        this._saveOrUpdateContact(req, resp);
    },


    _saveOrUpdateContact: function(req, resp) {
        //TODO - add granular security
        var self = this;
        var contact = new $$.m.Contact(req.body);
        ContactDao.saveOrUpdate(contact, function(err, value) {
            if (!err) {
                self.sendResult(resp, value);
            } else {
                self.wrapError(resp, 500, "There was an error updating contact", err, value);
            }
        });
    },


    deleteContact: function(req,resp) {

    },


    getContactsForAccountByLetter: function(req,resp) {
        //TODO - add granular security

        var self = this;
        var accountId = req.params.accountId;
        var letter = req.params.letter;

        if (!accountId) {
            return self.wrapError(resp, 400, null, "Invalid parameter for account id");
        }

        accountId = parseInt(accountId);

        if (letter == null || letter == "") {
            letter = "a";
        }

        if (letter.length > 1) {
            return self.wrapError(resp, 401, null, "Invalid parameter for :letter");
        }

        ContactDao.getContactsShort(accountId, letter, function(err, value) {
            if (!err) {
                return self.sendResult(resp, value);
            } else {
                return self.wrapError(resp, 500, "failed to retrieve contacts by letter", err, value);
            }
        });

    },
    //endregion CONTACT


    //region CONTACT ACTIVITY
    getActivityByContactId: function(req,resp) {
        //TODO - add granular security

        var self = this;
        var contactId = req.params.id;

        if (!contactId) {
            return self.wrapError(resp, 400, null, "Invalid parameter for contact id");
        }

        contactId = parseInt(contactId);
        ContactActivityDao.getByContactId(contactId, function(err, value) {
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

