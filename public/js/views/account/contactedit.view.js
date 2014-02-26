define([
    'models/contact',
    'libs/jquery/jquery.keytimer'

], function(Contact) {

    var view = Backbone.View.extend({

        templateKey: "account/contacts",

        contactId: null,
        currentLetter: null,

        events: {
            "keyup #input-fullname":"fullnameChanged",
            "change #input-fullname":"fullnameChanged",
            "onkeytimer #input-fullname":"fullnameKeyTimer",

            "change #select-contact-type":"contactTypeChanged",

            "onkeytimer .input-edit-phone":"phoneChanged",
            "click .li-edit-phone-type":"phoneTypeChanged",

            "click #btn-new-address":"createNewAddress",
            "change .chk-default-shipping":"toggleDefaultShipping",
            "change .chk-default-billing":"toggleDefaultBilling",
            "click .btn-default-shipping":"toggleDefaultShipping",
            "click .btn-default-billing":"toggleDefaultBilling",

            "click .btn-edit-photo":"changePhoto",
            "click .btn-upload-photo":"uploadPhoto",
            "click .btn-remove-photo":"removePhoto",
            "click #btn-upload-photo-modal":"uploadPhotoFromModal"
        },


        render: function() {
            this.stopKeyTimers();
            var self = this;
            this.getContact()
                .done(function() {
                    var data = {
                        contact:self.contact.toJSON()
                    };

                    var tmpl = $$.templateManager.get("contact-edit-main", self.templateKey);
                    var html = tmpl(data);

                    self.show(html);

                    self.startKeyTimers();
                    $(".dropdown-toggle", self.el).dropdown();
                })
                .fail(function(resp) {
                    $$.viewManager.showAlert("There was an error retrieving this contact");
                });
        },


        //region FULLNAME
        fullnameChanged: function(event) {
            var fullname = $(event.currentTarget).val();
            var nameParts = this.splitFullname(fullname);

            $("#hint-first", this.el).html(nameParts[0]);
            $("#hint-middle", this.el).html(nameParts[1]);
            $("#hint-last", this.el).html(nameParts[2]);

            this.contact.set({first:nameParts[0], middle:nameParts[1], last:nameParts[2]});
        },


        fullnameKeyTimer: function(event) {
            this.contact.save();
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
        //endregion


        contactTypeChanged: function(event) {
            var data = $("option:selected", event.currentTarget).data("contacttype");
            this.contact.set({type:data});
            this.contact.save();
        },


        //region PHONE
        phoneChanged: function(event) {
            var container = $(event.currentTarget).parents(".edit-phone-container").eq(0);
            var phoneId = container.data("id");
            var phoneNumber = $(".input-edit-phone", container).val();
            var phoneType = $$.constants.contact.phone_types.MOBILE;

            //if this is a new phone, we need to set the type if not already set
            var type = $(".btn-edit-phone-type", container).data("type");
            if (!$$.u.stringutils.isNullOrEmpty(type)) {
                phoneType = type;
            }

            var phone = this.contact.getOrCreatePhone(phoneId);

            if (phoneId != phone._id) {
                //this is new...we must update the id of the container
                container.data('id', phone._id);
            }
            phone.type = phoneType;
            phone.number = phoneNumber;

            if ($$.u.stringutils.isNullOrEmpty(phone.number)) {
                //this user is probably deleting the phone, remove it here so we don't rerender it.
                this.contact.removePhone(phone._id);
                container.data('id', '');
            }

            this.contact.save();

            //Check to see if we have a new phone container or not
            var hasNewContainer = false;
            $(".edit-phone-container", this.el).each(function() {
                if ($$.u.stringutils.isNullOrEmpty($(this).data("id"))) {
                    hasNewContainer = true;
                }
            });

            //Create a new container now for a new phone number
            if (hasNewContainer === false) {
                var tmpl = $$.templateManager.get("new-phone", this.templateKey);
                var html = tmpl({});
                $("#edit-phones-container").append(html);
                this.stopKeyTimers();
                this.startKeyTimers();
            }
        },


        phoneTypeChanged: function(event) {
            var container = $(event.currentTarget).parents(".edit-phone-container").eq(0);
            var phoneId = container.data("id");

            var phoneType = $(event.currentTarget).data("type");
            var phoneTypeLabel = _.find($$.constants.contact.phone_types.dp, function(type) { return type.data == phoneType; }).label;

            $(".edit-phone-type-label", container).html(phoneTypeLabel);
            $(".btn-edit-phone-type", container).data('type', phoneType);

            var phoneNumber = $(".input-edit-phone", container).val();
            if ($$.u.stringutils.isNullOrEmpty(phoneNumber)) {
                //Don't both continuing if they don't even have a phone number
                return;
            }

            var phone = this.contact.getOrCreatePhone(phoneId);
            phone.type = phoneType;

            this.contact.save();
        },
        //endregion


        //region ADDRESS
        createNewAddress: function(event) {
            var tmpl = $$.templateManager.get("new-address", this.templateKey);
            var html = tmpl({});

            $("#edit-addresses-container").append(html);
        },


        toggleDefaultBilling: function(event) {
            var container = $(event.currentTarget).parents(".edit-address-container").eq(0);
            var addressId = $(container).data("id");

            var address = this.contact.getOrCreateAddress(addressId);

            address.defaultBilling = !address.defaultBilling;

            if (address.defaultBilling == true) {
                $(".chk-default-billing", container)[0].checked = true;
                $(".btn-default-billing", container).addClass("default");
            } else {
                $(".chk-default-billing", container)[0].checked = false;
                $(".btn-default-billing", container).removeClass("default");
            }

            this.contact.save();
        },

        toggleDefaultShipping: function(event) {
            var container = $(event.currentTarget).parents(".edit-address-container").eq(0);
            var addressId = $(container).data("id");

            var address = this.contact.getOrCreateAddress(addressId);

            address.defaultShipping = !address.defaultShipping;

            if (address.defaultShipping) {
                $(".chk-default-shipping", container)[0].checked = true;
                $(".btn-default-shipping", container).addClass("default");
            } else {
                $(".chk-default-shipping", container)[0].checked = false;
                $(".btn-default-shipping", container).removeClass("default");
            }

            this.contact.save();
        },
        //endregion


        //region EDIT PHOTO
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
            $("#contact-photo-modal").attr("src", url);
        },


        removePhoto: function(event) {
            event.stopImmediatePropagation();
            event.preventDefault();

            var url = "/assets/icons/blank-user.jpeg";
            this.contact.set({photo:url});
            this.contact.save();
            $("#contact-photo").attr("src", url);
            $("#contact-photo-modal").attr("src", null);
        },
        //endregion


        getContact: function() {
            this.contact = new Contact({
                _id:this.contactId
            });

            return this.contact.fetch();
        },


        startKeyTimers: function() {
            $("#input-fullname", self.el).startKeyTimer(1000);
            $(".input-edit-phone", self.el).startKeyTimer(1000);
        },


        stopKeyTimers: function() {
            $("#input-fullname", this.el).stopKeyTimer();
            $(".input-edit-phone", this.el).stopKeyTimer();
        },


        onClose: function() {
            $("#input-fullname", this.el).stopKeyTimer();
            this.vent.off("uploadcomplete");
            this.uploadView = null;
        }
    });

    $$.v.account = $$.v.account || {};
    $$.v.account.ContactEdit = view;

    return view;
});

