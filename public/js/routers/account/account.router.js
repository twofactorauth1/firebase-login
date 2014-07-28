/**
 * COPYRIGHT INDIGENOUS SOFTWARE, INC., LLC 2014
 *
 * All use or reproduction of any or all of this content must be approved.
 * Please contact info@indigenous.io for approval or questions.
 */

define([
    'views/account/account.view',
    'views/account/accountedit.view',
    'views/account/businessinfo.view'
], function(AccountView,AccountEditView, BusinessInfoView) {

    var router = Backbone.Router.extend({

        routes: {
            "account":"showMain",
            "account/edit/:accountId": "editAccount",
            "account/edit/:accountId/businessinfo": "editBusinessInfo"
        },
        editBusinessInfo: function (accountId) {
            this._onCall();
            /* if (contactId == null) {
             contactId = letter;
             }*/

            var view = new BusinessInfoView();
            if (accountId == "new") {
                view.isNew = true;
            } else {
                view.accountId = accountId;
            }
            //view.currentLetter = letter;
            $$.viewManager.replaceMain(view);
        },
        editAccount: function (accountId) {
            this._onCall();
           /* if (contactId == null) {
                contactId = letter;
            }*/

            var view = new AccountEditView();
            if (accountId == "new") {
                view.isNew = true;
            } else {
                view.accountId = accountId;
            }
            //view.currentLetter = letter;
            $$.viewManager.replaceMain(view);
        },
        _onCall: function() {
                $$.v.leftNav.updateActiveNav("account");
        },

        showMain: function() {
            var view = new AccountView();
            $$.viewManager.replaceMain(view);
        }
    },
    {

        navigateToEditAccount: function (accountId,trigger) {
            if (trigger == null) {
                trigger = true;
            }

            $$.r.mainAppRouter.navigate("account/edit/" + accountId, {trigger: trigger});
            /*if (letter != null) {
                $$.r.mainAppRouter.navigate("contacts/" + letter + "/edit/" + contactId, {trigger: trigger});
            } else {
                $$.r.mainAppRouter.navigate("contacts/edit/" + contactId, {trigger: trigger});
            }*/
        },
        navigateToEditBusinessInfo: function (accountId,trigger) {
            if (trigger == null) {
                trigger = true;
            }

            $$.r.mainAppRouter.navigate("account/edit/" + accountId + "/businessinfo", {trigger: trigger});
            /*if (letter != null) {
             $$.r.mainAppRouter.navigate("contacts/" + letter + "/edit/" + contactId, {trigger: trigger});
             } else {
             $$.r.mainAppRouter.navigate("contacts/edit/" + contactId, {trigger: trigger});
             }*/
        },
        navigateToAccount: function (accountId,trigger) {
            if (trigger == null) {
                trigger = true;
            }

            $$.r.mainAppRouter.navigate("account", {trigger: trigger});
            /*if (letter != null) {
             $$.r.mainAppRouter.navigate("contacts/" + letter + "/edit/" + contactId, {trigger: trigger});
             } else {
             $$.r.mainAppRouter.navigate("contacts/edit/" + contactId, {trigger: trigger});
             }*/
        }

    });


    $$.r.account = $$.r.account || {};
    $$.r.account.AccountRouter = router;
    $$.r.account.accountRouter = new router();

    return $$.r.account.accountRouter;
});
