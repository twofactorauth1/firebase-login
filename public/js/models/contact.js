define([], function() {

    var model = Backbone.Model.extend({

        idAttribute: "_id",

        defaults: {
            _id: null,
            accountId: 0,   //int
            first:"",       //string,
            middle:"",      //string,
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
                case "PUT":
                case "POST":
                    return $$.api.getApiUrl("contact", "");
                case "DELETE":
                    break;
            }
        }
    });

    $$.m.Contact = model;

    return model;
});