/**
 * COPYRIGHT INDIGENOUS SOFTWARE, INC., LLC 2014
 *
 * All use or reproduction of any or all of this content must be approved.
 * Please contact info@indigenous.io for approval or questions.
 */

define([
    'views/account/marketing.view',
    'views/account/marketingsingle.view',
    'views/account/marketingtemplates.view',
    'views/account/marketingtemplatesingle.view',
], function(MarketingView, MarketingSingleView, MarketingTemplatesView, MarketingTemplateSingleView) {

    var router = Backbone.Router.extend({

        routes: {
            "marketing":"showMarketing",
            "marketing/campaign/:campaignId":"showMarketingSingle",

            "marketing/templates":"showMarketingTemplates",
            "marketing/template/:templateId":"showMarketingTemplateSingle",
        },

        showMarketing: function() {
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
        },

        showMarketingTemplates: function () {
            var view = new MarketingTemplatesView();
            $$.viewManager.replaceMain(view);
        },

        showMarketingTemplateSingle: function (templateId) {
            if (templateId == null) {
                templateId = 1;
            }

            var view = new MarketingTemplateSingleView();
            view.templateId = templateId;
            $$.viewManager.replaceMain(view);
        },
    });


    $$.r.account = $$.r.account || {};
    $$.r.account.MarketingRouter = router;
    $$.r.account.marketingRouter = new router();

    return $$.r.account.marketingRouter;
});