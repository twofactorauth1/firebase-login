/**
 * COPYRIGHT CMConsulting LLC 2014
 *
 * All use or reproduction of any or all of this content must be approved.
 * Please contact christopher.mina@gmail.com for approval or questions.
 */

define([
    'models/user',
    'models/account',
    'models/cms/website',
    'services/cms.service',
    //'libs/redactor/redactor',
    'utils/utils'
], function (User, Account, Website, CmsService) {

    var view = Backbone.View.extend({

        templateKey: "account/cms/website",

        userId: null,
        user: null,
        accounts: null,
        currentLetter: "a",

        events: {
            "onLoad #iframe-website":"websiteLoaded"
        },


        render: function () {
            var self = this
                , p1 = this.getAccount()
                , p2 = this.getUser()
                , p3 = this.getWebsiteConfig()
                , p4 = this.getWebsite();

            $.when(p1, p2)
                .done(function () {
                    var tmpl = $$.templateManager.get("edit-website", self.templateKey);
                    var html = tmpl({});

                    self.show(html);

                    $("#iframe-website", this.el).load(function() {
                        $.when(p3, p4)
                            .done(function() {
                                self.setupEditor();
                            });
                    });
                });

            return this;
        },


        setupEditor: function() {
            var contents = $("#iframe-website", this.el).contents();

            var config = this.themeConfig;
            var components = config.components;

            for (var i = 0, l = components.length; i < l; i++) {
                var component = components[i];
                var type = component.type;
                var clazz = component.class;

                //Check to see if we have this class in the view
                var componentElements = $("." + clazz, this.el);
                if (componentElements.length > 0) {

                }
            }

            /*
            $(".freeform-label, .freeform-description", contents).redactor({
                convertDivs: false,
                toolbarFixed: true,
                air: true
            });*/
        },


        getUser: function () {
            if (this.userId == null) {
                this.userId = $$.server.get($$.constants.server_props.USER_ID);
            }

            this.user = new User({
                _id: this.userId
            });

            return this.user.fetch();
        },


        getAccount: function () {
            if (this.accountId == null) {
                this.accountId = $$.server.get($$.constants.server_props.ACCOUNT_ID);
            }

            this.account = new Account({
                _id: this.accountId
            });

            return this.account.fetch();
        },


        getWebsite: function () {
            if (this.accountId == null) {
                this.accountId = $$.server.get($$.constants.server_props.ACCOUNT_ID);
            }

            this.website = new Website({
                accountId: this.accountId
            });

            return this.website.fetch();
        },


        getWebsiteConfig: function () {
            var self = this;
            if (this.accountId == null) {
                this.accountId = $$.server.get($$.constants.server_props.ACCOUNT_ID);
            }

            var promise = CmsService.getThemeConfigForAccount(this.accountId);

            promise
                .done(function (themeConfig) {
                    self.themeConfig = themeConfig;
                })
                .fail(function (resp) {
                    $$.viewManager.showAlert("An error occurred retreiving the Theme configuration for this website");
                });

            return promise;
        }
    });


    $$.v.account = $$.v.account || {};
    $$.v.account.cms = $$.v.account.cms || {};
    $$.v.account.cms.EditWebsiteView = view;

    return view;
});
