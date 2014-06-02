/**
 * COPYRIGHT INDIGENOUS SOFTWARE, INC., LLC 2014
 *
 * All use or reproduction of any or all of this content must be approved.
 * Please contact info@INDIGENOUS SOFTWARE, INC. for approval or questions.
 */

define([
    'views/base.view'
], function(BaseView) {

    var view = BaseView.extend({

        templateKey: "account/account",


        events: {

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

                    var tmpl = $$.templateManager.get("account-main", self.templateKey);
                    var html = tmpl(data);

                    self.show(html);
                });
        }
    });


    $$.v.account = $$.v.account || {};
    $$.v.account.AccountView = view;

    return view;
});