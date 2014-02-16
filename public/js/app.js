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
            var root = "home";
            if ($$.server.get("root") != null) {
                root = $$.server.get("root");
            }

            var routerName = "home";
            if ($$.server.get("router") != null) {
                routerName = $$.server.get("router");
            }

            var _routerName = "routers/" + routerName + ".router";

            require([_routerName], function (router) {
                $$.r.mainAppRouter = router;
                Backbone.history.start({
                    pushState:true,
                    root: "/" + root
                });
            });
        }
    };

    return app;

});