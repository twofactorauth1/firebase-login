define([
    'services/user.service',
    'models/account',
    'libs/jquery/jquery.keytimer'
], function (UserServices) {

    var view = Backbone.View.extend({

        templateKey: "signup",

        place: "start",
        lastPlace: null,
        nextPlace: null,

        emailvalid: false,
        passwordsvalid: false,
        usernamevalid: false,

        events: {
            "click #btn-business,#btn-professional,#btn-enterprise": "onCompanyTypeChanged",
            "change .radio-company-size": "onCompanySizeChanged",
            "onkeytimer #input-company-name": "onCompanyNameKeyTimer",
            "onkeytimer #input-username": "onUsernameKeyTimer",
            "onkeytimer #input-password": "onPasswordKeyTimer",
            "onkeytimer #input-password2": "onPasswordKeyTimer",
            "onkeytimer #input-email": "onEmailKeyTimer",
            "submit #form-create-account": "onCreateAccount",
            "click .right-nav": "nextPanel",
            "click .left-nav": "prevPanel"
        },


        render: function () {
            var self = this;
            this.getTempAccount()
                .done(function (value) {
                    self.tmpAccount = value;
                    self.renderSignup();
                    // if (self.place == 'start') {
                    //     self.renderStartSignup();
                    // } else if (self.place == 'details') {
                    //     self.renderSignupDetails();
                    // } else if (self.place == 'create') {
                    //     self.renderSignupCreate();
                    // }
                });

            return this;
        },


        _getData: function () {
            return {
                account: this.tmpAccount.toJSON(),
                isProfessional: this.tmpAccount.get("company").type === $$.constants.account.company_types.PROFESSIONAL,
                isBusiness: this.tmpAccount.get("company").type === $$.constants.account.company_types.BUSINESS,
                isEnterprise: this.tmpAccount.get("company").type === $$.constants.account.company_types.ENTERPRISE
            };
        },

        renderSignup: function () {
            var tmpl = $$.templateManager.get("signup-main", this.templateKey);
            var html = tmpl(this._getData());
            this.show(html);
            return this;
        },


        // renderSignupDetails: function () {
        //     var data = this._getData();

        //     if (data.account == null || data.account.company.type == null) {
        //         $$.r.mainAppRouter.navigate("/start", true);
        //     }

        //     var tmpl = $$.templateManager.get("signup-details", this.templateKey);
        //     var html = tmpl(data);
        //     this.show(html);

        //     $("#input-company-name", this.el).startKeyTimer(500);
        //     return this;
        // },


        // renderSignupCreate: function () {
        //     var data = this._getData();
        //     if (data.account == null || data.account.company.type == null) {
        //         $$.r.mainAppRouter.navigate("/start", true);
        //     }

        //     var tmpl = $$.templateManager.get("signup-create", this.templateKey);
        //     var html = tmpl(data);
        //     this.show(html);

        //     $("#input-username", this.el).startKeyTimer(400);
        //     $("#input-password", this.el).startKeyTimer(400);
        //     $("#input-password2", this.el).startKeyTimer(400);
        //     $("#input-email", this.el).startKeyTimer(400);
        //     return this;
        // },


        onCompanyTypeChanged: function (event) {
            var type = $(event.currentTarget).data("type");

            var company = this.tmpAccount.get("company");
            if (type == "business") {
                company.type = $$.constants.account.company_types.BUSINESS;
            } else if (type == "professional") {
                company.type = $$.constants.account.company_types.PROFESSIONAL;
            } else if (type == "enterprise") {
                company.type = $$.constants.account.company_types.ENTERPRISE;
            }

            this.tmpAccount.saveOrUpdateTmpAccount();

            this.renderSignup();
        },


        onCompanyNameKeyTimer: function (event) {
            var name = $(event.currentTarget).val();

            this.tmpAccount.get("company").name = name;

            //TODO: Remove this, only for initial testing
            var subdomain = $.trim(name).replace(" ", "").replace(".", "_");
            this.tmpAccount.set({subdomain: subdomain});

            this.tmpAccount.saveOrUpdateTmpAccount();
        },


        onCompanySizeChanged: function (event) {
            var size = $(event.currentTarget).data("size");

            this.tmpAccount.get("company").size = size;

            this.tmpAccount.saveOrUpdateTmpAccount();
        },


        onUsernameKeyTimer: function (event) {
            console.log('username key timer');
            var self = this;
            this.usernamevalid = false;

            var username = $(event.currentTarget).val();

            var helper = $("#help-username", this.el);
            var icon = $("#icon-username", this.el);

            helper.html("");
            if (username.length < 5) {
                helper.html("Username must be at least 5 characters long");
                return;
            }
            icon.removeClass("glyphicon-remove").removeClass("glyphicon").addClass("icon-loading");
            $$.services.UserService.usernameExists(username)
                .done(function (exists) {
                    if (exists) {
                        icon.addClass("glyphicon").addClass("glyphicon-remove").removeClass("icon-loading");
                        helper.html("Username already exists");
                    } else {
                        icon.addClass("glyphicon").addClass("glyphicon-ok").removeClass("icon-loading");
                        self.usernamevalid = true;
                    }
                });
        },


        onPasswordKeyTimer: function (event) {
            this.passwordsvalid = false;
            var pass1 = $("#input-password").val();
            var pass2 = $("#input-password2").val();

            var icon1 = $("#icon-password");
            var icon2 = $("#icon-password2");

            var helper1 = $("#help-password");
            var helper2 = $("#help-password2");

            helper1.html("");
            helper2.html("");

            if (pass1 == "" && pass2 == "") {
                return;
            }
            if (pass1.length < 5) {
                icon1.removeClass("glyphicon-ok").addClass("glyphicon-remove");
                icon2.removeClass("glyphicon-ok").addClass("glyphicon-remove");

                helper1.html("Password must be at least 5 characters long");
                helper2.html("");
            } else if (pass1.length >= 5) {
                icon1.removeClass("glyphicon-remove").addClass("glyphicon-ok");

                if (pass1 != pass2) {
                    icon2.removeClass("glyphicon-ok").addClass("glyphicon-remove");
                    helper2.html("Passwords do not match");
                } else {
                    this.passwordsvalid = true;
                    icon2.removeClass("glyphicon-remove").addClass("glyphicon-ok");
                }
            }
        },


        onEmailKeyTimer: function (event) {
            this.emailvalid = false;
            var email = $(event.currentTarget).validate({
                required: true,
                email: true
            });

            var icon = $("#icon-email", this.el);
            var helper = $("#help-email", this.el);

            helper.html("");
            if (email === false) {
                helper.html("A valid email address must be supplied");
                icon.removeClass("glphyicon-ok").addClass("glyphicon-remove");
            } else {
                this.emailvalid = true;
                icon.removeClass("glyphicon-remove").addClass("glyphicon-ok");
            }
        },


        onCreateAccount: function (event) {
            if (!this.usernamevalid || !this.passwordsvalid || !this.emailvalid) {
                event.preventDefault();
                return false;
            }
            return true;
        },


        getTempAccount: function () {
            var deferred = $.Deferred();

            var account = new $$.m.Account();
            account.getTmpAccount()
                .done(function () {
                    deferred.resolve(account);
                })
                .fail(function () {
                    deferred.resolve(null);
                });
            return deferred;
        },

        postRender: function() {
            this.$el.find('.signuppanel .form').css({'opacity': 0});
        },

        _getTransitionDirection: function(inOrOut) {
            var arr = ["start","details","create"];

            var currIndex = arr.indexOf(this.place);
            var nextIndex, lastIndex;
            if (inOrOut == "in") {
                lastIndex = arr.indexOf(this.lastPlace);

                if (lastIndex < currIndex) {
                    return "left"; //we are moving onto the screen to the left, from the right
                } else if (lastIndex > currIndex) {
                    return "right"; //we are moving onto the screen to the right, from the left
                }
            } else {
                nextIndex = arr.indexOf(this.nextPlace);

                if (nextIndex < currIndex) {
                    return "right"; //we're moving off the screen to the right, from the left;
                } else if(nextIndex > currIndex) {
                    return "left"; //we are moving off the screen, to the left, from the right
                }
            }
            return null;
        },

        left: '',
        opacity: '',
        scale: '',
        animating: '',

        nextPanel: function (ev) {
            var self = this;
            var data = this._getData();
            if(this.animating) return false;
            this.animating = true;

            var panelarr = ["start","details","create"];
            var currIndex = panelarr.indexOf(this.place);
            var current_fs = $('#'+this.place+'.signuppanel');
            var next_fs = $('#'+panelarr[currIndex+1]+'.signuppanel');
            var route = "/"+panelarr[currIndex+1];
            $$.r.mainAppRouter.navigate(route);

            $("#progressbar li").eq($("fieldset").index(currIndex+1)).addClass("active");

            if(currIndex === panelarr.length-2) { $('.right-nav').hide(); } else { $('.right-nav').show();}
            console.log(currIndex+' '+this.place);
            if(currIndex === 0) {
                if (data.account == null || data.account.company.type == null) {
                    $$.r.mainAppRouter.navigate("/start", true);
                }
                $("#input-company-name", this.el).startKeyTimer(500);
            }
            if(currIndex === 1) {
                $("#input-username", this.el).startKeyTimer(400);
                $("#input-password", this.el).startKeyTimer(400);
                $("#input-password2", this.el).startKeyTimer(400);
                $("#input-email", this.el).startKeyTimer(400);
            }

            next_fs.show();
            current_fs.animate({opacity: 0}, {
                step: function(now, mx) {
                    this.scale = 1 - (1 - now) * 0.2;
                    this.left = (now * 50)+"%";
                    this.opacity = 1 - now;
                    current_fs.css({'transform': 'scale('+this.scale+')'});
                    next_fs.css({'left': this.left, 'opacity': this.opacity});
                },
                duration: 800,
                complete: function(){
                    current_fs.hide();
                    self.place = panelarr[currIndex+1];
                    self.animating = false;
                },
                easing: 'easeInOutBack'
            });
        },

        prevPanel: function (ev) {
            var self = this;
            if(this.animating) return false;
            this.animating = true;

            var panelarr = ["start","details","create"];
            var currIndex = panelarr.indexOf(this.place);
            var current_fs = $('#'+this.place+'.signuppanel');
            var previous_fs = $('#'+panelarr[currIndex-1]+'.signuppanel');


            $("#progressbar li").eq($("fieldset").index(currIndex+1)).addClass("active");

            $('.right-nav').show();
            if(currIndex === 0) {
                window.location.href = "../login";
                // var route = "../login";
                // $$.r.mainAppRouter.navigate(route, {trigger:true});
                // return;
            }

            var route = "/"+panelarr[currIndex-1];
            $$.r.mainAppRouter.navigate(route);

            previous_fs.show();
            current_fs.animate({opacity: 0}, {
                step: function(now, mx) {
                    this.scale = 0.8 + (1 - now) * 0.2;
                    this.left = ((1-now) * 50)+"%";
                    //3. increase opacity of previous_fs to 1 as it moves in
                    this.opacity = 1 - now;
                    current_fs.css({'left': this.left});
                    previous_fs.css({'transform': 'scale('+this.scale+')', 'opacity': this.opacity});
                },
                duration: 800,
                complete: function(){
                    current_fs.hide();
                    self.place = panelarr[currIndex-1];
                    self.animating = false;
                },
                easing: 'easeInOutBack'
            });
        },


        nextPanelOLD: function () {
            console.log('next panel');
            var self = this;
            console.log('new transition in');
            var direction = this._getTransitionDirection("in");   //  left|right
                 _.delay(function() {
                     if (self.animating) return false;
                     self.animating = true;

                     if (direction == "left") {
                        //you want to transition me in from the right to the left
                        console.log('transitionIn from the left');
                        self.$el.find('.signuppanel').css({'opacity': 1});
                        self.$el.find('.signuppanel .form').css({'opacity': 0, 'left': '100%', 'display': 'block'});
                        self.$el.find('.signuppanel .form').animate({ 'opacity': 1, 'left': 0 }, {duration: 800, complete: function() {self.animating = false;},easing: 'easeInOutBack'});
                    } else if(direction == "right") {
                        //you want to transition me in from the left to the right
                        console.log('transitionIn from the right');
                        self.$el.find('.signuppanel .form').css({'opacity': 0, 'right': '100%', 'display': 'block'});
                        self.$el.find('.signuppanel .form').animate({ 'opacity': 1, 'right': 0 }, {duration: 800, complete: function() {self.animating = false;},easing: 'easeInOutBack'});
                    } else {
                        //you just want to show me with no animation
                        console.log('no direction');
                    }


                 }, 50);
        },


        prevPanelOLD: function () {
            console.log('prev panel');
            console.log('new transition out');

            var direction = this._getTransitionDirection("out");  //  left|right

            // if (direction == "left") {
            //     //you want to transition me out from the right to the left
            // } else if(direction == "right") {
            //     //you want to transition me out from the left to the right
            //     console.log('transitionOut from the right');
            //     //this.$el.addClass('transitionRight');
            // } else {
            //     //you just want to show me with no animation
            // }



            var self = this;
                 _.delay(function() {
                     if (self.animating) return false;
                     self.animating = true;

                     self.$el.find('.signuppanel .form').animate({ opacity: 0 }, {
                        step: function(now, mx) {
                            var scale = 1 - (1 - now) * 0.2;
                            self.$el.find('.signuppanel .form').css({ 'transform': 'scale(' + scale + ')'});
                        },
                        duration: 800,
                        complete: function() {
                            console.log('transition complete');
                            self.$el.hide();
                            self.animating = false;
                        },
                            easing: 'easeInOutBack'
                        });
                 }, 50);

            self.$el.find('.signuppanel .logo').css({'opacity':0});
                    self.$el.find('.signuppanel .left-nav').css({'opacity':0});
                    self.$el.find('.signuppanel .right-nav').css({'opacity':0});
        }

    });

    $$.v.SignupView = view;

    return view;
});
