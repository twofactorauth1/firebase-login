define([
    "text!libs/jqueryfileupload/templates.html",
    "./vendor/jquery.ui.widget",         //required
    "./tmpl",                         //small templating engine used by this lib
    "./load-image",                  //photo previews and image resizing
    "./canvas-to-blob",              //required for image resizing
    "./jquery.iframe-transport",         //required for browsers without support for XHR file uploads
    "./jquery.fileupload",               //Basic fileupload plugin
    "./jquery.fileupload-process",    //Fileupload processing plugin
    "./jquery.fileupload-image",       //Image preview and resize plugin
    "./jquery.fileupload-audio",      //upload audio, preview  -- probably not needed for now
    "./jquery.fileupload-video",      //video preview
    "./jquery.fileupload-validate",    //validation plugin
    "./jquery.fileupload-ui",           //user interface plugin
    './cors/jquery.xdr-transport',       //cross domain for IE 8/9
    "css!libs/jqueryfileupload/css/jquery.fileupload.css",
    "css!libs/jqueryfileupload/css/jquery.fileupload-ui.css"
], function (templates) {

    //Setup Templates
    var div = document.createElement("div");
    $(div).html(templates);
    var scripts = $("script", div);
    for (var i = 0; i < scripts.length; i++) {
        $("body").append(scripts[i]);
    }


    var view = Backbone.View.extend({

        templateKey: "fileupload",

        maxNumberOfFiles: 1,
        uploadType: null,  //contact-photo |
        uploadComplete: null,

        events: {

        },


        render: function () {
            var tmpl = $$.templateManager.get('jquery-file-upload', this.templateKey);
            var html = tmpl({
                maxNumberOfFiles: this.maxNumberOfFiles
            });
            this.show(html);
        },


        postRender: function() {
            this.setupUpload();
        },


        setupUpload: function () {
            var self = this;

            var url = "/api/1.0/upload";
            switch (this.uploadType) {
                case "contact-photo":
                    url += "/contact/photo";
                    break;
            }

            $('#fileupload').fileupload({
                // Uncomment the following to send cross-domain cookies:
                //xhrFields: {withCredentials: true},
                url: url
            }).bind('fileuploaddone', function(err, data) {
                self.vent.trigger($$.v.JQueryFileUpload.events.UPLOAD_COMPLETE, data.result);
            });

            // Enable iframe cross-domain access via redirect option:
            // Enable iframe cross-domain access via redirect option:
            $('#fileupload').fileupload(
                'option',
                'redirect',
                window.location.href.replace(
                    /\/[^\/]*$/,
                    '/cors/result.html?%s'
                )
            );

            $('#fileupload').fileupload('option', {
                url: url,
                // Enable image resizing, except for Android and Opera,
                // which actually support image resizing, but fail to
                // send Blob objects via XHR requests:
                disableImageResize: /Android(?!.*Chrome)|Opera/
                    .test(window.navigator.userAgent),
                maxFileSize: 5000000,
                acceptFileTypes: /(\.|\/)(gif|jpe?g|png)$/i
            });

            // Upload server status check for browsers with CORS support:
            if ($.support.cors) {
                $.ajax({
                    url: url,
                    type: 'HEAD'
                }).fail(function () {
                        $('<div class="alert alert-danger"/>')
                            .text('Upload server currently unavailable - ' +
                                new Date())
                            .appendTo('#fileupload');
                    });
            }
        }
    },
        {
            events: {
                UPLOAD_COMPLETE: "uploadcomplete"
            }
        });

    $$.v.JQueryFileUpload = view;

    return view;
});
