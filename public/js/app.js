define([
    'namespaces',
    'commonutils',
    'handlebarsHelpers',
    'viewManager',
    'appsetup',
    'pushStateUtils',

    'text!templates/Utils.html',
    'compiled/hbshelpers',
    'compiled/templates',
    'compiled/apps/templates'
], function (a1,a2,a3,a4,a5,a6,utilsTemplate,hbsHelpers,mainTemplates, appTemplates) {

    $$.templateManager.setFile(utilsTemplate, "utils");

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