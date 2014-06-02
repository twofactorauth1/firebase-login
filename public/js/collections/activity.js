/**
 * COPYRIGHT INDIGENOUS SOFTWARE, INC., LLC 2014
 *
 * All use or reproduction of any or all of this content must be approved.
 * Please contact info@INDIGENOUS SOFTWARE, INC. for approval or questions.
 */

define([
    'models/activity'
], function(Activity) {

    var collection = Backbone.Collection.extend({

        model: $$.m.Activity,


        getActivityForUser: function(userId) {
            var url = $$.api.getApiUrl("user", userId + "/biometrics");
            console.log('Activity URL: '+url);
            return this.fetchCustomUrl(url);
        }
    });

    $$.c.Activity = collection;

    return collection;
});