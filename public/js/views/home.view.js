/**
 * COPYRIGHT INDIGENOUS.IO, LLC 2014
 *
 * All use or reproduction of any or all of this content must be approved.
 * Please contact info@indigenous.io for approval or questions.
 */

define([
    'views/base.view',
    'models/user',
    'collections/accounts'
], function(BaseView, User, AccountCollection) {

    var view = BaseView.extend({

        templateKey: "home",

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


        getAccounts: function() {
            this.accounts = new $$.c.AccountCollection();
            return this.accounts.getAccountsForUser(this.getUserId());
        }
    });

    $$.v.HomeView = view;

    return view;
});