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
                    break;
                case "POST":
                    break;
                case "DELETE":
                    break;
            }

        }
    });

    $$.m.Account = model;

    return model;
});
