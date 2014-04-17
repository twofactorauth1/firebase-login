/**
 * COPYRIGHT INDIGENOUS.IO, LLC 2014
 *
 * All use or reproduction of any or all of this content must be approved.
 * Please contact info@indigenous.io for approval or questions.
 */

define([
    'views/home.view'
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

    $$.r.HomeRouter = router;
    $$.r.homeRouter = new router();

    return $$.r.homeRouter;
});