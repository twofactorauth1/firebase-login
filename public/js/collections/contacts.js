/**
 * COPYRIGHT INDIGENOUS SOFTWARE, INC., LLC 2014
 *
 * All use or reproduction of any or all of this content must be approved.
 * Please contact info@indigenous.io for approval or questions.
 */

define([
    'models/contact'
], function(Contact) {

    var collection = Backbone.Collection.extend({

        model: $$.m.Contact,

        comparator: function(obj1, obj2) {
            if (obj1.get("last") === obj2.get("last")) {
                return obj2.get("first") < obj1.get("first") ? 1 : -1;
            } else {
                return obj2.get("last") < obj1.get("last") ? 1 : -1;
            }
        },


        getContactsByLetter: function(accountId, letter,skip,limit) {
        //    var url = $$.api.getApiUrl("account", accountId + "/contacts/" + letter);
            var url = $$.api.getApiUrl("contact","filter/"+ letter+ "?skip=" + skip + "&limit=" + limit);
            return this.fetchCustomUrl(url);
        },
        getContactsAll: function(accountId, skip, limit) {
            var url = $$.api.getApiUrl("contact", "?skip=" + skip + "&limit=" + limit);
            return this.fetchCustomUrl(url);
        },


        url: function() {

        }
    });

    $$.c.Contacts = collection;

    return collection;
});
