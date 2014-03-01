define([
    'routers/account/contact.router',
    'routers/account/account.router',
    'views/account/admin.view'
], function (contactRouter, accountRouter, AdminView) {

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