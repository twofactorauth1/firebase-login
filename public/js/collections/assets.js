define([
    'models/asset'
], function(Asset) {

    var collection = Backbone.Collection.extend({

        model: Asset,

        getAllAssetsByType: function(type) {
            var url = $$.api.getApiUrl("assets", "/type/" + type);
            return this.fetchCustomUrl(url);
        },
        getAllAssetsByTag: function(tag) {
            var url = $$.api.getApiUrl("assets", "/tag/" + tag);
            return this.fetchCustomUrl(url);
        },
        getAllAssetsBySource: function(source) {
            var url = $$.api.getApiUrl("assets", "/source/" + source);
            return this.fetchCustomUrl(url);
        },

        url: function(method) {
            switch(method) {
                case "GET":
                    return $$.api.getApiUrl("assets","" );
                    break;
            }
        }
    });

    $$.c.Assets = collection;

    return collection;
});
