define([
    'namespaces',
    'models/user',
    'models/account',
    'models/cms/website',
    'models/cms/page',
    'models/cms/post'
], function () {

    var view = Backbone.View.extend({

        el: "#rightpanel",
        templateKey: "account/cms/website",

        events: {
            "click .dd-item":"scrollToSection",
            "change #nestable": "updateOrder",
            "hover .component": "showComponentOptions",
            "click .add_section": "addSection",
            "click #drop-zone": "drop_click",
            "change #file":"upload_color_pic",
            "click .btn-change-palette":"changePalette"
        },

        changePalette: function() {
            var self = this;
            self.dragNdrop();
            //console.log('templateKey: '+self.templateKey);
            //var colorPaletteModal = $$.templateManager.get("color-palette-modal", self.templateKey);
            $('#color-palette-modal').modal('show');
        },

        renderHtml: function(html) {
            this.show(html);
        },

        showComponentOptions: function () {
            console.log('show options');
        },

        addSection: function() {
            console.log('adding section');
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
            self.handleFiles($("input[type=file]").get(0).files);
        },

        drop_click: function() {
            console.log('file click');
            $("#file").trigger('click');
            return false;
        },

    });

    $$.v.RightPanel = view;
    return view;
});