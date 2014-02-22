define([
    'views/account/admin.view',
    'views/account/contact.view'

], function (AccountAdminView, AccountContactView) {

    var router = Backbone.Router.extend({

        routes: {
            "":"showMain",
            "/":"showMain",
            "contacts":"showContacts"
        },


        showMain: function() {
            var view = new AccountAdminView();
            $$.viewManager.replaceMain(view);
        },


        showContacts: function() {
            var view = new AccountContactView();
            $$.viewManager.replaceMain(view);
        }
    });

    $$.r.accountAdminRouter = new router();

    return $$.r.accountAdminRouter;
});