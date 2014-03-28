/**
 * COPYRIGHT CMConsulting LLC 2014
 *
 * All use or reproduction of any or all of this content must be approved.
 * Please contact christopher.mina@gmail.com for approval or questions.
 */

define([

], function () {

    var model = Backbone.Model.extend({

        defaults: function() {
            return {
                _id: null,

                accountId: null,

                websiteId: null,

                handle: null,

                title: null,

                seo: null,

                visibility: {
                    visible: true, //true | false
                    asOf: null,     //Timestamp, tracks the last time the visible flag was modified
                    displayOn: null //Timestamp, determines when this page becomes visible.  If null, it's ignored
                },

                components: null,

                created: null,

                modified: null
            }
        },


        url: function(method) {
            switch(method) {
                case "GET":
                    if (this.id == null) {
                        return $$.api.getApiUrl("cms", "website/" + this.get("websiteId") + "/page/" + this.get("handle"));
                    }
                    return $$.api.getApiUrl("cms", "page/" + this.id);
                case "PUT":
                case "POST":
                    return $$.api.getApiUrl("cms", "page");
                    break;
                case "DELETE":
                    return $$.api.getApiUrl("cms", "page/" + this.id);
                    break;
            }
        }
    });

    $$.m.cms = $$.m.cms || {};
    $$.m.cms.Page = model;

    return model;
});