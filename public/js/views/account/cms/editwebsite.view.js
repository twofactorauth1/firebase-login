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
        pageId: null,
        postId: null,
        websiteTitle: null,
        websiteSettings: null,
        pageHandle: null,
        subdomain: null,
        is_dragging: false,

        attributes: {
            id: "edit-website-wrapper"
        },

        events: {
            "click .btn-save-page":"savePage",
            "click .btn-cancel-page":"cancelPage",
            "click .close":"close_welcome",
            "click .launch-btn":"end_setup",
            "mousemove #sortable":"draggingComponent",
            "click .blog-title .editable":"updateTitle",
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

                    //TODO: make main panel avaliable to all views

                    self.adjustWindowSize();

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
                                    self.pageId = self.page.attributes._id;
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

                                    $(window).on("resize", self.adjustWindowSize);
                                    self.disableClickableTitles();

                                });
                        });
                    });

                });

            this.proxiedOnWebsiteEdit = $.proxy( this.onWebsiteEdit, this);
            this.$el.on("websiteedit", this.proxiedOnWebsiteEdit);
            return this;
        },

        updateTitle: function () {
            console.log('update title');
        },

        draggingComponent: function (e) {
            console.log('draggingComponent');
            var self = this;
            if(self.is_dragging) console.log('X:' + e.screenX + ' Y: '+e.screenY );
        },

        adjustWindowSize: function() {
            var iframeHeight = $('#iframe-website').height();
            var headerBar = $('#headerbar').height();
            var pageHeader = $('.pageheader').height();
            var mainViewportHeight = $(window).height() - headerBar - 5;
            $('#main-viewport').css('max-height', mainViewportHeight);

            var iframeCalc = $(window).height() - headerBar - pageHeader - 28;
            $('#iframe-website').css('min-height', iframeCalc);
        },

        setupSidebar: function(data, rightPanel, sidetmpl) {
            var self = this;
            rightPanel.html('');
            var template = sidetmpl(data);
            rightPanel.append(sidetmpl(data));
            this.delegateEvents();

            var body = $("#body");

            var componentID;

            $("#sortable").sortable({
                start: function(event, ui) {
                    self.is_dragging = true;
                },
                stop: function(event, ui) {
                    self.is_dragging = false;
                    var topComponentID = $(ui.item).prev().data('id');
                    var bottomComponentID = $(ui.item).next().data('id');
                    var $iframe = $('#iframe-website').contents();
                    $iframe.ready(function() {
                        var component = $iframe.find(".component[data-id='"+componentID+"']");
                        var cHeight = component.height();
                        var cWidth = component.width();
                        var detachedComponent = component.detach();
                        if (topComponentID != null) {
                            detachedComponent.insertAfter( $iframe.find(".component[data-id='"+topComponentID+"']") );
                        } else {
                            detachedComponent.insertBefore( $iframe.find(".component[data-id='"+bottomComponentID+"']") );
                        }
                        var newComponentLocation = $iframe.find(".component[data-id='"+componentID+"']");
                        var aTag = $iframe.find('.component[data-id="'+componentID+'"]');
                        console.log($iframe.find('.component').data('id'));
                        if (aTag.length > 0) {
                            $iframe.find('body').animate({scrollTop: aTag.offset().top},'slow');
                            $(window).trigger('hwparallax.reconfigure');
                        } else {
                            console.error('Component Not found in iFrame');
                        }
                    });
                },
                change: function( e, ui ) {
                    componentID = $(ui.item).data('id');
                    if(self.is_dragging) console.log('X:' + e.screenX + ' Y: '+e.screenY );
                },
                handle: '.dd-handle'
            });
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
            var self = this;
            console.log('editing website');
            var data = arguments[1];
            var target = data.target;

            var parent = $(target).parents(".component").eq(0);
            var componentType = $(parent).data("class");
            var componentId = $(parent).attr("data-id");
            var component = this.page.getComponentById(componentId);

            var dataClass = data.dataClass;
            var content = data.content;
            var page = data.pageId;

            console.log('data '+data+' target '+target+' parent '+parent+' componentType '+componentType+' componentId '+componentId+' component '+component+' dataClass '+dataClass+' content '+content+' page '+page);

            if (componentType == 'blog') {
                var postId = $(target).closest(".single-blog").attr("data-postid");
                console.log('Post ID: '+postId);
                self.postId = postId;
                self.getPost().done(function(){
                    //post excerpt
                    if (dataClass == 'post_excerpt') { 
                        var replaced =  content.replace(/^\s+|\s+$/g, '')
                        self.post.set({ post_excerpt: replaced });
                    }
                    //post title
                    if (dataClass == 'post_title') {
                        var replacedTitle = content.replace(/^\s+|\s+$/g, '');
                        var replacedUrl = content.replace(/^\s+|\s+$/g, '').toLowerCase().replace(/ /g,'-');
                        self.post.set({ post_title: replacedTitle, post_url: replacedUrl });
                    }
                    self.savePost();
                });
            } else {
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
            }
        },

        disableClickableTitles: function() {
            console.log('disabling');
            var $iframe = $('#iframe-website');
                $iframe.ready(function() {
                    $iframe.contents().find(".blog-title a").on('click', function(e) {
                        console.log('click');
                        e.preventDefault();
                    });
                });
        },

        getPost: function() {
            console.log('Getting Post: '+this.postId);
            if (this.postId == null) {
                this.post = new Post({});
                var deferred = $.Deferred();
                deferred.resolve(this.post);
                return deferred;
            }
            this.post = new Post({
                _id:this.postId,
                pageId:this.pageId
            });

            return this.post.fetch();
        },


        savePost: function() {
            var self = this;
            this.post.save()
                .done(function() {
                    console.log('post saved');
                    self.postID = null;
                })
                .fail(function(resp) {
                    alert("There was an error saving this post! "+JSON.stringify(resp));
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
                _id: this.pageId,
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
            if(!this.user.get('welcome_alert').editwebsite){
                $('.alert').hide();
            }
        },

        close_welcome: function(e) {
            var user = this.user;
            var welcome = user.get("welcome_alert");
            welcome.editwebsite = false;
            user.set("welcome_alert", welcome);
            user.save();
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
