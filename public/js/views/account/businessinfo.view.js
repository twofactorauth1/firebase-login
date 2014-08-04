define([
    'views/base.view',
    'models/user',
    'models/account'
], function(BaseView, User, Account) {

    var view = BaseView.extend({

        templateKey: "account/account",

        accounts: null,

        events: {
            "click #btn-back-to-contact" : "viewUser",

            "keyup #input-business-name": "businessNameChanged",
            "change #input-business-name": "businessNameChanged",
            "onkeytimer #input-business-name":"businessNameKeyTimer",

            "keyup #input-business-description": "businessDescriptionChanged",
            "change #input-business-description": "businessDescriptionChanged",
            "onkeytimer #input-business-description":"businessNameKeyTimer",

            "keyup #input-business-category": "businessCategoryChanged",
            "change #input-business-category": "businessCategoryChanged",
            "onkeytimer #input-business-category":"businessNameKeyTimer",

            "change #select-business-size":"businessSizeChanged",
            "change #select-business-type":"businessTypeChanged",

            "click .btn-edit-photo":"changePhoto",
            "click .btn-upload-photo":"uploadPhoto",
            "click .btn-remove-photo":"removePhoto",
            "click #btn-upload-photo-modal":"uploadPhotoFromModal",

            "onkeytimer .input-edit-phone":"phoneChanged",

            "click #btn-new-address":"createNewAddress",
            "onkeytimer .input-address-string":"addressStringChanged",
            "onkeytimer .input-address-field":"addressFieldChanged",
            "click .btn-edit-address-fields":"editAddressFields",
            "click .btn-cancel-edit-address-fields":"cancelEditAddressFields"

        },


        render: function() {
            this.stopKeyTimers();
            var self = this
                , p1 = this.getAccount()
                , p2 = this.getUser();

            $.when(p1, p2)
                .done(function() {
                    var data = {
                        account: self.account.toJSON(),
                        user: self.user.toJSON()
                    };

                    var tmpl = $$.templateManager.get("business-info-edit-main", self.templateKey);
                    var html = tmpl(data);

                    self.show(html);
                    self.startKeyTimers();
                });
        },
        viewUser: function() {
            $$.r.account.AccountRouter.navigateToAccount(this.accountId,true);
        },
        businessNameChanged: function(event) {
            var businessName = $(event.currentTarget).val();
            var account = this.account;
            var business =  account.get("business");
            business.name = businessName;
            account.set("business", business);
        },

        businessNameKeyTimer: function(event) {
            this.saveBusinessName();
        },
        businessDescriptionChanged: function(event) {
            var businessDescription = $(event.currentTarget).val();
            var account = this.account;
            var business =  account.get("business");
            business.description = businessDescription;
            account.set("business", business);
        },
        businessCategoryChanged: function(event) {
            var businessCategory = $(event.currentTarget).val();
            var account = this.account;
            var business =  account.get("business");
            business.category = businessCategory;
            account.set("business", business);
        },

        saveBusinessName: function() {
            return this.account.save();
        },
        startKeyTimers: function() {
            var self = this;
            $("#input-business-name", self.el).startKeyTimer(1000);
            $("#input-business-description", self.el).startKeyTimer(1000);
            $("#input-business-category", self.el).startKeyTimer(1000);

            $(".input-edit-phone", self.el).startKeyTimer(1000);

            $(".input-address-string", self.el).startKeyTimer(1500);
            $(".input-address-field", self.el).startKeyTimer(500);
        },

        stopKeyTimers: function() {
            $("#input-business-name", this.el).stopKeyTimer();
            $("#input-business-description", this.el).stopKeyTimer();
            $("#input-business-category", this.el).stopKeyTimer();

            $(".input-edit-phone", this.el).stopKeyTimer();

            $(".input-address-string", this.el).stopKeyTimer();
            $(".input-address-field", this.el).stopKeyTimer();
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
            this.account.set({photo:url});
            this.saveBusinessName();
            $("#contact-photo").attr("src", url);
            $("#contact-photo-modal").attr("src", url);
        },


        removePhoto: function(event) {
            event.stopImmediatePropagation();
            event.preventDefault();

            var url = "/assets/icons/blank-user.jpg";
            this.account.set({photo:url});
            this.saveBusinessName();
            $("#contact-photo").attr("src", url);
            $("#contact-photo-modal").attr("src", null);
        },

        businessSizeChanged: function(event) {
            var size = $("option:selected", event.currentTarget).data("businesssize");
            var account = this.account;
            var business =  account.get("business");
            business.size = size;
            account.set("business", business);

            this.saveBusinessName();
        },
        businessTypeChanged: function(event) {
            var type = $("option:selected", event.currentTarget).data("businesstype");
            var account = this.account;
            var business =  account.get("business");
            business.type = type;
            account.set("business", business);
            this.saveBusinessName();
        },

        phoneChanged: function(event) {
            var container = $(event.currentTarget).parents(".edit-phone-container").eq(0);
            var phoneId = container.data("id");
            var phoneNumber = $(".input-edit-phone", container).val();


            var phone = this.account.getOrCreatePhone(phoneId);

            if (phoneId != phone._id) {
                container.data('id', phone._id);
            }
            phone.number = phoneNumber;

            if ($$.u.stringutils.isNullOrEmpty(phone.number)) {
                this.account.removePhone(phone._id);
                container.data('id', '');
            }

            this.saveBusinessName();
            var hasNewContainer = false;
            $(".edit-phone-container", this.el).each(function() {
                if ($$.u.stringutils.isNullOrEmpty($(this).data("id"))) {
                    hasNewContainer = true;
                }
            });

            if (hasNewContainer === false) {
                var tmpl = $$.templateManager.get("new-business-phone", this.templateKey);
                var html = tmpl({});
                $("#edit-phones-container").append(html);
                this.stopKeyTimers();
                this.startKeyTimers();
            }
        },

        addressStringChanged: function(event) {
            var self = this, addressId, address, addressString, addressContainer;

            addressString = $(event.currentTarget).val();

            $$.svc.GeoService.searchAddress(addressString)
                .done(function(value) {
                    if (value != null && value.get("error") == null) {
                        if (address != null) {
                            $.extend(address, value.toJSON());

                            var _address = self.account.getOrCreateAddress(addressId);
                            self.saveBusinessName();

                            $(".input-address", addressContainer).val(_address.address);
                            $(".input-address2", addressContainer).val(_address.address2);
                            $(".input-city", addressContainer).val(_address.city);
                            $(".input-state", addressContainer).val(_address.state);
                            $(".input-zip", addressContainer).val(_address.zip);
                            $(".address-display-name", addressContainer).removeClass("error").removeClass("hidden").html(_address.displayName);
                        }
                    } else if(value != null) {
                        $(".address-display-name", addressContainer).addClass("error").removeClass("hidden").html("Address not found");
                    }
                })
                .fail(function() {
                    $(".address-display-name", addressContainer).addClass("error").removeClass("hidden").html("Address not found");
                });

            addressContainer = $(event.currentTarget).parents(".edit-address-container").eq(0);
            addressId = addressContainer.data("id");
            address = this.account.getOrCreateAddress(addressId);
        },

        addressFieldChanged: function(event) {
            var self = this;

            window.clearTimeout(this._addressFieldChangedTimerId);
            var container = $(event.currentTarget).parents(".edit-address-container").eq(0);
            var addressId = $(container).data("id");

            var addressObj = this.account.getOrCreateAddress(addressId);
            addressObj.address = $(".input-address", container).val();
            addressObj.address2 = $(".input-address2", container).val();
            addressObj.city = $(".input-city", container).val();
            addressObj.state = $(".input-state", container).val();
            addressObj.zip = $(".input-zip", container).val();

            this.account.updateAddressDisplayName(addressId);
            $(".address-display-name", container).removeClass("error").removeClass("hidden").html(addressObj.displayName);
            $(".input-address-string", container).val(addressObj.displayName);

            this._addressFieldChangedTimerId = window.setTimeout(function() {
                self.saveBusinessName();
            }, 2000);
        },
        editAddressFields: function(event) {
            var container = $(event.currentTarget).parents(".edit-address-container").eq(0);
            var addressId = $(container).data("id");

            $(".fg-address-string", container).addClass("hidden");
            $(".edit-address-fields", container).removeClass("hidden");
        },
        cancelEditAddressFields: function(event) {
            var container = $(event.currentTarget).parents(".edit-address-container").eq(0);
            var addressId = $(container).data("id");

            $(".fg-address-string", container).removeClass("hidden");
            $(".edit-address-fields", container).addClass("hidden");
            $(".address-display-name", container).addClass("hidden");
        },

        createNewAddress: function(event) {
            var address = this.account.getOrCreateAddress();
            var tmpl = $$.templateManager.get("new-address", this.templateKey);
            var html = tmpl(address);

            $("#edit-addresses-container").append(html);

            var addressContainer = $(".edit-address-container[data-id='" + address._id + "']", this.el);
            $(".input-address-string", addressContainer).startKeyTimer(1500);
            $(".input-address-field", addressContainer).startKeyTimer(500);
        },

    });

    $$.v.account = $$.v.account || {};
    $$.v.account.AdminView = view;

    return view;
});