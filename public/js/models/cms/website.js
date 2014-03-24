define([

], function () {

    var model = Backbone.Model.extend({

        defaults: {

            _id: "",

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
                    break;
                case "PUT":
                case "POST":
                    break;
                case "DELETE":
                    break;
            }
        }
    });

    $$.m.cms = $$.m.cms || {};
    $$.m.cms.Website = model;

    return model;
});
