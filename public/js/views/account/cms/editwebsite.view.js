/**
 * COPYRIGHT INDIGENOUS SOFTWARE, INC., LLC 2014
 *
 * All use or reproduction of any or all of this content must be approved.
 * Please contact info@indigenous.io for approval or questions.
 */

define([
    'models/user',
    'models/account',
    'models/cms/website',
    'models/cms/page',
    'models/cms/post',
    'services/cms.service',
    'utils/utils',
    'views/rightpanel.view'
], function (User, Account, Website, Page, Post, CmsService, utils, RightPanel) {

    var view = Backbone.View.extend({

        templateKey: "account/cms/website",

        userId: null,
        user: null,
        account: null,

        websiteId: null,
        postId: null,
        websiteTitle: null,
        websiteSettings: null,
        pageHandle: null,
        subdomain: null,

        attributes: {
            id: "edit-website-wrapper"
        },

        events: {
            "click .btn-save-page":"savePage",
            "click .btn-cancel-page":"cancelPage",
            "click .close":"close_welcome",
            "click .launch-btn":"end_setup",
            "click .add-post":"addBlankPost"
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
                    self.websiteTitle = self.website.attributes.title;
                    self.subdomain = self.attributes.subdomain;
                    self.websiteSettings = self.website.attributes.settings;
                });

            $.when(p1, p2, p4)
                .done(function () {
                    var data = {
                        websiteId: self.websiteId,
                        websiteTitle: self.websiteTitle,
                        subdomain: self.subdomain
                    };

                    if (self.pageHandle == "index" || self.pageHandle == "null" || self.pageHandle == "/") {
                        data.page = "/index";
                    } else {
                        data.page = "/page/" + self.pageHandle;
                    }


                    var tmpl = $$.templateManager.get("edit-website", self.templateKey);
                    var html = tmpl(data);

                    var colorPalette = self.websiteSettings;

                    self.show(html);
                    self.check_welcome();

                    var sidetmpl = $$.templateManager.get("sidebar-edit-website", self.templateKey);
                    var rightPanel = $('#rightpanel');

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
                                self.getPage().done(function(){
                                    var componentsArray = [];
                                    var rawComponents = self.page.attributes.components.models;
                                    for (key in rawComponents) {
                                        if (rawComponents.hasOwnProperty(key)) {
                                            componentsArray.push(rawComponents[key]);
                                        };
                                    }
                                    var data = {
                                        components: componentsArray,
                                        colorPalette: colorPalette,
                                        account: self.account
                                    };

                                    self.setupSidebar(data, rightPanel, sidetmpl);

                                });
                        });
                    });

                });

            this.proxiedOnWebsiteEdit = $.proxy( this.onWebsiteEdit, this);
            this.$el.on("websiteedit", this.proxiedOnWebsiteEdit);
            return this;
        },

        setupSidebar: function(data, rightPanel, sidetmpl) {
            var self = this;
            rightPanel.html('');
            var template = sidetmpl(data);
            rightPanel.append(sidetmpl(data));
            this.delegateEvents();
            var nestableItems = $('#nestable');
            if (nestableItems.length > 0) {
                nestableItems.nestable({'maxDepth': '2'});
            }
            var colorPalette = self.websiteSettings;
            self.renderSidebarColor(colorPalette);
        },

        renderSidebarColor: function(colorPalette) {
            var self = this;
            console.log(colorPalette);
            if (colorPalette != null) {
                var colorPaletteTemplate = $$.templateManager.get("color-thief-output-template", self.templateKey);
                var html = colorPaletteTemplate(colorPalette['color-palette']);
                $('#color-palette-sidebar').append(html);
             }
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
            //this.savePage();
        },

        addBlankPost: function() {
            var self = this;
            console.log('Adding Blank Post');
            self.getPost().done(function () {
                console.log('got the post');
            });
            //TODO if not blog page navigate there then continue
            //add blank post
            var blankPostHTML = $$.templateManager.get("blankPost", self.templateKey);
            $('.blankPost').append(blankPostHTML);
            var $iframe = $('#iframe-website');
            $iframe.ready(function() {
                $iframe.contents().find(".blank-post").append(blankPostHTML);
            });
            self.savePost();
        },

        getPost: function () {
            console.log('Getting Post');
            var self = this;

            if (this.postId == null) {
                console.log('No Post ID');
                this.post = new Post({
                    websiteId: this.websiteId
                });
            } else {
                console.log('Post ID Found');
                this.post = new Post({
                    _id: this.postId
                });
            }

            return this.post.fetch();
        },

        savePost: function() {
            this.post.save()
                .done(function() {
                    console.log('post saved');
                    $$.viewManager.showAlert("Post saved!");
                })
                .fail(function(resp) {
                    alert("There was an error saving this post!");
                });
        },


        savePage: function() {
            this.page.save()
                .done(function() {
                    console.log('page saved');
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
        },

        check_welcome: function() {
            console.log('close welcome = '+$.cookie('website-alert') );
            if( $.cookie('website-alert') === 'closed' ){
                console.log('closing alert');
                $('.alert-info').remove();
            }
        },

        close_welcome: function(e) {
            console.log('close welcome');
            $.cookie('website-alert', 'closed', { path: '/' });
        },

        end_setup: function(e) {
            var self = this;
            this.setup = true;
            //tempoary until variable set up in mongo


            $.cookie('website-setup', 'true', { path: '/' });
            this.render();
        }
    });


    $$.v.account = $$.v.account || {};
    $$.v.account.cms = $$.v.account.cms || {};
    $$.v.account.cms.EditWebsiteView = view;

    return view;
});
