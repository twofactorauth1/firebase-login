/**
 * COPYRIGHT INDIGENOUS SOFTWARE, INC., LLC 2014
 *
 * All use or reproduction of any or all of this content must be approved.
 * Please contact info@indigenous.io for approval or questions.
 */

define([], function() {

    var model = Backbone.Model.extend({

        idAttribute: "_id",

        defaults: function() {
            return {
                _id: null,
                company: {
                    name:"",
                    type:0,
                    size:0
                },
                subdomain:"",
                website: {
                    websiteId: null,
                    themeId: null
                },
                domain:"",
                token:""
            };
        },


        getTmpAccount: function() {
            var url = $$.api.getApiUrl("account", "tmp");
            return this.fetchCustomUrl(url);
        },


        saveOrUpdateTmpAccount: function() {
            var url = $$.api.getApiUrl("account", "tmp");
            return this.saveCustomUrl(url);
        },


        url: function(method) {
            switch(method) {
                case "GET":
                    if (this.id == null) {
                        return $$.api.getApiUrl("account", "");
                    } else {
                        return $$.api.getApiUrl("account", this.id);
                    }
                    break;
                case "PUT":
                    return $$.api.getApiUrl("account", this.id);
                    break;
                case "POST":
                    return $$.api.getApiUrl("account", "");
                    break;
                case "DELETE":
                    break;
            }

        }
    });

    $$.m.Account = model;

    return model;
});
