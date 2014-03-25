/**
 * COPYRIGHT CMConsulting LLC 2014
 *
 * All use or reproduction of any or all of this content must be approved.
 * Please contact christopher.mina@gmail.com for approval or questions.
 */

define([
    'routers/account/contact.router',
    'routers/account/account.router',
    'routers/account/cms.router',
    'views/account/admin.view'
], function (contactRouter, accountRouter, cmsRouter, AdminView) {

    var router = Backbone.Router.extend({

        routes: {
            "": "showMain",
            "/": "showMain"
        },


        showMain: function () {
            var view = new AdminView();
            $$.viewManager.replaceMain(view);
        }
    });

    $$.r.account = $$.r.account || {};
    $$.r.account.AdminRouter = router;
    $$.r.account.adminRouter = new router();

    return $$.r.account.adminRouter;
});