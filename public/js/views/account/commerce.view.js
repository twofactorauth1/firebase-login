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
            "click .commerce-item":"showSingleProduct"
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

                    var tmpl = $$.templateManager.get("commerce-main", self.templateKey);
                    var html = tmpl(data);

                    self.show(html);
                    var sidetmpl = $$.templateManager.get("commerce-sidebar", self.templateKey);
                    var rightPanel = $('#rightpanel');
                    rightPanel.html('');
                    rightPanel.append(sidetmpl);
                    self.check_welcome();
                });
        },

        showSingleProduct: function(event) {
            event.stopImmediatePropagation();
            event.preventDefault();

            var self = this;
            var singleProductId = $(event.currentTarget).data("productid");
            $$.r.account.commerceRouter.showSingleProduct(singleProductId);
        },

        check_welcome: function() {
            if(!this.user.get('welcome_alert').commerce) {
                $('.alert').hide();
            }
        },
        close_welcome: function(e) {
            var user = this.user;
            var welcome = user.get("welcome_alert");
            welcome.commerce = false;
            user.set("welcome_alert", welcome);
            user.save();
        }
    });

    $$.v.account = $$.v.account || {};
    $$.v.account.CommerceView = view;

    return view;
});