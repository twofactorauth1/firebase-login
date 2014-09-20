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
                    if (this.get("id")) {
                        return $$.api.getApiUrl("assets", "/" + this.get("id") );
                    }
                    return $$.api.getApiUrl("assets", "/");
                    break;
                case "PUT":
                    break;

                case "POST":
                    if (this.get("id")) {
                        return $$.api.getApiUrl("assets", "/" + this.get("id") );
                    }
                    return $$.api.getApiUrl("assets", "/");
                    break;
                case "DELETE":
                    if (this.get("id")) {
                        return $$.api.getApiUrl("assets", "/" + this.get("id") );
                    }
                    return $$.api.getApiUrl("assets", "/");
                    break;
            }
        }
    });

    $$.m = $$.m || {};
    $$.m.Asset = model;

    return model;
});