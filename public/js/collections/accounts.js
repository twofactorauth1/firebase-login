define([
    'models/account'
], function(Account) {

    var collection = Backbone.Collection.extend({

        model: $$.m.Account,


        getAccountsForUser: function(userId) {
            var url = $$.api.getApiUrl("user", userId + "/accounts");
            return this.fetchCustomUrl(url);
        },


        url: function(method) {
            switch(method) {
                case "GET":
                    break;
                default:
                    throw new Error("Invalid attempt for method: " + method + ", can only GET a collection");
            }
        }
    });

    $$.c.AccountCollection = collection;

    return collection;
});