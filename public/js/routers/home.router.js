define([

], function (user, org) {

    var router = Backbone.Router.extend({

        routes: {
            "":"showHome",
            "/":"showHome",
            "/home":"showHome"
        },

        showHome: function() {
            //Testing...
            var tmpl = $$.templateManager.get("fetching-data-progress-bar", "utils");
            var html = tmpl({label:"testing only"});

            $$.viewManager.replaceMainHtml(html);
        }
    });

    $$.r.homeRouter = new router();

    return $$.r.homeRouter;
});