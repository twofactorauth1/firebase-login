define([

], function (user, org) {

    var router = Backbone.Router.extend({

        routes: {
            "":"showHome",
            "/":"showHome"
        },

        showHome: function() {
            //Testing...
            var tmpl = $$.templateManager.getNow("fetching-data-progress-bar", "utils");
            var html = tmpl({label:"testing only"});

            $$.viewManager.replaceMainHtml(html);
        }
    });

    var initialize = function () {
        $$.r.homeRouter = new router();
        return $$.r.homeRouter;
    };

    return { initialize: initialize };
});