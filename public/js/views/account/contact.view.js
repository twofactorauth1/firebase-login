define([
    'models/user',
    'models/account',
    'models/contact',
    'collections/contacts',
    'services/authentication.service',
    'libs/jquery/jquery.batchedimageloader'

], function(User, Account, Contact, Contacts, AuthenticationService) {

    var view = Backbone.View.extend({

        templateKey: "account/contacts",

        userId: null,
        user: null,
        accounts: null,
        currentLetter: "a",

        events: {
            "click .btn-letter":"showLetter",
            "click .btn-view-contact-details":"viewContactDetails",
            "click .btn-create-contact":"createContact"
        },


        render: function() {
            var self = this
                , p1 = this.getAccount()
                , p2 = this.getUser()
                , p3 = this.getContacts(this.currentLetter)
                , p4 = AuthenticationService.getGoogleAccessToken();

            $.when(p1, p2, p3)
                .done(function() {
                    self.renderContacts();
                });

            $.when(p4)
                .done(function(accessToken) {
                    if (String.isNullOrEmpty(accessToken) == false) {
                        self.googleAccessToken = accessToken;
                        self.refreshGooglePhotos();
                    }
                })
                .fail(function(resp) {
                   alert("FAILED");
                });
        },


        renderContacts: function() {
            var self = this;
            var data = {
                account: self.account.toJSON(),
                user: self.user.toJSON(),
                contacts: self.contacts.toJSON(),
                currentLetter: self.currentLetter.toUpperCase()
            };

            data.min = 10;
            data.count = data.contacts.length;

            var tmpl = $$.templateManager.get("contacts-main", self.templateKey);
            var html = tmpl(data);

            self.show(html);

            self.refreshGooglePhotos();
        },


        refreshGooglePhotos: function(contacts) {
            var self = this;
            if (this.googleAccessToken != null) {
                var images = $(".batched-image-loader", this.el);
                $(images).each(function() {
                   var img = $(this);
                    if ((img).attr("data-img-src").indexOf("www.google.com/m8")) {
                        var url = img.attr("data-img-src");
                        url += "?access_token=" + self.googleAccessToken;
                        img.attr("data-img-src", url);
                    }
                });

                $(".batched-image-loader").batchedImageLoader();
            }
        },


        showLetter: function(event) {
            event.stopImmediatePropagation();
            event.preventDefault();

            var self = this;

            var letter = $(event.currentTarget).html();
            this.currentLetter = letter.toLowerCase();

            this.getContacts(this.currentLetter)
                .done(function() {
                    self.renderContacts();
                });

            $$.r.account.ContactRouter.navigateToShowContactsForLetter(this.currentLetter);
        },


        viewContactDetails: function(event) {
            var contactId = $(event.currentTarget).data("contactid");
            $$.r.account.ContactRouter.navigateToContactDetails(contactId, this.currentLetter);
        },


        createContact: function() {
            $$.r.account.ContactRouter.navigateToCreateContact(this.currentLetter);
        },


        getUser: function() {
            if (this.userId == null) {
                this.userId = $$.server.get($$.constants.server_props.USER_ID);
            }

            this.user = new $$.m.User({
                _id: this.userId
            });

            return this.user.fetch();
        },


        getAccount: function() {
            if (this.accountId == null) {
                this.accountId = $$.server.get($$.constants.server_props.ACCOUNT_ID);
            }

            this.account = new $$.m.Account({
                _id: this.accountId
            });

            return this.account.fetch();
        },


        getContacts: function() {
            if (this.accountId == null) {
                this.accountId = $$.server.get($$.constants.server_props.ACCOUNT_ID);
            }
            this.contacts = new $$.c.Contacts();

            if (this.currentLetter == null) {
                this.currentLetter = "a";
            }
            this.currentLetter = this.currentLetter.toLowerCase();
            return this.contacts.getContactsByLetter(this.accountId, this.currentLetter);
        }
    });

    $$.v.account = $$.v.account || {};
    $$.v.account.ContactView = view;

    return view;
});