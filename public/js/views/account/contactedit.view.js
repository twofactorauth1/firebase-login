define([
    'models/contact'
], function(Contact) {

    var view = Backbone.View.extend({

        templateKey: "account/contacts",

        contactId: null,
        currentLetter: null,

        events: {
            "keyup #input-fullname":"fullnameChanged",
            "change #input-fullname":"fullnameChanged",

            "click .btn-edit-photo":"changePhoto",
            "click .btn-upload-photo":"uploadPhoto",
            "click .btn-remove-photo":"removePhoto",
            "click #btn-upload-photo-modal":"uploadPhotoFromModal"
        },


        render: function() {
            var self = this;
            this.getContact()
                .done(function() {
                    var data = {
                        contact:self.contact.toJSON()
                    };

                    var tmpl = $$.templateManager.get("contact-edit-main", self.templateKey);
                    var html = tmpl(data);

                    self.show(html);

                    $("#contact-photo", self.$el).on("load", _.bind(self.resizseBtnEditPhoto, self))
                })
                .fail(function(resp) {
                    $$.viewManager.showAlert("There was an error retrieving this contact");
                });
        },


        resizseBtnEditPhoto: function() {
            console.log("resizing");
            var height = $("#contact-photo").height();
            var width = $("#contact-photo").width();

            $(".btn-edit-photo").height(height).width(width);
        },


        fullnameChanged: function(event) {
            var fullname = $(event.currentTarget).val();
            var nameParts = this.splitFullname(fullname);

            $("#hint-first", this.el).html(nameParts[0]);
            $("#hint-middle", this.el).html(nameParts[1]);
            $("#hint-last", this.el).html(nameParts[2]);
        },


        changePhoto: function(event) {
            this._showPhotoModal();
        },


        uploadPhotoFromModal: function(event) {
            this._showUploadForm();
        },


        uploadPhoto: function(event) {
            event.stopImmediatePropagation();
            event.preventDefault();

            this._showPhotoModal();

            this._showUploadForm();
        },


        _showPhotoModal: function() {
            var self = this;
            $("#modal-change-photo").modal();
            $("#modal-change-photo").on("hide.bs.modal", function() {
                self.vent.off("uploadcomplete");
                self.removeSubView(self.uploadView);
            });
        },


        _showUploadForm: function() {
            var self = this;
            require(['libs/jqueryfileupload/js/jquery.fileupload.view'], function(uploadView) {
                self.uploadView = new uploadView();
                self.uploadView.maxNumberOfFiles = 1;
                self.uploadView.uploadType = "contact-photo";
                $$.viewManager.show(self.uploadView, "#upload-photo-container");
                self.addSubView(self.uploadView);

                self.vent.off("uploadcomplete");
                self.vent.on("uploadcomplete", self._onPhotoUploaded.bind(self));
            });
        },


        _onPhotoUploaded: function(result) {
            var files = result.files;
            var url = files[0].url;
            this.contact.set({photo:url});
            this.contact.save();
            $("#contact-photo").attr("src", url);
            console.log("Saving contact!");
        },


        removePhoto: function(event) {
            event.stopImmediatePropagation();
            event.preventDefault();
        },


        splitFullname: function(fullname) {
            var names = fullname.split(" "), first = "", last = "", middle = "";
            first = names[0];

            names.splice(0,1);
            if (names.length > 1) {
                middle = names[0];
                names.splice(0,1);
            }
            last = names.join(" ");

            return [first,middle,last];
        },


        getContact: function() {
            this.contact = new Contact({
                _id:this.contactId
            });

            return this.contact.fetch();
        },


        onClose: function() {
            self.vent.off("uploadcomplete");
            this.uploadView = null;
        }
    });

    $$.v.account = $$.v.account || {};
    $$.v.account.ContactEdit = view;

    return view;
});

