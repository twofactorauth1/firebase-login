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
            "click #btn-back-to-marketing":"viewMarketing",
        },

        render: function() {
            console.log('render templates');
            var self = this
                , p1 = this.getAccount()
                , p2 = this.getUser();

            $.when(p1, p2)
                .done(function() {
                    // var data = {
                    //     account: self.account.toJSON(),
                    //     user: self.user.toJSON()
                    // };

                    var tmpl = $$.templateManager.get("marketing-template-single", self.templateKey);

                    self.show(tmpl);
                    self.check_welcome();

                    self.adjustWindowSize();

                    $(window).on("resize", self.adjustWindowSize);

                    var sidetmpl = $$.templateManager.get("marketing-sidebar", self.templateKey);
                    var rightPanel = $('#rightpanel');
                    rightPanel.html('');
                    rightPanel.append(sidetmpl);
                });
        },

        adjustWindowSize: function() {
            $('#main-viewport').css('overflow', 'none');
            var headerBar = $('#headerbar').outerHeight();
            var pageHeader = $('.pageheader').outerHeight();
            var mainViewportHeight = $(window).height() - headerBar - pageHeader-10;
            $('ul.template-list').css('min-height', mainViewportHeight);
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
    $$.v.account.MarketingTemplateSingleView = view;

    return view;
});