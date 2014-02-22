define([], function() {

    var model = Backbone.Model.extend({

        idAttribute: "_id",

        defaults: function() {
            return {
                _id: null,
                username:"",
                email: "",
                first:"",
                last:"",
                profilePhotos: [],
                accounts: []
            }
        },


        url: function(method) {
            switch(method) {
                case "GET":
                    return $$.api.getApiUrl("user", this.id);
                    break;
                case "PUT":
                case "POST":
                    break;
                case "DELETE":
                    break;
            }
        }
    });

    $$.m.User = model;

    return model;
});
