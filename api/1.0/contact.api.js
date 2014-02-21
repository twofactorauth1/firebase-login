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

        app.get(this.url(':id/activity'), this.isAuthApi, this.getActivityByContactId.bind(this));
        app.get(this.url('activity/:id'), this.isAuthApi, this.getActivityById.bind(this));
        app.post(this.url('activity'), this.isAuthApi, this.createActivity.bind(this));
        app.put(this.url('activity'), this.isAuthApi, this.updateActivity.bind(this));
    },


    getContactById: function(req,resp) {
        //TODO - add granular security
        var self = this;
        var contactId = req.params.id;

        if (!contactId) {
            this.wrapError(resp, 400, null, "Invalid paramater for ID");
        }

        contactId = parseInt(accountId);
        ContactDao.getById(contactId, function(err, value) {
            if (!err) {
                resp.send(value.toJSON());
            } else {
                self.wrapError(resp, 401, null, err, value);
            }
        });
    },


    //region CONTACT
    createContact: function(req,resp) {

    },


    updateContact: function(req,resp) {

    },


    deleteContact: function(req,resp) {

    },
    //endregion CONTACT


    //region CONTACT ACTIVITY
    getActivityByContactId: function(req,resp) {
        //TODO - add granular security

        var self = this;
        var contactId = req.params.id;

        if (!contactId) {
            self.wrapError(resp, 400, null, "Invalid parameter for contact id");
        }

        contactId = parseInt(contactId);
        ContactActivityDao.getByContactId(contactId);
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

