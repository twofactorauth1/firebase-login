/**
 * COPYRIGHT INDIGENOUS SOFTWARE, INC., LLC 2014
 *
 * All use or reproduction of any or all of this content must be approved.
 * Please contact info@indigenous.io for approval or questions.
 */

define([
    'views/base.view'
], function(BaseView) {

    var showDetails = function(type, typePlural){
            return function () {
                $('.li-' + type).show();
                $('.li-' + type + '.first .btn-more-' + typePlural + ' i').removeClass('fa-chevron-down').addClass('fa-chevron-up');
                $('.li-' + type + '.first .btn-more-' + typePlural + ' span').text(($('.li-' + type).length - 1) + ' Less ');
                $('.li-' + type + '.first .btn-more-' + typePlural).removeClass('btn-more-' + typePlural).addClass('btn-less-' + typePlural);
            }
        },
        hideDetails =  function(type, typePlural) {
            return function () {
                $('.li-' + type + ':not(:first)').hide();
                $('.li-' + type + '.first .btn-less-' + typePlural + ' i').removeClass('fa-chevron-up').addClass('fa-chevron-down');
                $('.li-' + type + '.first .btn-less-' + typePlural + ' span').text(($('.li-' + type).length - 1) + ' More');
                $('.li-' + type + '.first .btn-less-' + typePlural).removeClass('btn-less-' + typePlural).addClass('btn-more-' + typePlural);
            }
        };

    var view = BaseView.extend({

        templateKey: "account/account",


        events: {
            "click .btn-more-emails":"showEmails",
            "click .btn-less-emails":"hideEmails",
            "click .btn-more-phones":"showPhones",
            "click .btn-less-phones":"hidePhones",
            "click .btn-more-address":"showAddress",
            "click .btn-less-address":"hideAddress"
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

                    var allNetworks = _.pluck($$.constants.social.types.dp.slice(0), "data");

                    var networks = [];
                    self.user.get("credentials").forEach(function(creds) {
                        if (creds.type != $$.constants.social.types.LOCAL) {
                            networks.push(creds);
                        }
                        var index = allNetworks.indexOf(creds.type);
                        if (index > -1) { allNetworks.splice(index, 1); }
                    });

                    data.networks = networks;
                    data.otherNetworks = allNetworks;
                    console.log(data);
                    var tmpl = $$.templateManager.get("account-main", self.templateKey);
                    var html = tmpl(data);

                    self.show(html);
                });
        },
        showEmails: showDetails("email","emails"),
        hideEmails: hideDetails("email","emails"),

        showPhones: showDetails("phone","phones"),
        hidePhones: hideDetails("phone","phones"),

        showAddress: showDetails("address", "addresses"),
        hideAddress: hideDetails("address", "addresses")

    });


    $$.v.account = $$.v.account || {};
    $$.v.account.AccountView = view;

    return view;
});