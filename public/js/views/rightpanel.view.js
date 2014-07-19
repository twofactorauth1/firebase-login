define([
    'views/account/cms/editwebsite.view',
    'utils/utils',
    'models/cms/components/blog',
    'services/cms.service',
    'events/events'
], function (EditWebsite, utils, Blog, CmsService,events) {

    var view = EditWebsite.extend({

        subdomain: null,
        websiteSettings: null,
        themeId: null,

        //temporary themes
        themes: null,

        el: "#rightpanel",
        templateKey: "account/cms/website",

        events: {
            "click .dd-item":"scrollToSection",
            "change #nestable": "updateOrder",
            "hover .component": "showComponentOptions",
            "click .add_section": "addSection",
            "click #drop-zone": "drop_click",
            "change #file":"upload_color_pic",
            "click .btn-change-palette":"changePalette",
            "click .clear-image":"clearImage",
            "click .save-palette":"savePalette",
            "click .btn-change-theme":"changeThemeModal",
            "click .btn-edit-theme":"editTheme",
            "click #change-theme-modal .thumbnail": "selectTheme",
            "click .change-theme":"changeTheme",
            "change .dd": "onComponentDrag",
            "click .btn-add-component":"addComponent",
            "click .add-post":"addBlankPost",
            "click .add-page":"addBlankPage",
            "change .sort-ordering": "sort_contact"
        },

        initialize: function () {
            console.log('rendering');
            var self = this
                , p1 = this.getAccount()
                , p2 = this.getWebsite()
                , p3 = this.getAllThemes();

            $.when(p1)
                .done(function () {
                    self.subdomain = self.account.attributes.subdomain;
                    self.themeId = self.account.attributes.website.themeId;
            });

            $.when(p2)
                .done(function () {
                self.websiteSettings = self.website.attributes.settings;
            });
        },

        renderHtml: function(html) {
            this.show(html);
        },

        sort_contact: function (e){
            $$.e.ContactSortingEvent.trigger("sortContact", {sort_type: e.target.value});
        },


        /*
         * Edit Website Sidebar
         * - Functions for Edit Website Sidebar
         */
            addBlankPage: function() {
                console.log('adding blank page');
                $('#iframe-website').contents().find('ul.navbar-nav li:last-child').before('<li><a href="#">New Page</a></li>');
            },

            addBlankPost: function() {
                var self = this;
                console.log('Adding Blank Post');
                // self.getPost().done(function () {
                //     console.log('got the post');
                // });
                //TODO if not blog page navigate there then continue
                //add blank post
                var blankPostHTML = $$.templateManager.get("blankPost", self.templateKey);

                var $iframe = $('#iframe-website');
                $iframe.ready(function() {
                    $iframe.contents().find("#main-area .entry").prepend(blankPostHTML);
                });
                //self.savePost();
            },
            // WORKING
            addComponent: function () {
                var self = this;
                console.log('adding component');
                //get component name
                var componentName = $('#component-name').val();
                //get component type
                var componentType = $('#component-type').val();
                //validate
                //add to mongo
                //get mongo id
                var newComponent = self.getComponent();
                console.log('New Component: '+JSON.stringify(newComponent));
                //add to sidebar
                var data = {
                    "id": 1,
                    "name": componentName,
                    "type": componentType
                };
                var tmpl = $$.templateManager.get("draggable-component", self.templateKey);
                var html = tmpl(data);
                $('#sortable').append(html);
                //add to site
            },
            // WORKING
            getComponent: function() {
                this.component = new Blog({});
                var deferred = $.Deferred();
                deferred.resolve(this.component);
                return deferred;
            },

            onComponentDrag: function (event) {
                var componentID = $(event.currentTarget).data('id');
                console.log('Component Dragged '+componentID);
            },

            selectTheme: function(e) {
                $('#change-theme-modal .check-theme').hide();
                $('#change-theme-modal .thumbnail').removeClass('selected');
                $(e.currentTarget).addClass('selected').find('.check-theme').show();
            },

            getAllThemes: function() {
                var self = this;

                var promise = CmsService.getAllThemes();

                promise
                    .done(function (themes) {
                        console.log('Themes: '+themes);
                        self.themes = themes;
                    })
                    .fail(function (resp) {
                        $$.viewManager.showAlert("An error occurred retreiving the Theme configuration for this website");
                    });

                return promise;
            },

            changeThemeModal: function() {
                var self = this;
                var data = {
                    themes: self.themes
                };

                var themeModal = $('#change-theme-modal');
                if (themeModal.length <= 0) {
                    var tmpl = $$.templateManager.get("change-theme-modal", self.templateKey);
                    var html = tmpl(data);
                    $('#rightpanel').append(html);
                }

                console.log('Theme ID: '+self.themeId);

                $('#change-theme-modal .thumbnail[data-themeid="'+self.themeId+'"]').addClass('selected').find('.check-theme').show();
                $('#change-theme-modal').modal('show');
            },

            changeTheme: function() {
                var self = this;
                console.log('change theme');
                $('#change-theme-modal').modal('hide');
                var selectedTheme = $('.thumbnail.selected');
                if (selectedTheme.length > 0) {
                    var themeId = selectedTheme.data('themeid');
                    console.log(themeId+ ' theme selected ');
                    //update mongo
                    console.log('Current ThemeId: '+self.account.attributes.website.themeId);

                    //actual code when api works
                    self.account.set("updateType","website");
                    self.account.set('website', {'themeId': themeId});
                     self.account.save();

                    //refresh theme
                    document.getElementById('iframe-website').contentWindow.location.reload(true);
                    //replace preview
                    //get theme by name
                    var previewSrc = '/assets/images/theme-previews/indimain-preview.jpg';
                    $('.theme-img').attr('src', previewSrc);
                } else {
                    //show validate error
                    console.log('no theme selected ');
                }

            },

            editTheme: function() {
                console.log('edit theme');
                var self = this;
                $('#edit-theme-modal').modal('show');
            },

            changePalette: function() {
                var self = this;
                self.dragNdrop();
                $('#color-palette-modal').modal('show');
            },

            showComponentOptions: function () {
                console.log('show options');
            },

            savePalette: function () {
                var self = this;
                $('#color-palette-modal').modal('hide');
                $('#color-palette-sidebar').html('');
                this.renderSidebarColor(self.websiteSettings);
            },

            clearImage: function () {
                var self = this;
                self.website.set('settings', {'color-palette': ''});
                self.website.save();
                $('.target-image').attr('src', '');
                $('.color-thief-output').html('');
                $('.clear-image').hide();
                $('#drop-zone').show();
            },

            addSection: function() {
                //initiate modal
                $('#add-component-modal').modal('show');
            },

            renderSection: function() {
                var self = this;
                var componentItem = $$.templateManager.get("component-item", self.templateKey);
                $('.dd-list').append(componentItem);
            },

            scrollToSection: function(event) {
                var self = this;
                // var section = $(this).data('id');
                var section = $(event.currentTarget).data('id');
                var iframe = $('#iframe-website').contents();
                if (iframe.find('.component[data-id="'+section+'"]').length > 0) {
                    self.scrollToAnchor(section);
                }
            },

            updateOrder: function (e) {
                var self = this;
                console.log('update order');
                var serialize = $('.dd').nestable('serialize');
                console.log('Serialize: ' +JSON.stringify(serialize));
            },

            scrollToAnchor: function(aid){
                console.log('scrolling to anchor '+aid);
                var iframe = $('#iframe-website').contents();
                var aTag = iframe.find('.component[data-id="'+aid+'"]');
                $('#iframe-website').contents().find('body').animate({scrollTop: aTag.offset().top},'slow');
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

                self.websiteSettings = {'color-palette': colorThiefOutput};

                var colorThiefOuputHTML = $$.templateManager.get("color-thief-output-template", self.templateKey);
                console.log('HTML: '+colorThiefOuputHTML);
                //var html = colorThiefOuputHTML(colorThiefOutput);
                $imageSection.addClass('with-color-thief-output');
                $imageSection.find('.run-functions-button').addClass('hide');
                $imageSection.find('.color-thief-output').append(colorThiefOuputHTML(colorThiefOutput)).slideDown();
                $('.clear-image').show();

                // If the color-thief-output div is not in the viewport or cut off, scroll down.
                var windowHeight          = $(window).height();
                var currentScrollPosition = $('body').scrollTop();
                var outputOffsetTop       = $imageSection.find('.color-thief-output').offset().top;
                if ((currentScrollPosition < outputOffsetTop) && (currentScrollPosition + windowHeight - 250 < outputOffsetTop)) {
                   $('body').animate({scrollTop: outputOffsetTop - windowHeight + 200 + "px"});
                }
            },

            dragNdrop: function() {
                console.log('drag and drop');
                var self = this;
                // Setup the drag and drop behavior if supported
                if (Modernizr.draganddrop) {
                    console.log('modernizer');
                    $('#drag-drop').show();
                    var dropZone = $('#drop-zone');
                    var handleDragEnter = function(event){
                      console.log('handleDragEnter');
                      dropZone.addClass('dragging');
                      return false;
                    };
                    var handleDragLeave = function(event){
                      dropZone.removeClass('dragging');
                      return false;
                    };
                    var handleDragOver = function(event){
                      console.log('handleDragOver');
                      return false;
                    };
                    var handleDrop = function(event){
                      console.log('handleDrop');
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

            upload_color_pic: function(event) {
                console.log('uploading color pic');
                var self = this;
                $('#drop-zone').hide();
                self.handleFiles($("input[type=file]").get(0).files);
            },

            drop_click: function() {
                console.log('file click');
                $("#file").trigger('click');
                return false;
            }

    });

    $$.v.RightPanel = view;
    return view;
});