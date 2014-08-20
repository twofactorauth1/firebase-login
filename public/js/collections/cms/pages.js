/**
 * COPYRIGHT INDIGENOUS SOFTWARE, INC., LLC 2014
 *
 * All use or reproduction of any or all of this content must be approved.
 * Please contact info@indigenous.io for approval or questions.
 */

define([
    'models/cms/page'
], function(Page) {

    var collection = Backbone.Collection.extend({

        model: Page,



        getPagesAll: function(accountId, websiteid) {
        console.log(accountId,websiteid);

            var url = $$.api.getApiUrl("cms","website/"+ websiteid + "/pages/" + accountId);
        //   var url = $$.api.getApiUrl("account", websiteid + "/contacts/" + accountId);
            return this.fetchCustomUrl(url);
        },


        url: function(method) {
            switch(method) {
                case "GET":

                   /* if (this.get("websiteId") != null) {
                        return $$.api.getApiUrl("cms", "website/" + this.get("websiteId") + "/page/" + this.get("handle"));
                    }*/
                    return $$.api.getApiUrl("cms","website/"+ this.get("websiteId") + "/pages/" + this.get("accountId"));
                    break;
            }



        }
    });

    $$.c.Pages = collection;

    return collection;
});
