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
            "submit #form-create-account": "onCreateAccount"
        },


        render: function () {
            var self = this;
            this.getTempAccount()
                .done(function (value) {
                    self.tmpAccount = value;
                    if (self.place == 'start') {
                        self.renderStartSignup();
                    } else if (self.place == 'details') {
                        self.renderSignupDetails();
                    } else if (self.place == 'create') {
                        self.renderSignupCreate();
                    }
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

        renderStartSignup: function () {

            var tmpl = $$.templateManager.get("signup-start", this.templateKey);
            var html = tmpl(this._getData());
            this.show(html);
            return this;
        },


        renderSignupDetails: function () {
            var data = this._getData();

            if (data.account == null || data.account.company.type == null) {
                $$.r.mainAppRouter.navigate("/start", true);
            }

            var tmpl = $$.templateManager.get("signup-details", this.templateKey);
            var html = tmpl(data);
            this.show(html);

            $("#input-company-name", this.el).startKeyTimer(500);
            return this;
        },


        renderSignupCreate: function () {
            var data = this._getData();
            if (data.account == null || data.account.company.type == null) {
                $$.r.mainAppRouter.navigate("/start", true);
            }

            var tmpl = $$.templateManager.get("signup-create", this.templateKey);
            var html = tmpl(data);
            this.show(html);

            $("#input-username", this.el).startKeyTimer(400);
            $("#input-password", this.el).startKeyTimer(400);
            $("#input-password2", this.el).startKeyTimer(400);
            $("#input-email", this.el).startKeyTimer(400);
            return this;
        },


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

            this.renderStartSignup();
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


        //region TRANSITION
        _getTransitionDirection: function(inOrOut) {
            var arr = ["start","details","create"];

            var currIndex = arr.indexOf(this.place);
            var nextIndex; lastIndex;
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


        transitionIn: function () {
            console.log('new transition in');

            var direction = this._getTransitionDirection("in");   //  left|right

            if (direction == "left") {
                //you want to transition me in from the right to the left
            } else if(direction == "right") {
                //you want to transition me in from the left to the right
            } else {
                //you just want to show me with no animation
            }
        },


        transitionOut: function () {
            console.log('new transition out');

            var direction = this._getTransitionDirection("out");  //  left|right

            if (direction == "left") {
                //you want to transition me out from the right to the left
            } else if(direction == "right") {
                //you want to transition me out from the left to the right
            } else {
                //you just want to show me with no animation
            }
        }

        //endregion

        /*
         var self = this;
         _.delay(function() {
         if (self.animating) return false;
         self.animating = true;

         //activate next step on progressbar using the index of next_fs
         $("#progressbar li").eq($("fieldset").index(self.next_fs)).addClass("active");

         self.next_fs.fadeIn();

         //hide the current fieldset with style
         self.current_fs.animate({ opacity: 0 }, {
         step: function(now, mx) {
         //as the opacity of current_fs reduces to 0 - stored in "now"
         //1. scale current_fs down to 80%
         self.scale = 1 - (1 - now) * 0.2;
         //2. bring next_fs from the right(50%)
         self.left = (now * 50) + "%";
         //3. increase opacity of next_fs to 1 as it moves in
         self.opacity = 1 - now;
         self.current_fs.css({
         'transform': 'scale(' + self.scale + ')'
         });
         self.next_fs.css({
         'left': self.left,
         'opacity': self.opacity
         });
         },
         duration: 800,
         complete: function() {
         self.current_fs.hide();
         self.animating = false;
         },
         //this comes from the custom easing plugin
         easing: 'easeInOutBack'
         });
         }, 500);
         */


        /*
         var self = this;
         _.delay(function() {
         if(self.animating) return false;
         self.animating = true;

         $("#progressbar li").eq($("fieldset").index(self.current_fs)).removeClass("active");

         self.next_fs.show();
         self.current_fs.animate({ opacity: 0 }, {
         step: function(now, mx) {
         self.scale = 0.8 + (1 - now) * 0.2;
         self.left = ((1-now) * 50)+"%";
         self.opacity = 1 - now;
         self.current_fs.css({'left': self.left});
         self.next_fs.css({'transform': 'scale('+self.scale+')', 'opacity': self.opacity});
         },
         duration: 800,
         complete: function() {
         self.current_fs.hide();
         self.animating = false;
         },
         easing: 'easeInOutBack'
         });
         }, 500);
         */
    });

    $$.v.SignupView = view;

    return view;
});
