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