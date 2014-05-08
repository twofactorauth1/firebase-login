/**
 * COPYRIGHT INDIGENOUS.IO, LLC 2014
 *
 * All use or reproduction of any or all of this content must be approved.
 * Please contact info@indigenous.io for approval or questions.
 */

define([
    'views/base.view',
    'models/user',
    'models/account',
    'models/activity'
], function(BaseView, User, Account, Activity) {

    var view = BaseView.extend({

        templateKey: "account/dashboard",

        accounts: null,

        events: {
            "click .close":"close_welcome"
        },


        render: function() {
            var self = this
                , p1 = this.getAccount()
                , p2 = this.getUser()
                , p3 = this.getActivity();

            $.when(p1, p2, p3)
                .done(function() {
                    var data = {
                        account: self.account.toJSON(),
                        user: self.user.toJSON(),
                        //activity: self.activity.toJSON()
                    };

                    var tmpl = $$.templateManager.get("dashboard-main", self.templateKey);
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
        },
        close_welcome: function(e) {
            $.cookie('dashboard-alert', 'closed', { path: '/' });
        },
        getActivity: function() {
            // if (this.accountId == null) {
            //     this.accountId = $$.server.get($$.constants.server_props.ACCOUNT_ID);
            // }
            // this.activity = new $$.c.Activity();
            // return this.activity(this.accountId);
        },
    });

    $$.v.account = $$.v.account || {};
    $$.v.account.AdminView = view;

    return view;
});