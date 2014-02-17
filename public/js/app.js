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
                    pushState: Modernizr.history,
                    root: "/" + root,
                    silent: true
                });

                //Courtesy of http://johnkpaul.tumblr.com/post/27300270783/handling-good-old-ie-backbone-history-with-pushstate
                if(!Modernizr.history) {
                    var rootLength = Backbone.history.options.root.length;
                    var fragment = window.location.pathname.substr(rootLength);
                    Backbone.history.navigate(fragment, { trigger: true });
                } else {
                    Backbone.history.loadUrl(Backbone.history.getFragment())
                }
            });
        }
    };

    return app;

});