define([
    'views/account/cms/editwebsite.view',
    'utils/utils',
    'models/cms/components/blog',
    'services/cms.service',
    'models/cms/post',
    'models/cms/page',
    'models/user',
    'events/events'
], function (EditWebsite, utils, Blog, CmsService, Post, Page, User, events) {

    var view = EditWebsite.extend({

        subdomain: null,
        websiteSettings: null,
        themeId: null,
        websiteId: null,
        pageId: null,
        postId: null,

        //temporary themes
        themes: null,

        el: "#rightpanel",
        templateKey: "account/cms/website",

        events: {

            //components
            "click .dd-item":"scrollToSection",
            "hover .component": "showComponentOptions",
            "click .add_section": "addSection",
            "change .dd": "onComponentDrag",
            "click .btn-add-component":"addComponent",

            //color palette
            "click #drop-zone": "drop_click",
            "change #file":"upload_color_pic",
            "click .btn-change-palette":"changePalette",
            "click .clear-image":"clearImage",
            "click .save-palette":"savePalette",

            //change theme
            "click .btn-change-theme":"changeThemeModal",
            "click .btn-edit-theme":"editTheme",
            "click #change-theme-modal .thumbnail": "selectTheme",
            "click .change-theme":"changeTheme",

            //page settings
            "change .sort-ordering": "sort_contact",
            "change .sort-display": "sort_display",

            //add blog post
            "click .add-post":"newPostModal",
            "click .create-post":"addBlankPost",
            "input #post-title":"urlCreator",
            "input #post-url":"urlCreator",

            //add page
            "click .add-page":"newPageModal",
            "click .create-page":"addBlankPage",
            "input #page-title":"urlCreator",
            "input #page-url":"urlCreator",

            //import contact modal
            "click .choose-import .btn": "changeImportSection",
            "click #import-contacts-modal .close": "closeImportModal",

            //fix duplicates modal
            "click .fix-duplicates":"showFixDuplicates",
            "click .duplicates-list li":"showMerge"
        },

        initialize: function () {
            var self = this
                , p1 = this.getAccount()
                , p2 = this.getWebsite()
                , p3 = this.getAllThemes()
                , p4 = this.getUser();

            $.when(p1)
                .done(function () {
                    self.subdomain = self.account.attributes.subdomain;
                    self.themeId = self.account.attributes.website.themeId;
            });

            $.when(p2)
                .done(function () {
                self.websiteSettings = self.website.attributes.settings;
                self.websiteId = self.website.attributes._id;
                console.log('Getting Page on rightpanel');
                self.getPage().done(function(page){
                    console.log('Page ID: '+JSON.stringify(page.attributes));
                    self.pageId = self.page.attributes._id;
                });
            });
        },

        showMerge: function() {
        },

        showFixDuplicates: function(e) {
            e.preventDefault();
            e.stopImmediatePropagation();
            $('#fixDuplicates-modal').show();
        },

        changeImportSection: function(e) {
            e.preventDefault();
            e.stopImmediatePropagation();
            var source = $(e.currentTarget).data('import-source');
            var contacts = 100;

            $('.modal-body .row').addClass('hidden');
            var progressModal = $('.row[data-import-section="progress"]');
            progressModal.removeClass('hidden');
            progressModal.find('.num').text(contacts);
            progressModal.find('.source').text(source);

            /*** TEMP UNTIL IMPORT SUCCESS CALLBACK ***/
            setTimeout(function() {
              $('.modal-body .row').addClass('hidden');
              $('.modal-body .row[data-import-section="success"]').removeClass('hidden');
            }, 3000);
        },

        closeImportModal: function() {
            $('.modal-body .row').addClass('hidden');
            $('.modal-body .row[data-import-section="choose"]').removeClass('hidden');
        },

        renderHtml: function(html) {
            this.show(html);
        },

        sort_contact: function (e){
            $$.e.ContactSortingEvent.trigger("sortContact", {sort_type: e.target.value}); // generating events
        },
        sort_display: function (e){
            $$.e.ContactSortingEvent.trigger("displayContact", {display_type: e.target.value}); // generating events
        },


        /*
         * Edit Website Sidebar
         * - Functions for Edit Website Sidebar
         */

            getPage: function() {
                console.log('getPage rightpanel');
                this.page = new Page({
                    websiteId: this.websiteId,
                    handle: 'blog'
                });

                return this.page.fetch();
            },

            addBlankPage: function() {
                var self = this;
                console.log('adding blank page'+self.is_dragging);
                $('#iframe-website').contents().find('ul.navbar-nav li:last-child').before('<li><a href="#">New Page</a></li>');
                $('#new-page-modal').modal('hide');


                //get title
                var pageTitle = $('#new-page-modal #page-title').val();

                //get url
                var pageUrl = $('#new-page-modal #page-url').val();

                var pageAuthor = self.user.attributes.first+' '+self.user.attributes.last;

                var pageDate = new Date().getTime();

                var data = {
                    pageTitle: pageTitle,
                    pageUrl: pageUrl,
                    pageAuthor: pageAuthor,
                    pageDate: moment(pageDate).format('DD.MM.YYYY')
                };

                console.log('page data: '+data);


                this.page = new Page({
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
                });

                this.page.save().done( function() {
                    console.log('page sved');
                    self.pageId = self.page.attributes._id;
                    // var $iframe = $('#iframe-website');
                    // $iframe.ready(function() {
                    //     $iframe.contents().find("#main-area .entry").prepend(html);
                    //     console.log('Blank Post ID: '+self.postId);
                    //     $iframe.contents().find("#main-area").find('.single-blog').attr('data-postid', self.postId);
                    //     $iframe.contents().find("#main-area").trigger("click");
                    // });
                });
            },

            newPageModal: function() {
                $('#new-page-modal').modal('show');
            },

            urlCreator: function(e) {
                var postUrl = $(e.currentTarget).val();
                var scrubbed = postUrl.toLowerCase().replace(/ /g,'-');
                $('#post-url').val(scrubbed);
            },

            newPostModal: function() {
                $('#new-post-modal').modal('show');
            },

            addBlankPost: function() {
                var self = this;
                console.log('User: '+JSON.stringify(self.user.attributes));

                $('#new-post-modal').modal('hide');

                var tmpl = $$.templateManager.get("blankPost", self.templateKey);

                //get title
                var postTitle = $('#new-post-modal #post-title').val();

                //get url
                var postUrl = $('#new-post-modal #post-url').val();

                var postAuthor = self.user.attributes.first+' '+self.user.attributes.last;

                var postDate = new Date().getTime();

                var data = {
                    postTitle: postTitle,
                    postUrl: postUrl,
                    postAuthor: postAuthor,
                    postDate: moment(postDate).format('DD.MM.YYYY')
                };

                var html = tmpl(data);

                this.post = new Post({
                    pageId:this.pageId,
                    post_title: postTitle,
                    post_author: postAuthor,
                    post_url: postUrl,
                    created: {
                        date: new Date().getTime(),
                        by: self.user.attributes._id
                    }
                });

                this.post.save().done( function() {
                    self.postId = self.post.attributes._id;
                    var $iframe = $('#iframe-website');
                    $iframe.ready(function() {
                        $iframe.contents().find("#main-area .entry").prepend(html);
                        console.log('Blank Post ID: '+self.postId);
                        $iframe.contents().find("#main-area").find('.single-blog').attr('data-postid', self.postId);
                        $iframe.contents().find("#main-area").trigger("click");
                    });
                });

                //navigate to new single post
                //$$.r.account.cmsRouter.viewSinglePost(postTitle, self.postId);
            },

            getPost: function() {
                console.log('Getting Post: '+this.postId);
                if (this.postId == null) {
                    this.post = new Post({});
                    var deferred = $.Deferred();
                    deferred.resolve(this.post);
                    console.log('Deferred: '+JSON.stringify(deferred));
                    return deferred;
                }
                this.post = new Post({
                    _id:this.postId,
                    pageId:this.pageId
                });

                return this.post.fetch();
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
                self.updateOrder();
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
                var section = $(event.currentTarget).data('component-id');
                console.log('Section ID: '+section);
                var iframe = $('#iframe-website').contents();
                if (iframe.find('.component[data-id="'+section+'"]').length > 0) {
                    self.scrollToAnchor(section);
                }
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