/**
 * COPYRIGHT INDIGENOUS SOFTWARE, INC., LLC 2014
 *
 * All use or reproduction of any or all of this content must be approved.
 * Please contact info@INDIGENOUS SOFTWARE, INC. for approval or questions.
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

        setup: null,
        websiteId: null,
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
            "click #drop-zone":"drop_click",
            "change #file":"upload_color_pic",
            "click .btn-change-palette":"changePalette"
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
                    self.subdomain = self.account.attributes.subdomain;
                    self.websiteSettings = self.website.attributes.settings;

                    // console.log('Settings: '+self.website.get('title')+' or '+self.website.attributes.title);
                    // var title = self.website.get("title");
                    // self.website.set({title:'Testing8'});
                    // console.log('Settings: '+self.website.get('title')+' or '+self.website.attributes.title);
                    // self.website.save();
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

                    self.check_setup();

                    if (!self.setup) {

                        var tmpl = $$.templateManager.get("setup-website", self.templateKey);
                        var html = tmpl(data);

                        self.show(html);
                        self.dragNdrop();
                        self.check_welcome();

                    } else {

                        var tmpl = $$.templateManager.get("edit-website", self.templateKey);
                        var html = tmpl(data);

                        self.show(html);
                        self.check_welcome();

                         var sidetmpl = $$.templateManager.get("sidebar-edit-website", self.templateKey);
                        $('#rightpanel').append(sidetmpl);
                        var colorPalette = self.websiteSettings;

                        if (colorPalette != null) {
                            var colorPaletteTemplate = $$.templateManager.get("color-thief-output-template", self.templateKey);
                            var html = colorPaletteTemplate(colorPalette['color-palette']);
                            $('#color-palette-sidebar').append(html);
                         }

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
                    }
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
            console.log('Component Type: '+componentType);
            var componentId = $(parent).attr("data-id");
            console.log('Component Type: '+componentId);
            var component = this.page.getComponentById(componentId);

            var dataClass = data.dataClass;
            var content = data.content;
            var page = data.pageId;

            var configComponents = this.themeConfig.components;
            console.log('Config Components: '+JSON.stringify(configComponents));
            var componentConfig = _.findWhere(configComponents, { type: componentType });
            console.log('Component Config: '+JSON.stringify(componentConfig));
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

        showColorsForImage: function($image, $imageSection ) {
            var self = this;
            var colorThief = new ColorThief();
            var image                    = $image[0];
            var start                    = Date.now();
            var color                    = colorThief.getColor(image);
            var elapsedTimeForGetColor   = Date.now() - start;
            var palette                  = colorThief.getPalette(image);
            var elapsedTimeForGetPalette = Date.now() - start + elapsedTimeForGetColor;

            var colorThiefOutput = {
              color: color,
              palette: palette,
              elapsedTimeForGetColor: elapsedTimeForGetColor,
              elapsedTimeForGetPalette: elapsedTimeForGetPalette
            };
            console.log('Color Output: '+JSON.stringify(colorThiefOutput));

            //send pallete to website settings
             self.website.set('settings', {'color-palette': colorThiefOutput});
             self.website.save();

            var colorThiefOuputHTML = $$.templateManager.get("color-thief-output-template", self.templateKey);
            //var html = colorThiefOuputHTML(colorThiefOutput);
            $imageSection.addClass('with-color-thief-output');
            $imageSection.find('.run-functions-button').addClass('hide');
            $imageSection.find('.color-thief-output').append(colorThiefOuputHTML(colorThiefOutput)).slideDown();

            // If the color-thief-output div is not in the viewport or cut off, scroll down.
            var windowHeight          = $(window).height();
            var currentScrollPosition = $('body').scrollTop();
            var outputOffsetTop       = $imageSection.find('.color-thief-output').offset().top;
            if ((currentScrollPosition < outputOffsetTop) && (currentScrollPosition + windowHeight - 250 < outputOffsetTop)) {
               $('body').animate({scrollTop: outputOffsetTop - windowHeight + 200 + "px"});
            }
        },

        dragNdrop: function() {
            var self = this;
            // Setup the drag and drop behavior if supported
            if (Modernizr.draganddrop) {
                $('#drag-drop').show();
                var dropZone = $('#drop-zone');
                var handleDragEnter = function(event){
                  dropZone.addClass('dragging');
                  return false;
                };
                var handleDragLeave = function(event){
                  dropZone.removeClass('dragging');
                  return false;
                };
                var handleDragOver = function(event){
                  return false;
                };
                var handleDrop = function(event){
                  dropZone.removeClass('dragging');
                  self.handleFiles(event.originalEvent.dataTransfer.files);
                  return false;
                };
                dropZone.on('dragenter', handleDragEnter).on('dragleave', handleDragLeave).on('dragover', handleDragOver).on('drop', handleDrop);
            }
        },

        handleFiles: function(files) {
            console.log('handleFiles'+files);
            $('.dropped-image').remove();
            var self = this;
            var draggedImages = $('#dragged-images');
            var imageType      = /image.*/;
            var fileCount      = files.length;
            console.log('File Count:'+fileCount);

            for (var i = 0; i < fileCount; i++) {
              console.log('File #:'+i);
              var file = files[i];

              if (file.type.match(imageType)) {
                var reader = new FileReader();
                reader.onload = function(event) {
                    console.log('reader');
                    var imageInfo = { images: [
                        {'class': 'dropped-image', file: event.target.result}
                      ]};

                    var tmpl = $$.templateManager.get("image-section-template", self.templateKey);
                    var html = tmpl(imageInfo);

                    console.log('Key: '+self.templateKey+' Template: '+tmpl);

                    draggedImages.prepend(html);

                    var imageSection = draggedImages.find('.image-section').first();
                    var image        = $('.dropped-image .target-image');

                    // Must wait for image to load in DOM, not just load from FileReader
                    image.on('load', function() {
                        console.log('image on load');
                      self.showColorsForImage(image, imageSection);
                    });
                  };
                reader.readAsDataURL(file);
              } else {
                alert('File must be a supported image type.');
              }
            }
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

        check_setup: function() {
            var self = this;
            if( $.cookie('website-setup') === 'true' ){
                this.setup = true;
            }

            //self.account.save();
             // if (settings.setup = null) {
             //    settings.setup = false
             // }
        },

        changePalette: function() {
            console.log('changing palette');
        },

        drop_click: function() {
            $("#file").trigger('click');
            return false;
        },

        end_setup: function(e) {
            var self = this;
            this.setup = true;
            //tempoary until variable set up in mongo


            $.cookie('website-setup', 'true', { path: '/' });
            this.render();
        },

        upload_color_pic: function(event) {
            var self = this;

            self.handleFiles($("input[type=file]").get(0).files);
        }
    });


    $$.v.account = $$.v.account || {};
    $$.v.account.cms = $$.v.account.cms || {};
    $$.v.account.cms.EditWebsiteView = view;

    return view;
});
