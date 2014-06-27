/**
 * COPYRIGHT INDIGENOUS SOFTWARE, INC., LLC 2014
 *
 * All use or reproduction of any or all of this content must be approved.
 * Please contact info@indigenous.io for approval or questions.
 */

define([
    'views/account/marketing.view',
    'views/account/marketingsingle.view'
], function(MarketingView, MarketingSingleView) {

    var router = Backbone.Router.extend({

        routes: {
            "marketing":"showMarketing",
            "marketing/":"showMarketing",
            "marketing/:campaignId":"showMarketingSingle"
        },

        showMarketing: function() {
            console.log('showing marketing');
            var view = new MarketingView();
            $$.viewManager.replaceMain(view);
        },

        showMarketingSingle: function (campaignId) {
            if (campaignId == null) {
                campaignId = 1;
            }

            var view = new MarketingSingleView();
            view.campaignId = campaignId;
            $$.viewManager.replaceMain(view);
        }
    });


    $$.r.account = $$.r.account || {};
    $$.r.account.MarketingRouter = router;
    $$.r.account.marketingRouter = new router();

    return $$.r.account.marketingRouter;
});