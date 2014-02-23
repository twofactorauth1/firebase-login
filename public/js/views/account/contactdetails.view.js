define([
    'models/contact'
], function(Contact) {

    var view = Backbone.View.extend({

        templateKey: "account/contacts",

        contactId: null,
        currentLetter: null,

        events: {

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
                    $$.v.viewManager.showAlert("There was an error retrieving this contact");
                    self.goBack();
                });
        },


        getContact: function() {
            this.contact = new Contact({
                _id:this.contactId
            });

            return this.contact.fetch();
        },


        goBack: function() {
            $$.r.AccountAdminRouter.navigateToShowContactsForLetter(this.currentLetter, true);
        }
    });

    $$.v.account = $$.v.account || {};
    $$.v.account.ContactDetails = view;

    return view;
});

