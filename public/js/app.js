/**
 * COPYRIGHT CMConsulting LLC 2014
 *
 * All use or reproduction of any or all of this content must be approved.
 * Please contact christopher.mina@gmail.com for approval or questions.
 */

define([
    'namespaces',
    'commonutils',
    'handlebarsHelpers',
    'indigenousHelpers',
    'viewManager',
    'appsetup',
    'pushStateUtils',
    'constants/constants',
    'utils/uihelpers',
    'views/leftnav.view',
    'views/headerbar.view',
    'views/rightpanel.view'
], function (ns, common, hb, vm, appsetup) {

    var app = {

        initialize: function () {
            //Set up LeftNav View
            $$.v.leftNav = new $$.v.LeftNav();

            //Set up HeaderBar View
            $$.v.headerBar = new $$.v.HeaderBar();

            //Set up RightPanel view
            $$.v.rightPanel = new $$.v.RightPanel();

            //Set up Router
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
                    fragment = fragment.replcae("_=_", "");
                    Backbone.history.navigate(fragment, { trigger: true });
                } else {
                    var fragment = Backbone.history.getFragment();
                    fragment = fragment.replace("_=_", "");
                    Backbone.history.loadUrl(fragment)
                }
            });
        }
    };

    return app;

});