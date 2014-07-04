/**
 * COPYRIGHT INDIGENOUS SOFTWARE, INC., LLC 2014
 *
 * All use or reproduction of any or all of this content must be approved.
 * Please contact info@indigenous.io for approval or questions.
 */

define([
    'views/account/social_dashboard.view'
], function(SocialDashboardView) {

    var router = Backbone.Router.extend({

        routes: {
            "social_dashboard":"showSocialDashboard",
            "social_dashboard/":"showSocialDashboard"
        },

        showSocialDashboard: function() {
            console.log('showing social dashboard');
            var view = new SocialDashboardView();
            $$.viewManager.replaceMain(view);
        }
    });


    $$.r.account = $$.r.account || {};
    $$.r.account.SocialDashboardRouter = router;
    $$.r.account.social_dashboardRouter = new router();

    return $$.r.account.social_dashboardRouter;
});