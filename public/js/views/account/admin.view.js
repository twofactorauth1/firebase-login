define([
    'views/base.view',
    'models/user',
    'models/account'
], function(BaseView, User, Account) {

    var view = BaseView.extend({

        templateKey: "account/admin",

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
        }
    });

    $$.v.account = $$.v.account || {};
    $$.v.account.AdminView = view;

    return view;
});