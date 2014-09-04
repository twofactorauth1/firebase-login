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
    'views/rightpanel.view',
    'libs_misc/jquery.tagsinput/jquery.tagsinput'

], function (User, Account, Website, Page, Post, CmsService, utils, RightPanel, TagsInput) {

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
        blogBoolean: false,

        attributes: {
            id: "edit-website-wrapper"
        },

        events: {
            "click .btn-save-page":"savePage",
            "click .btn-cancel-page":"cancelPage",
            "click .close":"close_welcome",
            "click .launch-btn":"end_setup",
            "mousemove #sortable":"draggingComponent",
            "click .blog-title .editable":"updateTitle"


        },

        initialize: function(options) {
            console.log(options);
            options = options || {};
            this.pageHandle = options.page || "index";
            this.websiteId = options.websiteId;

        },

        render: function () {
            var self = this
                , p1 = this.getAccount()
                , p2 = this.getUser()
                , p3 = this.getThemeConfig()
                , p4 = this.getWebsite()
                , p5 = $.Deferred()
                , themePreviewURL;

            $.when(p1)
                .done(function() {
                    self._getThemePreview( self.account.get('website').themeId).done(function(themePreview){
                        var arrayBufferView = new Uint8Array( themePreview );
                        var blob = new Blob( [ arrayBufferView ], { type: "image/jpeg" } );
                        var urlCreator = window.URL || window.webkitURL;
                        var imageUrl = urlCreator.createObjectURL( blob );

                        themePreviewURL = imageUrl;
                        p5.resolve();
                    });
                });

            $.when(p4)
                .done(function() {
                    self.websiteId = self.website.id;
                    self.websiteTitle = self.website.attributes.title;
                    self.subdomain = self.attributes.subdomain;
                    self.websiteSettings = self.website.attributes.settings;
                });

            $.when(p1, p2, p4)
                .done(function () {

                    data = {
                        websiteId: self.websiteId,
                        websiteTitle: self.websiteTitle,
                        subdomain: self.subdomain
                    };
                    data.currentThemePreviewURL = self.setThemePreview(self.account.attributes.website.themeId);

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
                        console.log(doc);
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

                            if (page.indexOf("blog") > -1) {
                                self.blogBoolean = true;
                            }

                            if (page.indexOf("blog/") > -1) {
                                console.log('editing single blog');
                                page = "single-post";
                                self.blogBoolean = true;
                            }
                            self.pageHandle = page;
                            $$.e.PageHandleEvent.trigger("pageHandle", { pageHandle: self.pageHandle });
                        }

                        $.when(p3, p4, p5)
                            .done(function() {
                                self.getPage().done(function(){
                                    self.pageId = self.page.attributes._id;
                                    console.log('This Page ID: '+self.pageId);

                                    // $("#iframe-website").contents().find('#body').data("pageid", self.pageId);
                                    // console.log('Body Tag: '+$("#iframe-website").contents().find('#body').data("pageid"));
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
                                        account: self.account,
                                        blog: self.blogBoolean,
                                        currentThemePreviewURL: themePreviewURL
                                    };

                                    self.setupSidebar(data, rightPanel, sidetmpl);

                                    $(window).on("resize", self.adjustWindowSize);
                                    self.disableClickableTitles();
                                    self.disableWaypointsOpacity();
                                });
                        });
                    });

                });

            this.proxiedOnWebsiteEdit = $.proxy( this.onWebsiteEdit, this);
            this.$el.on("websiteedit", this.proxiedOnWebsiteEdit);
            this.proxiedOnBlogEdit = $.proxy( this.blogEdit, this);
            this.$el.on("blogedit", this.proxiedOnBlogEdit);
            this.proxiedOnCategoryEdit = $.proxy( this.editCategory, this);
            this.$el.on("categoryedit", this.proxiedOnCategoryEdit);
            this.proxiedOnTagsEditInit = $.proxy( this.editTagsInit, this);
            this.$el.on("tagseditinit", this.proxiedOnTagsEditInit);
            this.proxiedOnTagsEditStart = $.proxy( this.editTagsStart, this);
            this.$el.on("tagseditstart", this.proxiedOnTagsEditStart);
            this.proxiedOnTagsEditDone = $.proxy( this.editTagsDone, this);
            this.$el.on("tagseditdone", this.proxiedOnTagsEditDone);
            return this;
        },
        editTagsInit: function () {
            var data  = arguments[1]
              , input = data.input
              , a     = data.a
              , tags  = [];

            $(a).each(function(i, elem) {
                tags.push($(elem).text());
            });

            $(input).tagsInput({
                'width': "100%",
                'removeWithBackspace': false,
            }).importTags(tags.join(','));
            $('.tagsinput').hide();

            $('body').on('click',function (e) {
                if(!( $(e.toElement||e.target).hasClass('tagsinput') || $(e.toElement||e.target).parent().hasClass('tagsinput') || $(e.toElement||e.target).parent().parent().hasClass('tagsinput') )) {
                    if ($(e.toElement || e.target).parent().parent()[0].id != 'tags_link') {
                        parent.$('#edit-website-wrapper').trigger("tagseditdone", {
                            target : e.target,
                            ul     : $('#tags_link')[0],
                            tags   : $('.tag > span', $('#tags_input_tagsinput'))
                        });
                    }
                }
            });
        },

        editTagsStart: function (){
            var data = arguments[1]
              , a = data.a
              , tags = [];
            $(a).each(function(i, elem) {
                tags.push($(elem).text());
            });
            $('.tagsinput').show();
            $("#tags_link").hide();
        },

        editTagsDone: function () {
            var self     = this
              , data     = arguments[1]
              , target   = data.target
              , tagsElem = data.tags
              , ul       = data.ul
              , tags     = []
              , markup   = ''
              , postId = $(target).closest(".single-blog").attr("data-postid");

            self.postId = postId;

            $(tagsElem).each(function(i, elem) {
                var text = $(elem).text().substring(0, $(elem).text().length - 2);
                tags.push(text);
                markup += '<li ><a href="/page/tag/"' + text + '>' + text + '</a></li>';
            });

            $("#tags_link").show();
            $('.tagsinput').hide();
            $(ul).html(markup)

            if(tags.length !== 0) {
                self.getPost().done(function () {
                    self.post.save({"post_tags": tags});
                });
            }
        },


        editCategory: function () {
            var data = arguments[1];
            var target = data.target;
            var input=data.input;

            $(target).closest("#category_link").hide();
            $(input).show().focus().val($(input).val()).css("width", "150px");
        },

        blogEdit: function (e) {
            var self=this;
            var data = arguments[1];
            var target=data.target;
            var postId = $(target).closest(".single-blog").attr("data-postid");

            self.postId=postId;
            self.getPost().done(function(){
                self.post.set("post_category", data.value)
                self.post.save();
            });
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

            if (data.blog == true) {
                $('.add-post').show();
            } else {
                $('.add-post').hide();
            }

            var body = $("#body");

            var componentID;

            $("#sortable").sortable({
                start: function(event, ui) {
                    self.is_dragging = true;
                },
                stop: function(event, ui) {
                    self.is_dragging = false;
                    var topComponentID = $(ui.item).prev().data('component-id');
                    var bottomComponentID = $(ui.item).next().data('component-id');
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
                    var serialize = $('#sortable').sortable('toArray',{attribute: 'data-component-id'});

                    console.log('serialze',serialize);
                    console.log(JSON.stringify(serialize))
                    console.log('Serialize: ' +JSON.stringify(serialize));

                    var components=self.page.get("components");

                    components.filterById(serialize);
                    console.log(components);
                    self.page.save();
                },
                change: function( e, ui ) {
                    console.log('sortable changed');
                    componentID = $(ui.item).data('component-id');
                    var start_pos = ui.item.data('start_pos');
                    if(self.is_dragging) console.log('X:' + e.screenX + ' Y: '+e.screenY );
                    var serialize = $("#sortable").sortable('toArray', {attribute: 'data-component-id'});
                    console.log('Serialize: ' +JSON.stringify(serialize));
                },
                handle: '.dd-handle'
            });

            var colorPalette = self.websiteSettings;
            self.renderSidebarColor(colorPalette);
            self.componentHover();
        },

        componentHover: function() {
                var $iframe = $('#iframe-website').contents();
                $iframe.ready(function() {
                    var components = $iframe.find(".component");
                    components.hover(
                        function() {
                            var componentId = $(this).data('id');
                            $("#sortable").find('.dd-item[data-component-id="'+componentId+'"]').addClass('active');
                        },
                        function() {
                            var componentId = $(this).data('id');
                            $("#sortable").find('.dd-item[data-component-id="'+componentId+'"]').removeClass('active');
                        }
                    );
                });
        },

        updateOrder: function (componentID, start_pos) {
            var self = this;
            console.log('update order');
            /*var serialize = $('#sortable').sortable('toArray',{attribute: 'data-component-id'});

            console.log('serialze',serialize);
            console.log(JSON.stringify(serialize))
            console.log('Serialize: ' +JSON.stringify(serialize));

            var components=self.page.get("components");

            components.filterById(serialize);*/


        //    this.page.set("components",serialize);
            //this.page.component=serialize;

       //     console.log(this.page);
           /* this.page = new Page({
                websiteId:this.websiteId,
                title: pageTitle,
                handle: pageUrl,
                components: [
                    {
                        "anchor" : null,
                        "type" : "single-page"
                    }
                ],
                created: {
                    date: new Date().getTime(),
                    by: self.user.attributes._id
                }
            });*/

 /*           this.page.save().done( function(err,res) {
                console.log(err);
                console.log(res);
                console.log('page sved');
             //   self.pageId = self.page.attributes._id;
                // var $iframe = $('#iframe-website');
                // $iframe.ready(function() {
                //     $iframe.contents().find("#main-area .entry").prepend(html);
                //     console.log('Blank Post ID: '+self.postId);
                //     $iframe.contents().find("#main-area").find('.single-blog').attr('data-postid', self.postId);
                //     $iframe.contents().find("#main-area").trigger("click");
                // });
            });*/
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
            var data = arguments[1];
            var target = data.target;

            var parent = $(target).parents(".component").eq(0);
            var componentType = $(parent).data("class");
            var componentId = $(parent).attr("data-id");
            var component = this.page.getComponentById(componentId);

            var dataClass = data.dataClass;
            var content = data.content;
            var page = data.pageId;

            //console.log('data '+data+' target '+target+' parent '+parent+' componentType '+componentType+' componentId '+componentId+' component '+component+' dataClass '+dataClass+' content '+content+' page '+page);

            if (componentType == 'blog' || componentType == 'single-post') {
                var postId = $(target).closest(".single-blog").attr("data-postid");
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
                    //post content
                    if (dataClass == 'post_content') {
                        self.post.set({ post_content: content });
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
                console.log('Component Before: '+JSON.stringify(component.attributes['_id']));
                component.setContent(dataClass, content, target, componentConfig);
                this.page.save({
                    "pageId": self.pageId,
                    "componentId": component.attributes['_id'],
                    "component": component
                }).done(function() {
                    console.log('Page Saved');
                });
            }
        },

        disableClickableTitles: function() {
            var $iframe = $('#iframe-website');
            $iframe.ready(function() {
                $iframe.contents().find(".blog-title a").on('click', function(e) {
                    e.preventDefault();
                });
            });
        },

        disableWaypointsOpacity: function() {
            var $iframe = $('#iframe-website');
            $iframe.ready(function() {
                $iframe.contents().find('.feature-single, div[data-class=profilepic], .btn-outline').css('opacity', 1);
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
            console.log('Website ID: '+this.websiteId+' Page Handle: '+this.pageHandle);
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
        },
        _getThemePreview: function (themeId) {
            return CmsService.getThemePreview(themeId);
        },
        setThemePreview: function (themeId, imageElement) {
            var self = this;
            var promise = self._getThemePreview(themeId);
            promise.responseType = "arraybuffer";
            promise.done(function (themePreview) {
                var arrayBufferView = new Uint8Array( themePreview );
                var blob = new Blob( [ arrayBufferView ], { type: "image/jpeg" } );
                var urlCreator = window.URL || window.webkitURL;
                var imageUrl = urlCreator.createObjectURL( blob );
                if (imageElement) {
                    imageElement.src = imageUrl;
                }
                self.currentThemePreviewURL = imageUrl;
            }).fail(function(resp){
                $$.viewManager.showAlert("An error occurred retreiving the Theme Preview");
            });
        }
    });


    $$.v.account = $$.v.account || {};
    $$.v.account.cms = $$.v.account.cms || {};
    $$.v.account.cms.EditWebsiteView = view;

    return view;
});
