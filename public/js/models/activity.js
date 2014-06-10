/**
 * COPYRIGHT INDIGENOUS SOFTWARE, INC., LLC 2014
 *
 * All use or reproduction of any or all of this content must be approved.
 * Please contact info@indigenous.io for approval or questions.
 */

define([], function() {

    var model = Backbone.Model.extend({

        idAttribute: "_id",

        defaults: function() {
            return {
                _id: null
            }
        },


        getUserAccount: function(accountId) {

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

    $$.m.Activity = model;

    return model;
});
