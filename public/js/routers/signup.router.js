define([
    'views/signup.view'
], function(SignupView) {

    var router = Backbone.Router.extend({

        routes: {
            "":"signupStart",
            "/":"signupStart",
            ":place":"signupStart"
        },


        signupStart: function(place) {
            place = place || "start";
            var view = new SignupView();
            view.place = place;
            view.lastPlace = null;
            view.nextPlace = null;

            var oldView = $$.viewManager.getExistingMainView();
            if (oldView != null && oldView.hasOwnProperty("place")) {
                view.lastPlace = oldView.place;
                oldView.nextPlace = place;
            }

            $$.viewManager.replaceMain(view);
        }
    });

    $$.r.SignupRouter = new router();

    return $$.r.SignupRouter;
});
