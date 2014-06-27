/**
 * COPYRIGHT INDIGENOUS SOFTWARE, INC., LLC 2014
 *
 * All use or reproduction of any or all of this content must be approved.
 * Please contact info@indigenous.io for approval or questions.
 */

define([
    'views/base.view',
    'models/user',
    'models/account'
], function(BaseView, User, Account) {

    var view = BaseView.extend({

        templateKey: "account/marketing",

        accounts: null,

        events: {
            "click .close":"close_welcome",
            "click .campaign-list li":"getCampaign",
            "click #btn-back-to-marketing":"viewMarketing"
        },


        render: function() {
            console.log('render marketing single');
            var self = this
                , p1 = this.getAccount()
                , p2 = this.getUser();

            $.when(p1, p2)
                .done(function() {
                    var data = {
                        account: self.account.toJSON(),
                        user: self.user.toJSON()
                    };

                    var tmpl = $$.templateManager.get("marketing-single", self.templateKey);

                    self.show(tmpl);
                    self.check_welcome();

                    var sidetmpl = $$.templateManager.get("marketing-sidebar", self.templateKey);
                    var rightPanel = $('#rightpanel');
                    rightPanel.html('');
                    rightPanel.append(sidetmpl);
                });
        },

        viewMarketing: function(event) {
            event.stopImmediatePropagation();
            event.preventDefault();
            $$.r.account.marketingRouter.showMarketing();
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
    $$.v.account.MarketingSingleView = view;

    return view;
});