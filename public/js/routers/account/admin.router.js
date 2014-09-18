/**
 * COPYRIGHT INDIGENOUS SOFTWARE, INC., LLC 2014
 *
 * All use or reproduction of any or all of this content must be approved.
 * Please contact info@indigenous.io for approval or questions.
 */

define([
    'routers/account/contact.router',
    'routers/account/account.router',
    'routers/account/commerce.router',
    'routers/account/social_dashboard.router',
    'routers/account/cms.router',
    'views/account/admin.view',
    'views/account/dashboard.view',
    'views/account/contact.view'
], function (contactRouter, accountRouter, commerceRouter, cmsRouter, social_dashboardRouter, AdminView, DashboardView, ContactView) {

    var router = Backbone.Router.extend({

        routes: {
            "": "showMain",
            "/": "showMain",
            "dashboard":"showDashboard",
            "dashboard/":"showDashboard"
        },


        showMain: function () {
            $$.v.leftNav.updateActiveNav("");
            //var view = new AdminView();
            var view = new ContactView();
            $$.viewManager.replaceMain(view);
        },


        showDashboard: function() {
            $$.v.leftNav.updateActiveNav("dashboard");
            var view = new DashboardView();
            $$.viewManager.replaceMain(view);
        }
    });

    $$.r.account = $$.r.account || {};
    $$.r.account.AdminRouter = router;
    $$.r.account.adminRouter = new router();

    return $$.r.account.adminRouter;
});