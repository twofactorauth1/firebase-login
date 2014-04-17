/**
 * COPYRIGHT INDIGENOUS.IO, LLC 2014
 *
 * All use or reproduction of any or all of this content must be approved.
 * Please contact info@indigenous.io for approval or questions.
 */

define([
    'views/base.view',
    'models/contact'
], function(BaseView, Contact) {

    var view = BaseView.extend({

        templateKey: "account/contacts",

        contactId: null,
        currentLetter: null,

        events: {
            "click #btn-back-to-contacts":"goBack",
            "click .btn-edit-contact":"editContact"
        },


        render: function() {
            var self = this;
            this.getContact()
                .done(function() {
                    var data = {
                        contact:self.contact.toJSON()
                    };

                    var tmpl = $$.templateManager.get("contact-details-main", self.templateKey);
                    var html = tmpl(data);
                    self.show(html);
                })
                .fail(function(resp) {
                    $$.viewManager.showAlert("There was an error retrieving this contact");
                    self.goBack();
                });
        },


        getContact: function() {
            this.contact = new Contact({
                _id:this.contactId
            });

            return this.contact.fetch();
        },


        editContact: function() {
            $$.r.account.ContactRouter.navigateToEditContact(this.contactId, this.currentLetter);
        },


        goBack: function() {
            $$.r.account.ContactRouter.navigateToShowContactsForLetter(this.currentLetter, true);
        }
    });

    $$.v.account = $$.v.account || {};
    $$.v.account.ContactDetails = view;

    return view;
});

