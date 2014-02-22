define([], function() {

    var model = Backbone.Model.extend({

        idAttribute: "_id",

        defaults: {
            _id: null,
            accountId: 0,   //int
            first:"",       //string,
            last:"",        //string,
            type:"",        //contact_types
            photo:"",       //string
            cDate:null,     //Created Date
            cBy:null,       //Created By
            mDate:null,     //ModifiedDate
            mBy:null,       //Modified By
            siteActivity: [],
            notes: [],
            details: []
        },


        url: function(method) {
            switch(method) {
                case "GET":
                    return $$.api.getApiUrl("contact", this.id);
                    break;
                case "PUT":
                case "POST":
                    break;
                case "DELETE":
                    break;
            }
        }
    });

    $$.m.Contact = model;

    return model;
});