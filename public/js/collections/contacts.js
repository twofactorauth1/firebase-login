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


        getContactsByLetter: function(accountId, letter) {
            var url = $$.api.getApiUrl("account", accountId + "/contacts/" + letter);
            return this.fetchCustomUrl(url);
        },
        getContactsAll: function(accountId, skip) {
            var url = $$.api.getApiUrl("contact", "?skip="+skip);
            return this.fetchCustomUrl(url);
        },


        url: function() {

        }
    });

    $$.c.Contacts = collection;

    return collection;
});
