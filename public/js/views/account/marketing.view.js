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
            "click .campaign-list li":"viewSingleCampaign",
            "click .btn-view-templates":"viewTemplates"
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

                    var tmpl = $$.templateManager.get("marketing-main", self.templateKey);
                    var html = tmpl(data);

                    self.show(html);
                    self.check_welcome();

                    self.adjustWindowSize();

                    $(window).on("resize", self.adjustWindowSize);

                    var sidetmpl = $$.templateManager.get("marketing-sidebar", self.templateKey);
                    var rightPanel = $('#rightpanel');
                    rightPanel.html('');
                    rightPanel.append(sidetmpl);
                });
        },

        viewSingleCampaign: function(event) {
            event.stopImmediatePropagation();
            event.preventDefault();

            var self = this;
            var campaignId = $(event.currentTarget).data("campaignid");
            $$.r.account.marketingRouter.showMarketingSingle(campaignId);
        },

        adjustWindowSize: function() {
            $('#main-viewport').css('overflow', 'none');
            var headerBar = $('#headerbar').outerHeight();
            var pageHeader = $('.pageheader').outerHeight();
            var mainViewportHeight = $(window).height() - headerBar - pageHeader-10;
            $('ul.campaign-list').css('min-height', mainViewportHeight);
        },

        viewTemplates: function() {
            console.log('view templates');
        },

        check_welcome: function() {
            if(!this.user.get('welcome_alert').marketing){
                $('.alert').hide();
            }
        },
        close_welcome: function(e) {
            var user = this.user;
            var welcome = user.get("welcome_alert");
            welcome.marketing = false;
            user.set("welcome_alert", welcome);
            user.save();
        }
    });

    $$.v.account = $$.v.account || {};
    $$.v.account.MarketingView = view;

    return view;
});