/**
 * COPYRIGHT INDIGENOUS SOFTWARE, INC., LLC 2014
 *
 * All use or reproduction of any or all of this content must be approved.
 * Please contact info@INDIGENOUS SOFTWARE, INC. for approval or questions.
 */

define([
    'views/base.view',
    'models/user',
    'models/account'
], function(BaseView, User, Account) {

    var view = BaseView.extend({

        templateKey: "account/commerce",

        accounts: null,

        events: {
            "click .close":"close_welcome"
        },


        render: function() {
            console.log('render commerce');
            var self = this
                , p1 = this.getAccount()
                , p2 = this.getUser();

            $.when(p1, p2)
                .done(function() {
                    var data = {
                        account: self.account.toJSON(),
                        user: self.user.toJSON()
                    };

                    var tmpl = $$.templateManager.get("commerce-main", self.templateKey);
                    var html = tmpl(data);

                    self.show(html);
                    self.check_welcome();
                });
        },
        check_welcome: function() {
            if( $.cookie('dashboard-alert') === 'closed' ){
                $('.alert').hide();
            }
        },
        close_welcome: function(e) {
            $.cookie('dashboard-alert', 'closed', { path: '/' });
        }
    });

    $$.v.account = $$.v.account || {};
    $$.v.account.CommerceView = view;

    return view;
});