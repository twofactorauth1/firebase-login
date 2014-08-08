/**
 * COPYRIGHT INDIGENOUS SOFTWARE, INC., LLC 2014
 *
 * All use or reproduction of any or all of this content must be approved.
 * Please contact info@indigenous.io for approval or questions.
 */

define([
    'views/account/pipeshift.view'
], function(PipeshiftView) {

    var router = Backbone.Router.extend({

        routes: {
            "pipeshift":"showPipeshift"
        },

        showPipeshift: function() {
            var view = new PipeshiftView();
            $$.viewManager.replaceMain(view);
        }
    });


    $$.r.account = $$.r.account || {};
    $$.r.account.PipeshiftRouter = router;
    $$.r.account.pipeshiftRouter = new router();

    return $$.r.account.pipeshiftRouter;
});