/**
 * COPYRIGHT INDIGENOUS SOFTWARE, INC., LLC 2014
 *
 * All use or reproduction of any or all of this content must be approved.
 * Please contact info@indigenous.io for approval or questions.
 */

define([
    'views/base.view',
    'models/contact',
    'libs_misc/jquery/jquery.keytimer',
    'services/geo.service'

], function(BaseView, Contact) {

    var view = BaseView.extend({

        templateKey: "account/contacts",

        contactId: null,
        currentLetter: null,

        events: {
            "click #btn-back-to-contact":"viewContact",

            "keyup #input-fullname":"fullnameChanged",
            "change #input-fullname":"fullnameChanged",
            "onkeytimer #input-fullname":"fullnameKeyTimer",

            "change #select-contact-type":"contactTypeChanged",

            "onkeytimer .input-edit-phone":"phoneChanged",
            "click .li-edit-phone-type":"phoneTypeChanged",

            "onkeytimer .input-edit-email":"emailChanged",

            "click #btn-new-address":"createNewAddress",
            "onkeytimer .input-address-string":"addressStringChanged",
            "onkeytimer .input-address-field":"addressFieldChanged",
            "click .btn-edit-address-fields":"editAddressFields",
            "click .btn-cancel-edit-address-fields":"cancelEditAddressFields",
            "change .chk-default-shipping":"toggleDefaultShipping",
            "change .chk-default-billing":"toggleDefaultBilling",
            "click .btn-default-shipping":"toggleDefaultShipping",
            "click .btn-default-billing":"toggleDefaultBilling",

            "click .btn-edit-photo":"changePhoto",
            "click .btn-upload-photo":"uploadPhoto",
            "click .btn-remove-photo":"removePhoto",
            "click #btn-upload-photo-modal":"uploadPhotoFromModal",

            "click #btn-new-device":"addNewDevice",
            "onkeytimer .input-edit-device":"deviceChanged",

            "click .btn-subscribe-two-net":"subscribeTwoNetUser",
            "click .btn-delete-contact-ok": "deleteContact"

        },


        render: function() {
            this.stopKeyTimers();
            var self = this;
            this.getContact()
                .done(function() {
                    console.log('Getting Contact: '+JSON.stringify(self.contact.attributes));
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

        saveContactBtnPress: function() {
            var self = this;
            jQuery.gritter.add({
                    title: 'Contact Saved',
                    image: 'thumbs-up',
                    text: 'This contact has been saved successfully.',
                    class_name: 'growl-success',
                    sticky: false,
                    time: 8000,
                    position: 'bottom-right'
            });
            this.saveContact();
        },

        //region FULLNAME
        fullnameChanged: function(event) {
            var fullname = $(event.currentTarget).val();
            var nameParts = $$.u.stringutils.splitFullname(fullname);

            $("#hint-first", this.el).html(nameParts[0]);
            $("#hint-middle", this.el).html(nameParts[1]);
            $("#hint-last", this.el).html(nameParts[2]);

            this.contact.set({first:nameParts[0], middle:nameParts[1], last:nameParts[2]});
        },


        fullnameKeyTimer: function(event) {
            this.saveContact();
        },
        //endregion


        //region CONTACT TYPE
        contactTypeChanged: function(event) {
            var data = $("option:selected", event.currentTarget).data("contacttype");
            this.contact.set({type:data});
            this.saveContact();
        },
        //endregion


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

            this.saveContact();

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

            this.saveContact();
        },
        //endregion


        //region EMAIL
        emailChanged: function(event) {
            var container = $(event.currentTarget).parents(".edit-email-container").eq(0);
            var input = $(".input-edit-email", container).eq(0);
            var oEmail = $(input).data("email");
            var email = $(input).val();
            $(input).data("email", email);

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
        },
        //endregion


        //region ADDRESS
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
            address = this.contact.getOrCreateAddress(addressId);
        },


        _addressFieldChangedTimerId:null,
        addressFieldChanged: function(event) {
            var self = this;

            window.clearTimeout(this._addressFieldChangedTimerId);
            var container = $(event.currentTarget).parents(".edit-address-container").eq(0);
            var addressId = $(container).data("id");

            var addressObj = this.contact.getOrCreateAddress(addressId);
            addressObj.address = $(".input-address", container).val();
            addressObj.address2 = $(".input-address2", container).val();
            addressObj.city = $(".input-city", container).val();
            addressObj.state = $(".input-state", container).val();
            addressObj.zip = $(".input-zip", container).val();

            this.contact.updateAddressDisplayName(addressId);
            $(".address-display-name", container).removeClass("error").removeClass("hidden").html(addressObj.displayName);
            $(".input-address-string", container).val(addressObj.displayName);

            this._addressFieldChangedTimerId = window.setTimeout(function() {
                self.saveContact();
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


        toggleDefaultBilling: function(event) {
            var container = $(event.currentTarget).parents(".edit-address-container").eq(0);
            var addressId = $(container).data("id");

            var address = this.contact.getOrCreateAddress(addressId);

            address.defaultBilling = !address.defaultBilling;

            if (address.defaultBilling == true) {
                this.contact.setDefaultBilling(addressId);
                $(".chk-default-billing", this.el).prop("checked", false);
                $(".chk-default-billing", container).prop("checked", true);
                $(".btn-default-billing", container).addClass("default");
            } else {
                $(".chk-default-billing", container).prop("checked", false);
                $(".btn-default-billing", container).removeClass("default");
            }

            this.saveContact();
        },

        toggleDefaultShipping: function(event) {
            var container = $(event.currentTarget).parents(".edit-address-container").eq(0);
            var addressId = $(container).data("id");

            var address = this.contact.getOrCreateAddress(addressId);

            address.defaultShipping = !address.defaultShipping;

            if (address.defaultShipping) {
                this.contact.setDefaultShipping(addressId);
                $(".chk-default-shipping", this.el).prop("checked", false);
                $(".chk-default-shipping", container).prop("checked", true);
                $(".btn-default-shipping", container).addClass("default");
            } else {
                $(".chk-default-shipping", container).prop("checked", false);
                $(".btn-default-shipping", container).removeClass("default");
            }

            this.saveContact();
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
            require(['../../libs_misc/jqueryfileupload/js/jquery.fileupload.view'], function(uploadView) {
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
            this.saveContact();
            $("#contact-photo").attr("src", url);
            $("#contact-photo-modal").attr("src", url);
        },


        removePhoto: function(event) {
            event.stopImmediatePropagation();
            event.preventDefault();

            var url = "/assets/icons/blank-user.jpg";
            this.contact.set({photo:url});
            this.saveContact();
            $("#contact-photo").attr("src", url);
            $("#contact-photo-modal").attr("src", null);
        },
        //endregion


        //region DATA
        getContact: function() {
            if (this.contactId == null && this.isNew) {
                this.contact = new Contact({});
                var deferred = $.Deferred();
                deferred.resolve(this.contact);
                return deferred;
            }
            this.contact = new Contact({
                _id:this.contactId
            });

            return this.contact.fetch();
        },
        deleteContact: function() {
            var self = this;

            var p = this.contact.destroy();
            p.done(function() {
                self.contactId = self.contact.id;

                  //  $$.r.account.ContactRouter.navigateToShowContactsForLetter(null,false);
                  //  $$.r.account.ContactRouter.navigateToEditContact(self.contact.id, this.currentLetter, false)
                });
            console.log(this.currentLetter);

            $$.r.account.ContactRouter.navigateToShowContactsForLetter(this.currentLetter,true);
            return p;

        },

        saveContact: function() {
            console.log('save contact');
            var self = this;
            if (this.isNew) {
                this.isNew = false;
                var p = this.contact.save();
                p
                .done(function() {
                    $.gritter.add({
                        title: 'Contact Created',
                        text: 'This will fade out after a certain amount of time.',
                        time: 2000
                    });
                    self.contactId = self.contact.id;
                    $$.r.account.ContactRouter.navigateToEditContact(self.contact.id, this.currentLetter, false)
                });
                return p;
            } else {
                return this.contact.save();
            }
        },
        //endregion


        viewContact: function() {
            $$.r.account.ContactRouter.navigateToContactDetails(this.contactId, this.currentLetter);
        },


        //region UTILS and CLEANUP
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


        onClose: function() {
            $("#input-fullname", this.el).stopKeyTimer();
            this.vent.off("uploadcomplete");
            this.uploadView = null;
        },

        subscribeTwoNetUser: function() {
            //subscribe contact
            var twoNetUserModel = Backbone.Model.extend({});
            var twoNetUserCollection = Backbone.Collection.extend({
              model: twoNetUserModel,
              url: '/api/1.0/twonetadapter/subscription/'
            });
            var twonetusers = new twoNetUserCollection();
            console.log('Contact Id: '+this.contact.id);
            var num = this.contact.id;
            var n = num.toString();
            var newUser = twonetusers.create({'contactId':n});
            console.log('2NetUser: '+JSON.stringify(newUser));
        },

        addNewDevice: function(event) {
            console.log('add new device');
            var address = this.contact.getOrCreateAddress();
            var tmpl = $$.templateManager.get("new-device", this.templateKey);
            //var html = tmpl(address);

            $("#edit-devices-container").append(tmpl);
            $(".input-edit-device").startKeyTimer(1500);
        },

        deviceChanged: function() {
            //get device type
            var deviceTypeId = $('.btn-edit-device-type').data('type');
            var serialNumber = $('.input-edit-device').val();
            var device = this.contact.getOrCreateDevice(deviceTypeId, serialNumber);

            //save to the contact
            this.saveContact();

            var twoNetDeviceModel = Backbone.Model.extend({});
            var twoNetDeviceCollection = Backbone.Collection.extend({
              model: twoNetDeviceModel,
              url: '/api/1.0/twonetadapter/device'
            });
            var twonetdevices = new twoNetDeviceCollection();
            var num = this.contact.id;
            var n = num.toString();
            var data = {
                'contactId': n,
                "deviceTypeId": deviceTypeId.toString(),
                "serialNumber": serialNumber.toString()
            }

            var newDevice = twonetdevices.create(data);
            console.log('2NetDevice: '+JSON.stringify(newDevice));

        },

        deviceTypeChanged: function(event) {
            var container = $(event.currentTarget).parents(".edit-device-container").eq(0);
            var deviceId = container.data("id");

            var deviceType = $(event.currentTarget).data("type");
            var deviceTypeLabel = _.find($$.constants.contact.device_types.dp, function(type) { return type.data == deviceType; }).label;

            $(".edit-device-type-label", container).html(deviceTypeLabel);
            $(".btn-edit-device-type", container).data('type', deviceType);

            var deviceSerialNumber = $(".input-edit-serial", container).val();
            if ($$.u.stringutils.isNullOrEmpty(deviceSerialNumber)) {
                //Don't both continuing if they don't even have a phone number
                return;
            }

            var phone = this.contact.getOrCreatePhone(phoneId);
            phone.type = phoneType;

            this.saveContact();
        }
        //endregion
    });

    $$.v.account = $$.v.account || {};
    $$.v.account.ContactEdit = view;

    return view;
});

