/**
 * COPYRIGHT INDIGENOUS SOFTWARE, INC., LLC 2014
 *
 * All use or reproduction of any or all of this content must be approved.
 * Please contact info@indigenous.io for approval or questions.
 */

define([
    'views/account/contact.view',
    'views/account/contactdetails.view',
    'views/account/contactedit.view'

], function (ContactView, ContactDetailsView, ContactEditView) {

    var router = Backbone.Router.extend({

            routes: {
                "contacts": "showContacts",
                "contacts/": "showContacts",
                "contacts/:letter": "showContacts",

                "contacts/:letter/view/:contactId": "viewContactDetails",
                "contacts/view/:contactId": "viewContactDetails",

                "contacts/:letter/edit/:contactId": "editContact",
                "contacts/edit/:contactId": "editContact"
            },

            _onCall: function() {
                $$.v.leftNav.updateActiveNav("contacts");
            },


            showContacts: function (letter) {
                this._onCall();
                var view = new ContactView();
                view.currentLetter = letter;
                $$.viewManager.replaceMain(view);
            },


            viewContactDetails: function (letter, contactId) {
                this._onCall();
                if (contactId == null) {
                    contactId = letter;
                }

                var view = new ContactDetailsView();
                view.contactId = contactId;
                view.currentLetter = letter;
                $$.viewManager.replaceMain(view);
            },


            editContact: function (letter, contactId) {
                this._onCall();
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


            navigateToContactDetails: function (contactId, letter) {
                if (letter != null) {
                    $$.r.mainAppRouter.navigate("contacts/" + letter + "/view/" + contactId, {trigger: true});
                } else {
                    $$.r.mainAppRouter.navigate("contacts/view/" + contactId, {trigger: true});
                }
            },


            navigateToEditContact: function (contactId, letter, trigger) {
                if (trigger == null) {
                    trigger = true;
                }
                if (letter != null) {
                    $$.r.mainAppRouter.navigate("contacts/" + letter + "/edit/" + contactId, {trigger: trigger});
                } else {
                    $$.r.mainAppRouter.navigate("contacts/edit/" + contactId, {trigger: trigger});
                }
            },


            navigateToCreateContact: function (letter) {
                if (letter != null) {
                    $$.r.mainAppRouter
                    $$.r.mainAppRouter.navigate("contacts/" + letter + "/edit/new", {trigger: true});
                } else {
                    $$.r.mainAppRouter.navigate("contacts/" + "edit/new", {trigger: true});
                }
            }
        });

    $$.r.account = $$.r.account || {};
    $$.r.account.ContactRouter = router;
    $$.r.account.contactRouter = new router();

    return $$.r.account.contactRouter;
});