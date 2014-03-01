define([
    'views/account/account.view'
], function(AccountView) {

    var router = Backbone.Router.extend({

        routes: {
            "account":"showMain"
        },


        showMain: function() {
            var view = new AccountView();
            $$.viewManager.replaceMain(view);
        }
    });


    $$.r.account = $$.r.account || {};
    $$.r.account.AccountRouter = router;
    $$.r.account.accountRouter = new router();

    return $$.r.account.accountRouter;
});
