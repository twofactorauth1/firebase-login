/**
 * COPYRIGHT INDIGENOUS.IO, LLC 2014
 *
 * All use or reproduction of any or all of this content must be approved.
 * Please contact info@indigenous.io for approval or questions.
 */

define([], function() {

    var view = Backbone.View.extend({

        accountId: null,
        account: null,

        userId: null,
        user: null,


        getAccountId: function() {
            if (this.accountId == null) {
                this.accountId = $$.server.get($$.constants.server_props.ACCOUNT_ID);
            }
            return this.accountId;
        },


        getAccount: function() {
            this.account = new $$.m.Account({
                _id: this.getAccountId()
            });

            return this.account.fetch();
        },


        getUserId: function() {
            if (this.userId == null) {
                this.userId = $$.server.get($$.constants.server_props.USER_ID);
            }
            return this.userId;
        },


        getUser: function() {
            this.user = new $$.m.User({
                _id: this.getUserId()
            });

            return this.user.fetch();
        }
    });

    $$.v.BaseView = view;

    return view;
});
