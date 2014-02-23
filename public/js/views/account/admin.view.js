define([
    'models/user',
    'models/account'
], function(User, Account) {

    var view = Backbone.View.extend({

        templateKey: "account/admin",

        userId: null,
        user: null,
        accounts: null,


        events: {

        },


        render: function() {
            var self = this
                , p1 = this.getAccount()
                , p2 = this.getUser();

            $.when(p1, p2)
                .done(function() {
                    var data = {
                        account: self.account.toJSON(),
                        user: self.user.toJSON()
                    };

                    var tmpl = $$.templateManager.get("admin-main", self.templateKey);
                    var html = tmpl(data);

                    self.show(html);
                });
        },


        getUser: function() {
            if (this.userId == null) {
                this.userId = $$.server.get($$.constants.server_props.USER_ID);
            }

            this.user = new $$.m.User({
                _id: this.userId
            });

            return this.user.fetch();
        },


        getAccount: function() {
            if (this.accountId == null) {
                this.accountId = $$.server.get($$.constants.server_props.ACCOUNT_ID);
            }

            this.account = new $$.m.Account({
                _id: this.accountId
            });

            return this.account.fetch();
        }
    });

    $$.v.account = $$.v.account || {};
    $$.v.account.AccountAdminView = view;

    return view;
});