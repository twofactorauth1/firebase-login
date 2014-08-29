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
    'libs_misc/jquery/jquery.batchedimageloader'
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
            "keyup .search-contacts": "filter_contacts",
            "change .chosen-select" :"sort_contact"
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
            _.bindAll(this, 'check_height');

            $$.e.ContactSortingEvent.bind("sortContact",this.sort_contacts.bind(this));
            $$.e.ContactSortingEvent.bind("displayContact",this.display_contacts.bind(this));

            $(window).scroll(this.check_height);
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
                , p3 = this.getContacts(0)
                //, p4 = AuthenticationService.getGoogleAccessToken();
                ,p4 = AuthenticationService.hasGoogleAccessToken();

            //_.bindAll(self, 'check_height');

            $.when(p1, p2, p3)
                .done(function() {
                    self.loadMore = !(self.contacts.length < 6)
                    self.renderContacts();
                    self.check_welcome();
                    self.adjustWindowSize();
                    $(window).on("resize", self.adjustWindowSize);
                });

            $.when(p4)
                .done(function(accessToken){
                    if (String.isNullOrEmpty(accessToken) == false && accessToken !== 'false') {
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
            self.skip = 0;
            self.loadMore=true;

            $.when(p1)
                .done(function(){
                 self.account.set("updateType","setting");
                 self.account.save({"sort_type": sort_type})
                     .done(function(){

                     self.getContacts(0)
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
            var p1 = self.getAccount();
            self.skip = 0;
            self.loadMore = true;

            $.when(p1)
                .done(function(){
                    self.account.set("updateType","displaysetting");
                    self.account.save({"display_type": data})
                        .done(function(err,res){
                            self.currentDisplay = data.display_type;
                            self.renderContacts();
                            self.check_welcome();
                        });

                });
            $$.r.account.ContactRouter.navigateToShowContactsForLetter("all", true);
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
            console.log(data.account)

            //data.min = 6;
            //data.count = data.contacts.length;

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
            var getContacts = self.contacts.toJSON();
            var cleanedContacts = [];
            /*
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
            */
            console.log('Contacts Fetched: '+self.fetchedContacts);
            var data = {
                account: self.account.toJSON(),
                user: self.user.toJSON(),
                //contacts: cleanedContacts,
                contacts: getContacts,
                contactsLength: $('.people-list .people-item').length,
                currentLetter: self.currentLetter.toLowerCase(),
                currentDisplay:self.currentDisplay.toLowerCase()
            };

            //data.min = 6;
            //data.count = data.contacts.length;

            var tmpl = $$.templateManager.get("people-list", self.templateKey);
            var html = tmpl(data);
            if (!$('.people-list .people-item').length) {
                $('.people-list .row').html('');
            }
            $('.people-list .row').append(html);
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

            if(self.currentLetter !== $(event.currentTarget).html().toLowerCase()) {
                self.loadMore = false;
                var letter = $(event.currentTarget).html();
                self.currentLetter = letter.toLowerCase();

                self.getContacts(0)
                    .done(function (res) {
                        //self.skip = $('.people-list .people-item').length;
                        //self.renderContacts();
                        //self.check_welcome();
                        self.loadMore = !(res.length < 6);

                        $('.people-list .row').html('');
                        self.appendContacts();
                    });

                if (self.currentLetter == "all") {
                    $$.r.account.ContactRouter.navigateToShowContactsForAll(self.currentLetter);
                }
                else {
                    $$.r.account.ContactRouter.navigateToShowContactsForLetter(self.currentLetter);
                }
            } else {


            }
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
            var self = this;
            if (self.accountId == null) {
                self.accountId = $$.server.get($$.constants.server_props.ACCOUNT_ID);
            }

            self.account = new $$.m.Account({
                _id: self.accountId
            });

            return self.account.fetch();
        },


        getContacts: function(skip) {
            var self = this;
            if (self.accountId == null) {
                self.accountId = $$.server.get($$.constants.server_props.ACCOUNT_ID);
            }
            self.contacts = new $$.c.Contacts();

            if (self.currentLetter == null) {
                self.currentLetter = "all";
            }
            self.currentLetter = self.currentLetter.toLowerCase();

            self.limit = 6;

            if(self.currentLetter=='all') {
                return self.contacts.getContactsAll(self.accountId, skip, self.limit );
            }  else {
                return self.contacts.getContactsByLetter(self.accountId, self.currentLetter,skip,self.limit);
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

        check_height: function (e){
            var self = this;

            if(self.loadMore) {
                if(window.innerHeight + document.body.scrollTop >= document.body.offsetHeight){

                    self.loadMore = false;
                    self.getContacts($('.people-list .people-item').length)
                        .done(function (res) {
                            self.loadMore = !(res.length < 6)
                            //determine the ID's of the contacts being fetched
                            //make a fetched list so there will be no duplicates

                            self.appendContacts();
                            self.check_welcome();
                        });
                    if (self.currentLetter == "all") {
                        //$$.r.account.ContactRouter.navigateToShowContactsForAll(self.currentLetter, $('.people-list .people-item').length);
                        $$.r.account.ContactRouter.navigateToShowContactsForAll(self.currentLetter);
                    }
                    else {
                        $$.r.account.ContactRouter.navigateToShowContactsForLetter(self.currentLetter, true);
                    }
                }
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
        },
        sort_contact:function(e)
        {

            var self = this, contacts;
            var sortBy= e.target.value;
            contacts = self.contacts.toJSON();
            account=self.account.toJSON() ;
            console.log(account.displaysettings.display_type);
            switch(sortBy)
            {
                case 'a_to_z':
                              if(account.displaysettings.display_type)

                              {
                                  contacts = _.sortBy( contacts, function(value) {
                                      if(account.displaysettings.display_type==='first')
                                          return value.first.charCodeAt(0);
                                      else
                                          return value.last.charCodeAt(0);

                                  });

                              }
                              else{
                                  contacts = _.sortBy( contacts, function(value) {
                                      return value.last.charCodeAt(0);});
                              }
                              break;
                case 'z_to_a':
                              if(account.displaysettings.display_type){
                                    contacts = _.sortBy( contacts, function(value) {
                                      if(account.displaysettings.display_type==='first')
                                        return value.first.charCodeAt(0)*-1;
                                      else
                                        return value.last.charCodeAt(0)*-1;
                                  });
                              }
                              else{
                                   contacts = _.sortBy( contacts, function(value) {
                                      return value.last.charCodeAt(0)*-1;});

                              }
                              break;
                case 'first_last':
                                  contacts = _.sortBy( contacts, function(value) {
                                  return value.first.charCodeAt(0);});
                                  break;
                case 'last_first':
                                  contacts = _.sortBy( contacts, function(value) {
                                  return value.last.charCodeAt(0);});
                                  break;
                case 'date_added':
                                  contacts = _.sortBy( contacts, function(value) {
                                      return value.created.date;});
                                  break;
                default:console.log('not selected');
            }
                self.reRenderContacts(contacts, function(){
                    $(".chosen-select").val(e.target.value).focus();
                });
                self.check_welcome();





        }

    });

    $$.v.account = $$.v.account || {};
    $$.v.account.ContactView = view;

    return view;
});
