define([], function() {

    var model = Backbone.Model.extend({

        defaults: function() {
            return {

                _id: null,

                anchor: null,

                type: "freeform",

                label:"",

                description:"",

                value: ""
            }
        },


        cleanUp: function() {
            //ensure this wasn't overwritten
            this.set({type:"freeform"});
        },


        url: function(method) {
            switch(method) {
                case "GET":
                    break;
                case "PUT":
                case "POST":
                    break;
                case "DELETE":
                    break;
            }
        }
    });
});
