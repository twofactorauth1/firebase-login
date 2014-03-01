define([
    'views/base.view'
], function(BaseView) {

    var view = BaseView.extend({

        templateKey: "account/account",


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

                    var tmpl = $$.templateManager.get("account-main", self.templateKey);
                    var html = tmpl(data);

                    self.show(html);
                });
        }
    });


    $$.v.account = $$.v.account || {};
    $$.v.account.AccountView = view;

    return view;
});