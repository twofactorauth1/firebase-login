/**
 * COPYRIGHT INDIGENOUS.IO, LLC 2014
 *
 * All use or reproduction of any or all of this content must be approved.
 * Please contact info@indigenous.io for approval or questions.
 */

define([

], function(editWebsiteView) {

    var router = Backbone.Router.extend({

        routes: {
            "website": "manageWebsite",
            "website/page/:pageid": "manageWebsite",

            "website/:websiteid": "manageWebsiteById",
            "website/:websiteid/page/:pageid": "manageWebsiteById"
        },


        manageWebsite: function(page) {
            require(['views/account/cms/editwebsite.view'], function(editWebsiteView) {
                var view = new editWebsiteView({
                    page: page
                });
                $$.viewManager.replaceMain(view);
                console.log("Managing website");
            });
        },


        manageWebsiteById: function(websiteid, page) {
            require(['views/account/cms/editwebsite.view'], function(editWebsiteView) {
                var view = new editWebsiteView({
                    websiteId: websiteid,
                    page: page
                });
                $$.viewManager.replaceMain(view);
            });
            console.log("Managing website by id");
        }
    });


    $$.r.account = $$.r.account || {};
    $$.r.account.CmsRouter = router;
    $$.r.account.cmsRouter = new router();

    return $$.r.account.cmsRouter;
});