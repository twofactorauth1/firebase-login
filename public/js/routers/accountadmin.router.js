define([
    'views/account/admin.view',
    'views/account/contact.view',
    'views/account/contactdetails.view'

], function (AccountAdminView, AccountContactView, ContactDetailsView) {

    var router = Backbone.Router.extend({

            routes: {
                "": "showMain",
                "/": "showMain",
                "contacts": "showContacts",
                "contacts/:letter": "showContacts",

                "contacts/:letter/view/:contactId": "viewContactDetails",
                "contacts/view/:contactId": "viewContactDetails",

                "contacts/:letter/edit/:contactId": "editContact",
                "contacts/edit/:contactId": "editContact"
            },


            showMain: function () {
                var view = new AccountAdminView();
                $$.viewManager.replaceMain(view);
            },


            showContacts: function (letter) {
                var view = new AccountContactView();
                view.currentLetter = letter;
                $$.viewManager.replaceMain(view);
            },


            viewContactDetails: function(letter, contactId) {
                if (contactId == null) {
                    contactId = letter;
                }

                var view = new ContactDetailsView();
                view.contactId = contactId;
                view.currentLetter = letter;
                $$.viewManager.replaceMain(view);
            },


            editContact: function(letter, contactId) {
                if (contactId == null) {
                    contactId = letter;
                }

                var view = new ContactEditView();
                view.contactId = contactId;
                view.currentLetter = letter;
                $$.viewManager.replaceMain(view);
            }
        },
        {
            navigateToShowContactsForLetter: function (letter, trigger) {
                if (letter != null) {
                    $$.r.accountAdminRouter.navigate("contacts/" + letter, {trigger: trigger});
                } else {
                    $$.r.accountAdminRouter.navigate("contacts", {trigger: trigger});
                }
            },


            navigateToContactDetails: function(contactId, letter) {
                if (letter != null) {
                    $$.r.accountAdminRouter.navigate("contacts/" + letter + "/view/" + contactId, {trigger:true});
                } else {
                    $$.r.accountAdminRouter.navigate("contacts/view/" + contactId, {trigger:true});
                }
            },


            navigateToEditContact: function(contactId, letter) {
                if (letter != null) {
                    $$.r.accountAdminRouter.navigate("contacts/" + letter + "/edit/" + contactId, {trigger:true});
                } else {
                    $$.r.accountAdminRouter.navigate("contacts/edit/" + contactId, {trigger:true});
                }
            }
        });

    $$.r.AccountAdminRouter = router;
    $$.r.accountAdminRouter = new router();

    return $$.r.accountAdminRouter;
});