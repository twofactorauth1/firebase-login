define([
    'views/account/admin.view',
    'views/account/contact.view'

], function (AccountAdminView, AccountContactView) {

    var router = Backbone.Router.extend({

            routes: {
                "": "showMain",
                "/": "showMain",
                "contacts": "showContacts",
                "contacts/:letter": "showContacts"
            },


            showMain: function () {
                var view = new AccountAdminView();
                $$.viewManager.replaceMain(view);
            },


            showContacts: function (letter) {
                var view = new AccountContactView();
                view.currentLetter = letter;
                $$.viewManager.replaceMain(view);
            }
        },
        {
            navigateToShowContactsForLetter: function (letter, trigger) {
                $$.r.accountAdminRouter.navigate("contacts/" + letter, {trigger: trigger});
            }
        });

    $$.r.AccountAdminRouter = router;
    $$.r.accountAdminRouter = new router();

    return $$.r.accountAdminRouter;
});