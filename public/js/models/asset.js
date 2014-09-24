define([
    'backboneAssoc'
], function (backboneAssoc) {

    var model = Backbone.Model.extend({

        defaults: function() {
            return {

                 "_id" : null,

                 "accountId" : null,

                 "mimeType" : null,

                 "size" : null,

                 "filename" : null,

                 "url" : null,

                 "source" : null,

                 "tags" : [],

                 "created" : {
                    "date" : null,
                    "by" : null
                 },

                 "modified" : {
                    "date" : null,
                    "by" : null
                 },

                 "_v" : null
            }
        },

        url: function(method) {
            switch(method) {
                case "GET":
                    return $$.api.getApiUrl("assets", this.get("_id") );
                    break;
                case "PUT":
                    break;

                case "POST":
                    return $$.api.getApiUrl("assets", this.get("_id") );
                    break;
                case "DELETE":
                    return $$.api.getApiUrl("assets", this.get("_id") );
                    break;
            }
        }
    });

    $$.m = $$.m || {};
    $$.m.Asset = model;

    return model;
});