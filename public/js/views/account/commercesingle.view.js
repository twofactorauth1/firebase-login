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

        templateKey: "account/commerce",

        accounts: null,

        events: {
            "click .close":"close_welcome",
            "click .toggles":"minimizePanel",
            "click .btn-create-attribute":"createAttribute"
        },


        render: function() {
            console.log('render commerce');

            $('#main-viewport').css('max-height','none');

            var self = this
                , p1 = this.getAccount()
                , p2 = this.getUser();

            $.when(p1, p2)
                .done(function() {
                    var data = {
                        account: self.account.toJSON(),
                        user: self.user.toJSON()
                    };

                    var tmpl = $$.templateManager.get("commerce-single", self.templateKey);
                    var html = tmpl(data);

                    self.show(html);
                    self.initializeUIComponents();
                    var sidetmpl = $$.templateManager.get("commerce-sidebar", self.templateKey);
                    var rightPanel = $('#rightpanel');
                    rightPanel.html('');
                    rightPanel.append(sidetmpl);
                    self.check_welcome();
                });
        },

        initializeUIComponents: function() {
            // Tags Input
            $('.tags').tagsInput({width:'auto', 'defaultText':'add a color',});
            $('.toggles').toggles({
                width: 110, // width used if not set in css
                height: 35, // height if not set in css
            });
            var spinner = $('.spinner-input').spinner();
            spinner.spinner('value', 0);
        },

        minimizePanel: function(event) {
            console.log('Minimize Button in Panels');

              var t = jQuery(event.currentTarget);
              var p = t.closest('.panel');
              if(t.hasClass('maximize')) {
                 p.find('.panel-body, .panel-footer').slideUp(200);
                 t.removeClass('maximize');
              } else {
                 p.find('.panel-body, .panel-footer').slideDown(200);
                $('body').animate({scrollTop: p.offset().top},'slow');
                 t.addClass('maximize');
              }
              return false;
        },

        createAttribute: function() {
            var self = this;
            console.log('adding attribute');
            var tmpl = $$.templateManager.get("commerce-attribute", self.templateKey);
            $('#attributes-section .panel-body .form-horizontal').append(tmpl);
            $('#attribute-2.tags').tagsInput({width:'auto', 'defaultText':'add a color',});
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
    $$.v.account.CommerceSingleView = view;

    return view;
});