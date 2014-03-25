/**
 * COPYRIGHT CMConsulting LLC 2014
 *
 * All use or reproduction of any or all of this content must be approved.
 * Please contact christopher.mina@gmail.com for approval or questions.
 */

define([
    'views/account/cms/editwebsite.view'
], function(editWebsiteView) {

    var router = Backbone.Router.extend({

        routes: {
            "website": "manageWebsite"
        },


        manageWebsite: function() {
            var view = new editWebsiteView();
            $$.viewManager.replaceMain(view);
        }
    });


    $$.r.account = $$.r.account || {};
    $$.r.account.CmsRouter = router;
    $$.r.account.cmsRouter = new router();

    return $$.r.account.cmsRouter;
});