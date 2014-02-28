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
                created: {
                    date: "",        //Date created
                    strategy: "",    // lo|fb|tw|li|etc.  See $$.constants.user.credential_types
                    by: null,        //this is a nullable ID value, if created by an existing user, this will be populated.
                    isNew: false     //If this is a brand new user, mark this as true, the application code will modify it later as necessary
                },
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
