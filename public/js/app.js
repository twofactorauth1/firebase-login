define([
    'namespaces',
    'commonutils',
    'handlebarsHelpers',
    'indigenousHelpers',
    'viewManager',
    'appsetup',
    'pushStateUtils',
    'constants/constants'
], function (ns, common, hb, vm, appsetup) {

    var app = {

        initialize: function () {
            var accountId = $$.server.get($$.constants.server_props.ACCOUNT_ID);
            if (accountId != null) {
                $$.g.accountId = accountId;
                $$.g.isAccount = true;
            }

            var root = $$.server.get($$.constants.server_props.ROOT) || "home";
            var routerName = $$.server.get($$.constants.server_props.ROUTER) || "home";

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