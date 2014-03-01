define([
    'views/account/admin.view',
    'views/account/contact.view',
    'views/account/contactdetails.view',
    'views/account/contactedit.view'

], function (AdminView, ContactView, ContactDetailsView, ContactEditView) {

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
                var view = new AdminView();
                $$.viewManager.replaceMain(view);
            },


            showContacts: function (letter) {
                var view = new ContactView();
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
                if (contactId == "new") {
                    view.isNew = true;
                } else {
                    view.contactId = contactId;
                }
                view.currentLetter = letter;
                $$.viewManager.replaceMain(view);
            }
        },
        {
            navigateToShowContactsForLetter: function (letter, trigger) {
                if (letter != null) {
                    $$.r.mainAppRouter.navigate("contacts/" + letter, {trigger: trigger});
                } else {
                    $$.r.mainAppRouter.navigate("contacts", {trigger: trigger});
                }
            },


            navigateToContactDetails: function(contactId, letter) {
                if (letter != null) {
                    $$.r.mainAppRouter.navigate("contacts/" + letter + "/view/" + contactId, {trigger:true});
                } else {
                    $$.r.mainAppRouter.navigate("contacts/view/" + contactId, {trigger:true});
                }
            },


            navigateToEditContact: function(contactId, letter, trigger) {
                if (trigger == null) {
                    trigger = true;
                }
                if (letter != null) {
                    $$.r.mainAppRouter.navigate("contacts/" + letter + "/edit/" + contactId, {trigger:trigger});
                } else {
                    $$.r.mainAppRouter.navigate("contacts/edit/" + contactId, {trigger:trigger});
                }
            },


            navigateToCreateContact: function(letter) {
                if (letter != null) {
                    $$.r.mainAppRouter
                    $$.r.mainAppRouter.navigate("contacts/" + letter + "/edit/new", {trigger:true});
                } else {
                    $$.r.mainAppRouter.navigate("contacts/" + "edit/new", {trigger:true});
                }
            }
        });

    $$.r.account = $$.r.account || {};
    $$.r.account.AdminRouter = router;
    $$.r.account.adminRouter = new router();

    return $$.r.account.adminRouter;
});