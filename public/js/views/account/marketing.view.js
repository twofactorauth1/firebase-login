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
            "click .btn-view-templates":"viewTemplates",
            "click .btn-show-add-campaign-modal": "viewAddCampaignModal",
            "click .btn-clear-campaign-modal": "clearCampaignModal",
            "click .btn-post-campaign-modal-data": "postCampaignModalData"
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

        viewAddCampaignModal: function(event) {
            var self = this;
            var data = {};
            var campaignModal = $('#add-campaign-modal');
            campaignModal.find('.datepicker').datepicker();
            campaignModal.find(".popoverLabel").popover();
            campaignModal.find('#goalVisits').val(3000);
            campaignModal.find('#goalContacts').val(500);
            campaignModal.find('#goalCustomers').val(30);
            campaignModal.find('#launchDate').val(moment().format('MM/DD/YYYY'));
            campaignModal.find('#endDate').val(moment().add('days', 7).format('MM/DD/YYYY'));
            campaignModal.modal('show');
        },

        clearCampaignModal: function() {
            console.log('clear campaign');
            $('#endDate, #launchDate, #campaignName, #goalVisits, #goalContacts, #goalCustomers').val('');
            $('#add-campaign-modal').modal('hide');
        },

        postCampaignModalData: function() {
            var campaignName = $('#campaignName').val();
            var goalVisits = $('#goalVisits').val();
            var goalContacts = $('#goalContacts').val();
            var goalCustomers = $('#goalCustomers').val();
            var launchDate = $('#launchDate').val();
            var endDate = $('#endDate').val();
            console.log('Post Data -> \n Campaign Name: '+campaignName
                +' \n Goal Visits: '+goalVisits
                +' \n Goal Contacts: '+goalContacts
                +' \n Goal Customers: '+goalCustomers
                +' \n Launch Date: '+launchDate
                +' \n End Date: '+endDate
            );

            //ADD Data Posting Function Here

            $('#add-campaign-modal').modal('hide');
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