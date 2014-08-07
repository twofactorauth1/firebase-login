/**
 * COPYRIGHT INDIGENOUS SOFTWARE, INC., LLC 2014
 *
 * All use or reproduction of any or all of this content must be approved.
 * Please contact info@indigenous.io for approval or questions.
 */

define([
    'views/base.view',
    'models/user',
    'models/account'
], function(BaseView, User, Account) {

    var view = BaseView.extend({

        templateKey: "account/account",

        accounts: null,

        events: {

            "click #btn-back-to-contact":"viewUser",

            "keyup #input-fullname":"fullnameChanged",
            "change #input-fullname":"fullnameChanged",
            "onkeytimer #input-fullname":"fullnameKeyTimer",

            "onkeytimer .input-edit-phone":"phoneChanged",
            "click .li-edit-phone-type":"phoneTypeChanged",

            "onkeytimer .input-edit-email":"emailChanged",

            "click #btn-new-address":"createNewAddress",
            "onkeytimer .input-address-string":"addressStringChanged",
            "onkeytimer .input-address-field":"addressFieldChanged",
            "click .btn-edit-address-fields":"editAddressFields",
            "click .btn-cancel-edit-address-fields":"cancelEditAddressFields",

            "click .btn-edit-photo":"changePhoto",
            "click .btn-upload-photo":"uploadPhoto",
            "click .btn-remove-photo":"removePhoto",
            "click #btn-upload-photo-modal":"uploadPhotoFromModal"

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

                    var tmpl = $$.templateManager.get("account-edit-main", self.templateKey);
                    var html = tmpl(data);

                    self.show(html);
                    self.startKeyTimers();
                });
        },
        viewUser: function() {
            $$.r.account.AccountRouter.navigateToAccount(this.accountId,true);
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

        editAccountSave:function(event){
            var data = JSON.stringify($('form').serializeArray());
            console.log(this.user);
        //    this.user.set('middle','khan');
            this.user.save();
            console.log(data)

        },
        fullnameChanged: function(event) {
            var fullname = $(event.currentTarget).val();
            var nameParts = $$.u.stringutils.splitFullname(fullname);

            $("#hint-first", this.el).html(nameParts[0]);
            $("#hint-middle", this.el).html(nameParts[1]);
            $("#hint-last", this.el).html(nameParts[2]);

            this.user.set({first:nameParts[0], middle:nameParts[1], last:nameParts[2]});
        },


        fullnameKeyTimer: function(event) {
            this.saveUser();
        },
        saveUser: function() {
            var self = this;
            if (this.isNew) {
                this.isNew = false;
                var p = this.user.save();
                p
                    .done(function() {
                        /*self.accountId = self.account.id;
                        $$.r.account.ContactRouter.navigateToEditContact(self.contact.id, this.currentLetter, false)*/
                    });
                return p;
            } else {
                return this.user.save();
            }
        },
        startKeyTimers: function() {
            var self = this;
            $("#input-fullname", self.el).startKeyTimer(1000);
            $(".input-edit-phone", self.el).startKeyTimer(1000);
            $(".input-edit-email", self.el).startKeyTimer(500);
            $(".input-address-string", self.el).startKeyTimer(1500);
            $(".input-address-field", self.el).startKeyTimer(500);
        },


        stopKeyTimers: function() {
            $("#input-fullname", this.el).stopKeyTimer();
            $(".input-edit-phone", this.el).stopKeyTimer();
            $(".input-edit-email", this.el).stopKeyTimer();
            $(".input-address-string", this.el).stopKeyTimer();
            $(".input-address-field", this.el).stopKeyTimer();
        },


        phoneChanged: function(event) {
            var container = $(event.currentTarget).parents(".edit-phone-container").eq(0);
            var phoneId = container.data("id");
            var phoneNumber = $(".input-edit-phone", container).val();
            var phoneType = $$.constants.user.phone_types.MOBILE;

            //if this is a new phone, we need to set the type if not already set
            var type = $(".btn-edit-phone-type", container).data("type");
            if (!$$.u.stringutils.isNullOrEmpty(type)) {
                phoneType = type;
            }

            var phone = this.user.getOrCreatePhone(phoneId);

            if (phoneId != phone._id) {
                //this is new...we must update the id of the container
                container.data('id', phone._id);
            }
            phone.type = phoneType;
            phone.number = phoneNumber;

            if ($$.u.stringutils.isNullOrEmpty(phone.number)) {
                //this user is probably deleting the phone, remove it here so we don't rerender it.
                this.user.removePhone(phone._id);
                container.data('id', '');
            }

            this.saveUser();

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

            var phone = this.user.getOrCreatePhone(phoneId);
            phone.type = phoneType;

            this.saveUser();
        },

        removePhone: function(phoneId) {
            var details = this.get("details");
            if (details == null) {
                details = [];
                this.set({details:details});
            }

            for (var i = 0; i < details.length; i++) {
                var detail = details[i];
                if (detail.phones != null) {
                    var phone = _.find(detail.phones, function(phone) { return phone._id === phoneId });
                    if (phone != null) {
                        var index = detail.phones.indexOf(phone);
                        detail.phones.splice(index, 1);
                    }
                }
            }
        },

        emailChanged: function(event) {
            var container = $(event.currentTarget).parents(".edit-email-container").eq(0);
            var input = $(".input-edit-email", container).eq(0);
            var oEmail = $(input).data("email");
            var email = $(input).val();
            $(input).data("email", email);
            this.user.set({email:email});
            this.user.save();
/*
            var details = this.contact.getOrCreateLocalDetails();
            var emails = details.emails;

            details.emails = details.emails || [];

            var index = details.emails.indexOf(oEmail);
            if (String.isNullOrEmpty(email)) {
                if (index > -1) {
                    details.emails.splice(index, 1);
                    $(container).remove();
                }
            } else {
                if (index > -1) {
                    details.emails[index] = email;
                } else {
                    details.emails.push(email);
                }
            }

            this.saveContact();


            //Check to see if we have a new email container or not
            var hasNewContainer = false;
            $(".input-edit-email", this.el).each(function() {
                if ($$.u.stringutils.isNullOrEmpty($(this).val())) {
                    hasNewContainer = true;
                }
            });

            //Create a new container now for a new phone number
            if (hasNewContainer === false) {
                var tmpl = $$.templateManager.get("new-email", this.templateKey);
                var html = tmpl({});
                $("#edit-emails-container").append(html);
                this.stopKeyTimers();
                this.startKeyTimers();
            }
            */
        },

        createNewAddress: function(event) {
            var address = this.contact.getOrCreateAddress();
            var tmpl = $$.templateManager.get("new-address", this.templateKey);
            var html = tmpl(address);

            $("#edit-addresses-container").append(html);

            var addressContainer = $(".edit-address-container[data-id='" + address._id + "']", this.el);
            $(".input-address-string", addressContainer).startKeyTimer(1500);
            $(".input-address-field", addressContainer).startKeyTimer(500);
        },

        addressStringChanged: function(event) {
            var self = this, addressId, address, addressString, addressContainer;

            addressString = $(event.currentTarget).val();

            $$.svc.GeoService.searchAddress(addressString)
                .done(function(value) {
                    if (value != null && value.get("error") == null) {
                        if (address != null) {
                            $.extend(address, value.toJSON());

                            var _address = self.contact.getOrCreateAddress(addressId);
                            self.saveContact();

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
            address = this.user.getOrCreateAddress(addressId);
        },
        _addressFieldChangedTimerId:null,
        addressFieldChanged: function(event) {
            var self = this;

            window.clearTimeout(this._addressFieldChangedTimerId);
            var container = $(event.currentTarget).parents(".edit-address-container").eq(0);
            var addressId = $(container).data("id");

            var addressObj = this.user.getOrCreateAddress(addressId);
            addressObj.address = $(".input-address", container).val();
            addressObj.address2 = $(".input-address2", container).val();
            addressObj.city = $(".input-city", container).val();
            addressObj.state = $(".input-state", container).val();
            addressObj.zip = $(".input-zip", container).val();

            this.user.updateAddressDisplayName(addressId);
            $(".address-display-name", container).removeClass("error").removeClass("hidden").html(addressObj.displayName);
            $(".input-address-string", container).val(addressObj.displayName);

            this._addressFieldChangedTimerId = window.setTimeout(function() {
                self.saveUser();
            }, 2000);
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
            this.user.set({photo:url});
            this.saveUser();
            $("#contact-photo").attr("src", url);
            $("#contact-photo-modal").attr("src", url);
        },


        removePhoto: function(event) {
            event.stopImmediatePropagation();
            event.preventDefault();

            var url = "/assets/icons/blank-user.jpg";
            this.user.set({photo:url});
            this.saveUser();
            $("#contact-photo").attr("src", url);
            $("#contact-photo-modal").attr("src", null);
        }



    });

    $$.v.account = $$.v.account || {};
    $$.v.account.AdminView = view;

    return view;
});