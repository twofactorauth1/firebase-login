/**
 * COPYRIGHT CMConsulting LLC 2014
 *
 * All use or reproduction of any or all of this content must be approved.
 * Please contact christopher.mina@gmail.com for approval or questions.
 */

define([

], function () {

    var model = Backbone.Model.extend({

        defaults: {

            _id: null,

            accountId: null,

            settings: null,

            title: null,

            seo: null,

            linkLists: null,

            footer: null,

            created: null,

            modified: null
        },


        url: function(method) {
            switch(method) {
                case "GET":
                    if (this.id == null) {
                        return $$.api.getApiUrl("account", this.get("accountId") + "/cms/website");
                    } else {
                        return $$.api.getApiUrl("cms", "website/" + this.id);
                    }
                    break;
                case "PUT":
                case "POST":
                    return $$.api.getApiUrl("cms", "website");
                    break;
                case "DELETE":
                    return $$.api.getApiUrl("cms", "website/" + this.id);
                    break;
            }
        }
    });

    $$.m.cms = $$.m.cms || {};
    $$.m.cms.Website = model;

    return model;
});
