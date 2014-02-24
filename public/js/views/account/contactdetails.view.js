define([
    'models/contact'
], function(Contact) {

    var view = Backbone.View.extend({

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
            $$.r.AccountAdminRouter.navigateToEditContact(this.contactId, this.currentLetter);
        },


        goBack: function() {
            $$.r.AccountAdminRouter.navigateToShowContactsForLetter(this.currentLetter, true);
        }
    });

    $$.v.account = $$.v.account || {};
    $$.v.account.ContactDetails = view;

    return view;
});

