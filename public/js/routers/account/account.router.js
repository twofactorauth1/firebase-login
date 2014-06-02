/**
 * COPYRIGHT INDIGENOUS SOFTWARE, INC., LLC 2014
 *
 * All use or reproduction of any or all of this content must be approved.
 * Please contact info@INDIGENOUS SOFTWARE, INC. for approval or questions.
 */

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
