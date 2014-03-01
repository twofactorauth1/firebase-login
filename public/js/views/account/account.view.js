define([
    'views/base.view'
], function(BaseView) {

    var view = BaseView.extend({

        templateKey: "account/account",


        events: {

        },


        render: function() {
            var tmpl = $$.templateManager.get("account-main", this.templateKey);
            var html = tmpl({});
            this.show(html);
        }
    });


    $$.v.account = $$.v.account || {};
    $$.v.account.AccountView = view;

    return view;
});