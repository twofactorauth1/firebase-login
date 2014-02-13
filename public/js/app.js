define([
    'namespaces',
    'commonutils',
    'handlebarsHelpers',
    'viewManager',
    'appsetup',
    'pushStateUtils'
], function () {

    var app = {

        initialize: function () {
            var routerName = "home.router";
            if ($$.server.get("router") != null) {
                routerName = $$.server.get("router");
            }

            routerName = "routers/" + routerName;

            require([routerName], function (router) {
                $$.r.mainAppRouter = router.initialize();
                Backbone.history.start({
                    pushState:true,
                    root: "/"
                });
            });
        }
    };

    return app;

});