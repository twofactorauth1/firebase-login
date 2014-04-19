/**
 * COPYRIGHT INDIGENOUS.IO, LLC 2014
 *
 * All use or reproduction of any or all of this content must be approved.
 * Please contact info@indigenous.io for approval or questions.
 */

define([
    'models/user',
    'models/account',
    'models/cms/website',
    'models/cms/page',
    'services/cms.service',
    'utils/utils'
], function (User, Account, Website, Page, CmsService, utils) {

    var view = Backbone.View.extend({

        templateKey: "account/cms/website",

        userId: null,
        user: null,
        account: null,

        websiteId: null,
        pageHandle: null,

        attributes: {
            id: "edit-website-wrapper"
        },


        events: {
            "click .btn-save-page":"savePage",
            "click .btn-cancel-page":"cancelPage"
        },


        initialize: function(options) {
            options = options || {};
            this.pageHandle = options.page || "index";
            this.websiteId = options.websiteId;
        },


        render: function () {
            var self = this
                , p1 = this.getAccount()
                , p2 = this.getUser()
                , p3 = this.getThemeConfig()
                , p4 = this.getWebsite();


            $.when(p4)
                .done(function() {
                    self.websiteId = self.website.id;
                });

            $.when(p1, p2)
                .done(function () {
                    var data = {
                        websiteId: self.websiteId
                    };

                    if (self.pageHandle == "index" || self.pageHandle == "null" || self.pageHandle == "/") {
                        data.page = "/index";
                    } else {
                        data.page = "/page/" + self.pageHandle;
                    }

                    var tmpl = $$.templateManager.get("edit-website", self.templateKey);
                    var html = tmpl(data);

                    self.show(html);

                    $("#iframe-website", this.el).load(function(pageLoadEvent) {
                        var doc = $(pageLoadEvent.currentTarget)[0].contentDocument ||
                            $(pageLoadEvent.currentTarget)[0].documentWindow;

                        var page = "index";
                        if (doc != null) {
                            var page = doc.location.pathname;
                            if (page.indexOf("/") == 0) {
                                page = page.substr(1);
                            }
                            page = page.replace("page/", "");
                            if (page == "" || page == "/") {
                                page = "index";
                            }
                            self.pageHandle = page;
                        }

                        $.when(p3, p4)
                            .done(function() {
                                self.getPage();
                            });
                    });
                });

            this.proxiedOnWebsiteEdit = $.proxy( this.onWebsiteEdit, this);
            this.$el.on("websiteedit", this.proxiedOnWebsiteEdit);
            return this;
        },


        onWebsiteEdit: function(event) {
            var data = arguments[1];
            var target = data.target;

            var parent = $(target).parents(".component").eq(0);
            var componentType = $(parent).data("class");
            var componentId = $(parent).attr("data-id");
            var component = this.page.getComponentById(componentId);

            var dataClass = data.dataClass;
            var content = data.content;
            var page = data.pageId;

            var configComponents = this.themeConfig.components;
            var componentConfig = _.findWhere(configComponents, { type: componentType });

            var configClasses = componentConfig.classes;
            for(var key in configClasses) {
                if (configClasses[key] == dataClass) {
                    dataClass = key;
                    break;
                }
            }
            component.setContent(dataClass, content, target, componentConfig);
        },


        savePage: function() {
            this.page.save()
                .done(function() {
                    $$.viewManager.showAlert("Page saved!");
                })
                .fail(function(resp) {
                    alert("There was an error saving this page!");
                });
        },


        cancelPage: function() {

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

            if (this.websiteId == null) {
                this.website = new Website({
                    accountId: this.accountId
                });
            } else {
                this.website = new Website({
                    _id: this.websiteId
                });
            }

            return this.website.fetch();
        },


        getPage: function() {
            this.page = new Page({
                websiteId: this.websiteId,
                handle: this.pageHandle
            });

            return this.page.fetch();
        },


        getThemeConfig: function () {
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
        },


        onClose: function() {
            this.$el.off("websiteedit", this.proxiedOnWebsiteEdit);
            this.proxiedOnWebsiteEdit = null;
        }
    });


    $$.v.account = $$.v.account || {};
    $$.v.account.cms = $$.v.account.cms || {};
    $$.v.account.cms.EditWebsiteView = view;

    return view;
});
