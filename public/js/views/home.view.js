define([
    'models/user',
    'collections/accounts'
], function(User, AccountCollection) {

    var view = Backbone.View.extend({

        templateKey: "home",

        userId: null,
        user: null,
        accounts: null,


        events: {

        },


        render: function() {
            var self = this
                , p1 = this.getAccounts()
                , p2 = this.getUser();

            $.when(p1, p2)
                .done(function() {
                    var data = {
                        accounts: self.accounts.toJSON(),
                        user: self.user.toJSON()
                    };

                    var tmpl = $$.templateManager.get("home-main", self.templateKey);
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


        getAccounts: function() {
            if (this.userId == null) {
                this.userId = $$.server.get($$.constants.server_props.USER_ID);
            }

            this.accounts = new $$.c.AccountCollection();
            return this.accounts.getAccountsForUser(this.userId);
        }
    });

    $$.v.HomeView = view;

    return view;
});