define([
    'models/contact'
], function(Contact) {

    var collection = Backbone.Collection.extend({

        model: $$.m.Contact,

        getContactsByLetter: function(accountId, letter) {
            var url = $$.api.getApiUrl("account", accountId + "/contacts/" + letter);
            return this.fetchCustomUrl(url);
        },


        url: function() {

        }
    });

    $$.c.Contacts = collection;

    return collection;
});
