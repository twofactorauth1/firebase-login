/**
 * COPYRIGHT INDIGENOUS SOFTWARE, INC., LLC 2014
 *
 * All use or reproduction of any or all of this content must be approved.
 * Please contact info@INDIGENOUS SOFTWARE, INC. for approval or questions.
 */

define([
    'views/account/marketing.view'
], function(MarketingView) {

    var router = Backbone.Router.extend({

        routes: {
            "marketing":"showMarketing",
            "marketing/":"showMarketing"
        },

        showMarketing: function() {
            console.log('showing marketing');
            var view = new MarketingView();
            $$.viewManager.replaceMain(view);
        }
    });


    $$.r.account = $$.r.account || {};
    $$.r.account.MarketingRouter = router;
    $$.r.account.marketingRouter = new router();

    return $$.r.account.marketingRouter;
});