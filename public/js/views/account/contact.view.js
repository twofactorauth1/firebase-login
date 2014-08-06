/**
 * COPYRIGHT INDIGENOUS SOFTWARE, INC., LLC 2014
 *
 * All use or reproduction of any or all of this content must be approved.
 * Please contact info@indigenous.io for approval or questions.
 */

define([
    'models/user',
    'models/account',
    'models/contact',
    'collections/contacts',
    'services/authentication.service',
    'services/contact.service',
    'events/events',
    'libs_misc/jquery/jquery.batchedimageloader',
    ], function(User, Account, Contact, Contacts, AuthenticationService, ContactService,events) {

    var view = Backbone.View.extend({

        templateKey: "account/contacts",

        userId: null,
        user: null,
        accounts: null,
        currentLetter: "a",
        loadMore : true,
        currentDisplay:'first',
        currentOrder:'first',
        fetched: false,
        fetchedContacts: [],

        events: {
            "click .btn-letter":"showLetter",
            "click .btn-view-contact-details":"viewContactDetails",
            "click .btn-create-contact":"createContact",
            "click .important-star":"toggleStarred",

            "click .btn-import-facebook":"importFacebookFriends",
            "click .btn-import-gmail":"importGmailContacts",
            "click .btn-import-linkedin":"importLinkedInConnections",

            "click .close":"close_welcome",

            "click .import-contacts": "importTest",
            "scroll body": "check_height",
            "keyup .search-contacts": "filter_contacts"
        },

        initialize: function() {
            var state = $$.u.querystringutils.getQueryStringValue("state");
            var detail = $$.u.querystringutils.getQueryStringValue("detail");

            $('#main-viewport').css('max-height','none');

            if (state == "import") {
                switch(detail) {
                    case $$.constants.social.types.GOOGLE:
                        this.importGmailContacts();
                        break;
                    case $$.constants.social.types.FACEBOOK:
                        this.importFacebookFriends();
                        break;
                    case $$.constants.social.types.LINKEDIN:
                        this.importLinkedInConnections();
                        break;
                    case $$.constants.social.types.TWITTER:
                        break;
                }
            }

            $$.e.ContactSortingEvent.bind("sortContact",this.sort_contacts.bind(this));
            $$.e.ContactSortingEvent.bind("displayContact",this.display_contacts.bind(this));
            _.bindAll(this, 'check_height');
        },

        remove: function () {
            $(window).unbind('scroll');
            this.trigger('view:unload');
            Backbone.View.prototype.remove.call(this);
        },

        render: function() {
            $(window).bind('scroll' ,this.check_height);

            var self = this
                , p1 = this.getAccount()
                , p2 = this.getUser()
                , p3 = this.getContacts(this.currentLetter)
                , p4 = AuthenticationService.getGoogleAccessToken();

            //_.bindAll(self, 'check_height');

            $.when(p1, p2, p3)
                .done(function() {
                    self.renderContacts();
                    self.check_welcome();
                    self.adjustWindowSize();
                    $(window).on("resize", self.adjustWindowSize);
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

            $.when(p1)
                .done(function(){
                    console.log(this);
                });
        },

        importTest: function() {
            console.log('import test');
        },

        sort_contacts : function (sort_type) {
            var self = this;
            var p1 = this.getAccount();
            this.skip=0;
            this.loadMore=true;

            $.when(p1)
                .done(function(){
                 self.account.set("updateType","setting");
                 self.account.save({"sort_type": sort_type})
                     .done(function(){

                     self.getContacts(self.currentLetter)
                         .done(function (res, msg) {
                             self.currentOrder=sort_type.sort_type;
                             /* if (res.length < self.skip+3) {
                              self.loadMore = false;
                              }*/
                             self.renderContacts();
                             self.check_welcome();
                         });


                    });

                });




         //   self.renderContacts();
         //   self.check_welcome();
            $$.r.account.ContactRouter.navigateToShowContactsForLetter("all",true);
            /*if (this.currentLetter == "all") {
                $$.r.account.ContactRouter.navigateToShowContactsForAll(this.currentLetter, this.skip);
            }
            else
                $$.r.account.ContactRouter.navigateToShowContactsForLetter(this.currentLetter);*/
        //    this.render();
        },
        display_contacts : function (data) {
            var self = this;
            var p1 = this.getAccount();
            this.skip=0;
            this.loadMore=true;

            $.when(p1)
                .done(function(){
                    self.account.set("updateType","displaysetting");
                    self.account.save({"display_type": data})
                        .done(function(err,res){

                            self.currentDisplay=data.display_type;
                            self.renderContacts();
                            self.check_welcome();
                        });

                });
            $$.r.account.ContactRouter.navigateToShowContactsForLetter("all",true);
        },

        renderContacts: function() {
            var self = this;
            var data = {
                account: self.account.toJSON(),
                user: self.user.toJSON(),
                contacts: self.contacts.toJSON(),
                currentLetter: self.currentLetter.toLowerCase(),
                currentDisplay:self.currentDisplay.toLowerCase()
            };

            data.min = 6;
            data.count = data.contacts.length;

            var tmpl = $$.templateManager.get("contacts-main", self.templateKey);
            var html = tmpl(data);

            self.show(html);
            self.adjustWindowSize();
            $('.people-item').addClass('animate');

            var sidetmpl = $$.templateManager.get("contact-sidebar", self.templateKey);
            var rightPanel = $('#rightpanel');
            rightPanel.html('');
            rightPanel.append(sidetmpl(data));

            self.refreshGooglePhotos();

            self.updateTooltips();
        },

        appendContacts: function() {
            var self = this;

            //check to see if the fetched contacts have already been appended
            var contactsArr = self.contacts.toJSON();
            var cleanedContacts = [];
            for (var i = 0; i < contactsArr.length; i++) {
                if ($.inArray(contactsArr[i]._id, self.fetchedContacts) > -1) {
                    console.log('is IN array');
                } else {
                    console.log('is NOT in array '+self.fetched);
                    cleanedContacts.push(contactsArr[i]);
                }
            }

            //update the fecthedContacts with newly fetched contact Id's
            console.log('Cleaned Contacts: '+cleanedContacts.length);
            for (var i = 0; i < cleanedContacts.length; i++) {
                if (self.fetchedContacts.indexOf(cleanedContacts[i]._id) > -1) {
                    //do nothing
                } else {
                    self.fetchedContacts.push(cleanedContacts[i]._id);
                }
            }

            if (!self.fetched) {
                cleanedContacts.splice(0[3]);
                self.fetched = true;
            }
            console.log('Contacts Fetched: '+self.fetchedContacts);

            var data = {
                account: self.account.toJSON(),
                user: self.user.toJSON(),
                contacts: cleanedContacts,
                currentLetter: self.currentLetter.toLowerCase(),
                currentDisplay:self.currentDisplay.toLowerCase()
            };

            data.min = 6;
            data.count = data.contacts.length;

            var tmpl = $$.templateManager.get("people-list", self.templateKey);
            var html = tmpl(data);
            $('.people-list').append(html);
            $('.people-item').addClass('animate');

            self.refreshGooglePhotos();

            self.updateTooltips();
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
            self.loadMore=true;
            var letter = $(event.currentTarget).html();
            this.currentLetter = letter.toLowerCase();

            this.getContacts(this.currentLetter)
                .done(function(err, res) {
                    console.log(res);
                    console.log(err);
                    self.skip=self.contacts.length;
                    self.renderContacts();
                    self.check_welcome();

                });

            if(this.currentLetter=="all")
                $$.r.account.ContactRouter.navigateToShowContactsForAll(this.currentLetter);
            else
                $$.r.account.ContactRouter.navigateToShowContactsForLetter(this.currentLetter);
        },


        toggleStarred: function(event) {
            event.preventDefault();
            event.stopImmediatePropagation();

            var contactId = $(event.currentTarget).parent('.contact-item').data("contactid");
            var contact = this.contacts.get(contactId);

            var starred = contact.get("starred");
            contact.set({starred:!starred});
            contact.save();

            $("i", event.currentTarget).toggleClass("fa-star-o fa-star");
        },

        viewContactDetails: function(event) {
            var href = $(event.target).attr("href") || $(event.target).parent().attr("href");
            if (href != null) {
                if (href == "#") {
                    event.preventDefault();
                    event.stopImmediatePropagation();
                }
                return;
            }
            var contactId = $(event.currentTarget).data("contactid");
            $$.r.account.ContactRouter.navigateToContactDetails(contactId, this.currentLetter);
        },

        createContact: function() {
            $$.r.account.ContactRouter.navigateToCreateContact(this.currentLetter);
        },

        //region IMPORT
        importFacebookFriends: function(event) {
            this._importContacts($$.constants.social.types.FACEBOOK);
        },


        importGmailContacts: function(event) {
            this._importContacts($$.constants.social.types.GOOGLE);
        },


        importLinkedInConnections: function(event) {
            this._importContacts($$.constants.social.types.LINKEDIN);
        },


        _importContacts: function(socialType) {
            var self = this;
            AuthenticationService.checkSocialAccess(socialType)
                .done(function(result) {
                    if (result == true) {
                        ContactService.importContacts(socialType)
                            .done(function() {
                                alert("Contacts are importing!")
                            })
                            .fail(function(resp) {
                                alert("There was an error importing contacts");
                            });
                    } else {
                        AuthenticationService.authenticateSocial(socialType, "import", socialType);
                    }
                });
        },
        //endregion


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
            var self = this;
            if (this.accountId == null) {
                this.accountId = $$.server.get($$.constants.server_props.ACCOUNT_ID);
            }
            this.contacts = new $$.c.Contacts();

            if (this.currentLetter == null) {
                this.currentLetter = "all";
            }
            this.currentLetter = this.currentLetter.toLowerCase();

            this.skip = this.skip || 0;

            if(this.currentLetter=='all') {
                return this.contacts.getContactsAll(this.accountId, this.currentLetter, this.skip);
            } else {

                return this.contacts.getContactsByLetter(this.accountId, this.currentLetter);
            }

        },

        adjustWindowSize: function() {
            console.log('resizing');
            $('#main-viewport').css('overflow', 'none');
            var headerBar = $('#headerbar').outerHeight();
            var pageHeader = $('.pageheader').outerHeight();
            var mainViewportHeight = $(window).height() - headerBar - pageHeader-10;
            console.log('adjusting window size to '+$(window).height()+' Headerbar: '+headerBar+' Page Herder: '+pageHeader);
            $('.contentpanel').css('min-height', $(window).height());
        },

        check_welcome: function() {
            if(!this.user.get('welcome_alert').contact){
                $('.alert').hide();
            }
        },


        close_welcome: function(e) {
            var user = this.user;
            var welcome = user.get("welcome_alert");
            welcome.contact = false;
            user.set("welcome_alert", welcome);
            user.save();
        },

        check_height : function (e){
            var self = this;
            if(window.innerHeight + document.body.scrollTop >= document.body.offsetHeight){


               /* console.log(Backbone.history.fragment);
                var params=Backbone.history.fragment;
                    params=params.split('/');
                if(params.length==3) {
                    var skipindex = params[params.length - 1];
                    console.log(this.skip);
                //        this.skip=parseInt(skipindex)+3;
                 //   this.skip+=3;
                }*/

                console.log(self.loadMore);
                console.log(self.skip);
                if(self.loadMore) {
                    this.getContacts(self.currentLetter)
                        .done(function (res, msg) {

                            if (res.length < self.skip+3) {
                                self.loadMore = false;
                            }
                            //determine the ID's of the contacts being fetched
                            //make a fetched list so there will be no duplicates

                            self.appendContacts();
                            self.check_welcome();
                            self.skip = self.contacts.length;
                        });
                    if (self.currentLetter == "all")
                        $$.r.account.ContactRouter.navigateToShowContactsForAll(self.currentLetter, self.skip);
                    else
                        $$.r.account.ContactRouter.navigateToShowContactsForLetter(self.currentLetter);
                }

                console.log("loadData");
            } else{
                console.log("dont load");
            }

        },
        filter_contacts: function(e) {
            var self = this, contacts;
            var searchExpression = e.target.value.toLowerCase();
            var charCodeStartUpperCase = "A".charCodeAt(0);
            var charCodeStartLowerCase = "a".charCodeAt(0);

            if ((e.keyCode >= charCodeStartUpperCase && e.keyCode <= charCodeStartUpperCase + 25) || (e.keyCode >= charCodeStartLowerCase && e.keyCode <= charCodeStartLowerCase + 25) || e.keyCode === 8) {

                contacts = self.contacts.toJSON();
                contacts = _.filter( contacts, function(value) {
                    return value.first.toLowerCase().indexOf(searchExpression) == 0 || value.last.toLowerCase().indexOf(searchExpression) == 0
                });

                self.reRenderContacts(contacts, function(){
                    $(".search-contacts").val(e.target.value).focus();
                });
                self.check_welcome();

            }

        },
        reRenderContacts: function(contacts, cb) {
            var self = this;
            var data = {
                account: self.account.toJSON(),
                user: self.user.toJSON(),
                contacts: self.contacts.toJSON(),
                currentLetter: self.currentLetter.toLowerCase(),
                currentDisplay:self.currentDisplay.toLowerCase()
            };

            data.contacts = contacts
            data.min = 6;
            data.count = data.contacts.length;

            var tmpl = $$.templateManager.get("contacts-main", self.templateKey);
            var html = tmpl(data);

            self.show(html);
            $('.people-item').addClass('shown');

            var sidetmpl = $$.templateManager.get("contact-sidebar", self.templateKey);
            var rightPanel = $('#rightpanel');
            rightPanel.html('');
            rightPanel.append(sidetmpl(data));

            self.refreshGooglePhotos();

            self.updateTooltips();
            cb && cb();
        }

    });

    $$.v.account = $$.v.account || {};
    $$.v.account.ContactView = view;

    return view;
});