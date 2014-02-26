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
//                    if (self.place == 'start') {
//                         self.renderStartSignup();
//                    } else if (self.place == 'details') {
//                         self.renderSignupDetails();
//                    } else if (self.place == 'create') {
//                         self.renderSignupCreate();
//                    }
                });

            return this;
        },


        _getData: function () {
            return {
                place: this.place,
                account: this.tmpAccount.toJSON(),
                isProfessional: this.tmpAccount.get("company").type === $$.constants.account.company_types.PROFESSIONAL,
                isBusiness: this.tmpAccount.get("company").type === $$.constants.account.company_types.BUSINESS,
                isEnterprise: this.tmpAccount.get("company").type === $$.constants.account.company_types.ENTERPRISE
            };
        },

        renderSignup: function () {
            var data = this._getData();

            //If the user hasn't started yet, we want to be sure they start at the beginning
            if (!this._isFirstPlace(this.place) && (data.account == null || data.account.company.type == null || data.account.company.type == 0)) {
                return $$.r.mainAppRouter.navigate("/start", {trigger:true});
            }

            var tmpl = $$.templateManager.get("signup-main", this.templateKey);
            var html = tmpl(data);
            this.show(html);
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

            this.renderSignup();
        },


        onCompanyNameKeyTimer: function (event) {
            var name = $(event.currentTarget).val();

            this.tmpAccount.get("company").name = name;

            var subdomain = $.trim(name).replace(" ", "").replace(".", "_").replace("@","");
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
            //this.$el.find('.signuppanel .form').css({'opacity': 0});
        },


        //region TRANSITION
        places: ["start","details","create"],
        left: '',
        opacity: '',
        scale: '',
        animating: '',

        _getNextPlace: function() {
            return this.places[this.places.indexOf(this.place)+1];
        },


        _getPreviuosPlace: function() {
            return this.places[this.places.indexOf(this.place)-1];
        },


        _isFirstPlace: function(place) {
            place = place || this.place;
            return this.places.indexOf(place) === 0;
        },


        _isLastPlace: function(place) {
            place = place || this.place;
            return this.places.indexOf(place) === this.places.length-1;
        },


        _updateProgressBar: function(place) {
            place = place || this.place;
            var panelIndex = this.places.indexOf(place);
            $("#progressbar li").eq($("fieldset").index(panelIndex)).addClass("active");
        },


        nextPanel: function (ev) {
            var self = this;
            var data = this._getData();

            if(this.animating) return false;
            this.animating = true;


            var nextPlace = this._getNextPlace();

            //Update the URL
            var route = "/"+nextPlace;
            $$.r.mainAppRouter.navigate(route);

            //Get the current panel and the next panel
            var current_fs = $('#'+this.place+'.signuppanel');
            var next_fs = $('#'+nextPlace+'.signuppanel');

            //Update the progress bar
            this._updateProgressBar(nextPlace);

            if (this._isLastPlace(nextPlace)) {
                $('.right-nav').hide();
            } else {
                $('.right-nav').show();
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
                    self.place = nextPlace;
                    self.animating = false;
                },
                easing: 'easeInOutBack'
            });
        },

        prevPanel: function (ev) {
            var self = this;

            if (this._isFirstPlace(this.place)) {
                return window.location.href = "/login";
            }

            if(this.animating) return false;
            this.animating = true;

            var previousPlace = this._getPreviuosPlace();
            var current_fs = $('#'+ this.place +'.signuppanel');
            var previous_fs = $('#'+ previousPlace +'.signuppanel');

            this._updateProgressBar(previousPlace);

            $('.right-nav').show();

            var route = "/" + previousPlace;
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
                    self.place = previousPlace;
                    self.animating = false;
                },
                easing: 'easeInOutBack'
            });
        },


        startKeyTimers: function() {
            $("#input-company-name", this.el).startKeyTimer(500);
            $("#input-username", this.el).startKeyTimer(400);
            $("#input-password", this.el).startKeyTimer(400);
            $("#input-password2", this.el).startKeyTimer(400);
            $("#input-email", this.el).startKeyTimer(400);
        },


        stopKeyTimers: function() {
            $("#input-company-name", this.el).stopKeyTimer();
            $("#input-username", this.el).stopKeyTimer();
            $("#input-password", this.el).stopKeyTimer();
            $("#input-password2", this.el).stopKeyTimer();
            $("#input-email", this.el).stopKeyTimer();
        },


        onClose: function() {
            this.stopKeyTimers();
        }

    });

    $$.v.SignupView = view;

    return view;
});
