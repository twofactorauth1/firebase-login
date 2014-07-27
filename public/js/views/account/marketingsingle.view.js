/**
 * COPYRIGHT INDIGENOUS SOFTWARE, INC., LLC 2014
 *
 * All use or reproduction of any or all of this content must be approved.
 * Please contact info@indigenous.io for approval or questions.
 */

define([
    'views/base.view',
    'models/user',
    'models/account',
    'views/account/market_chart.view'
], function(BaseView, User, Account, MarketChartView) {

    var view = BaseView.extend({

        templateKey: "account/marketing",

        accounts: null,

        events: {
            "click .close":"close_welcome",
            "click .campaign-list li":"getCampaign",
            "click #btn-back-to-marketing":"viewMarketing",
            "click .minimize":"minimizePanel"
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
//                    self.daterangePicker();
                    self.check_welcome();

                    self.viewMailStaticsChart();
                    self.viewAgeStaticsChart();

                    $('#main-viewport').css('overflow', 'none');

                    var sidetmpl = $$.templateManager.get("marketing-sidebar", self.templateKey);
                    var rightPanel = $('#rightpanel');
                    rightPanel.html('');
                    rightPanel.append(sidetmpl);
                });
        },

        viewMailStaticsChart: function() {
            target = $('.mailStaticsChart');
            var mailStaticsChart = new MarketChartView({
                type: 'chart'
                , name: 'Marketing_MailStatics'
                , width  : target.width()
                , height : target.height()
            });

            target.replaceWith(mailStaticsChart.el);
            mailStaticsChart.render();
        },

        viewAgeStaticsChart: function() {
            target = $('.demographics .age');
            var ageStaticsChart = new MarketChartView({
                type: 'chart'
                , name: 'Marketing_AgeStatics'
                , width  : target.width()
                , height : target.height()
            });

//            target.replaceWith(ageStaticsChart.el);
//            ageStaticsChart.render();
        },

        viewMarketing: function(event) {
            event.stopImmediatePropagation();
            event.preventDefault();
            $$.r.account.marketingRouter.showMarketing();
        },

        minimizePanel: function(event) {
            console.log('Minimize Button in Panels');

              var t = jQuery(event.currentTarget);
              var p = t.closest('.panel');
              if(!t.hasClass('maximize')) {
                 p.find('.panel-body, .panel-footer').slideUp(200);
                 t.addClass('maximize');
                 t.html('<i class="fa fa-chevron-down"></i>');
              } else {
                 p.find('.panel-body, .panel-footer').slideDown(200);
                 t.removeClass('maximize');
                 t.html('<i class="fa fa-chevron-up"></i>');
              }
              return false;
        },

        daterangePicker: function() {
            $('#reportrange span').html(moment().subtract('days', 29).format('MMMM D, YYYY') + ' - ' + moment().format('MMMM D, YYYY'));
            $('#reportrange').daterangepicker({
                  ranges: {
                     'Today': [moment(), moment()],
                     'Yesterday': [moment().subtract('days', 1), moment().subtract('days', 1)],
                     'Last 7 Days': [moment().subtract('days', 6), moment()],
                     'Last 30 Days': [moment().subtract('days', 29), moment()],
                     'This Month': [moment().startOf('month'), moment().endOf('month')],
                     'Last Month': [moment().subtract('month', 1).startOf('month'), moment().subtract('month', 1).endOf('month')]
                  },
                  startDate: moment().subtract('days', 29),
                  endDate: moment()
                },
                function(start, end) {
                  console.log(start.format('MMMM D, YYYY') + ' - ' + end.format('MMMM D, YYYY'));
                    $('#reportrange span').html(start.format('MMMM D, YYYY') + ' - ' + end.format('MMMM D, YYYY'));
                });
        },

        check_welcome: function() {
            if(!this.user.get('welcome_alert').marketingsingle){
                $('.alert').hide();
            }
        },
        close_welcome: function(e) {
            var user = this.user;
            var welcome = user.get("welcome_alert");
            welcome.marketingsingle = false;
            user.set("welcome_alert", welcome);
            user.save();
        }
    });

    $$.v.account = $$.v.account || {};
    $$.v.account.MarketingSingleView = view;

    return view;
});