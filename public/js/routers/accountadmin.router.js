define([
    'views/account/admin.view'
], function (HomeView) {

    var router = Backbone.Router.extend({

        routes: {
            "":"showHome",
            "/":"showHome",
            "/home":"showHome"
        },

        showHome: function() {
            var view = new HomeView();
            $$.viewManager.replaceMain(view);
        }
    });

    $$.r.accountAdminRouter = new router();

    return $$.r.accountAdminRouter;
});