(function () {

    app.controller('SiteBuilderFormBuilderComponentController', ssbFormBuilderComponentController);

    ssbFormBuilderComponentController.$inject = ['$scope', '$attrs', '$filter', '$transclude', '$injector', 'formValidations', '$timeout', '$location'];
    /* @ngInject */
    function ssbFormBuilderComponentController($scope, $attrs, $filter, $transclude, $injector, formValidations, $timeout, $location) {

        console.info('ssb-form-builder directive init...')

        var vm = this;

        vm.init = init;

        vm.userExists = false;

        vm.formBuilder = {};

        vm.originalData = {
          bg: {
             
          }
        };
        vm.elementClass =  '.form-builder-'+ vm.component._id + " .form-submit-button";

        vm.fieldClass = fieldClass;

        vm.fieldStyle = fieldStyle;
        vm.inputStyle = inputStyle;
        vm.inputContainerStyle = inputContainerStyle;
        vm.buttonStyle = buttonStyle;
        vm.formStyle = formStyle;
        vm.addCustomField = addCustomField;
        vm.addPattern = addPattern;
        vm.checkDuplicateEmail = checkDuplicateEmail;
        vm.formValidations = formValidations;
        vm.formFiedlsCHange = formFiedlsCHange;
        vm.nthRow = 'nth-row';

        vm.isEditing = $scope.$parent.vm && $scope.$parent.vm.uiState;

        vm._campaignObj = null;
        vm.removeBorderStyle=removeBorderStyle;
        vm.setBorderStyle=setBorderStyle;
        function setBorderStyle(currentElement,btnStyle){
            vm.removeBorderStyle(currentElement);
            if (btnStyle.border &&
                btnStyle.border.show) {
                if (btnStyle.border.color) {
                    currentElement.style.setProperty('border-color', btnStyle.border.color, 'important');
                }
                if (btnStyle.border.width) {
                    currentElement.style.setProperty('border-width', btnStyle.border.width + 'px', 'important');
                }
                if (!btnStyle.border.radius) {
                    btnStyle.border.radius = 0;
                }
                currentElement.style.setProperty('border-radius', btnStyle.border.radius + '%', 'important');

                if (btnStyle.border.style) {
                    currentElement.style.setProperty('border-style', btnStyle.border.style, 'important');
                }
            }
        }
        function removeBorderStyle(currentElement){
            currentElement.style.setProperty('border-color', "transparent", 'important');
            currentElement.style.setProperty('border-width', '1px', 'important');
            currentElement.style.setProperty('border-radius', '4px', 'important');// old default is 4px
            currentElement.style.setProperty('border-style', "solid", 'important');
        }
        function fieldClass(field) {
            var classString = 'col-sm-12';

            if (vm.component.formSettings && vm.component.formSettings.fieldsPerRow > 0) {
                classString = "col-sm-" + Math.floor(12 / vm.component.formSettings.fieldsPerRow);
                if (vm.component.formSettings.spacing && vm.component.formSettings.spacing.pr)
                    vm.nthRow = 'nth-row' + vm.component.formSettings.fieldsPerRow;
            }
            return classString;
        };


        function fieldStyle(field) {
            var styleString = ' ';
            if (field && field.spacing) {
                if (field.spacing.mb) {
                    styleString += 'margin-bottom: ' + field.spacing.mb + 'px;';
                }
            }
            if (field && field.fieldsPerRow) {
                styleString += "min-width:" + Math.floor(100 / field.fieldsPerRow) + '%';
            }
            return styleString;
        };

        function inputContainerStyle(field) {
            var styleString = ' ';
            if (field) {
                if (field.align === 'left' || field.align === 'right')
                    styleString += 'float: ' + field.align + " !important;";

                if (field.align === 'center') {
                    styleString += 'margin: 0 auto !important; float:none !important;';
                }
            }
            return styleString;
        };

        function inputStyle(field) {

            var styleString = ' ';
            if (field) {
                if (field && field.inputTextSize) {
                    styleString += 'font-size: ' + field.inputTextSize + 'px !important;';
                }
                if (field && field.inputFontFamily) {
                    styleString += 'font-family: ' + field.inputFontFamily + "!important;";
                }
                if (field && field.inputBgColor) {
                    styleString += 'background-color: ' + field.inputBgColor + "!important;";
                }
                if (field && field.inputBorderColor) {
                    styleString += 'border-color: ' + field.inputBorderColor + ";";
                }
                if (field && field.inputTextColor) {
                    styleString += 'color: ' + field.inputTextColor + ";";
                }
            }

            return styleString;
        };


        function buttonStyle(btn) {
            var styleString = '';

            if (btn && btn.align) {
                if (btn.align === 'left' || btn.align === 'right')
                    styleString += 'float: ' + btn.align + " !important;";

                if (btn.align === 'center') {
                    styleString += 'margin: 0 auto !important; float:none !important;';
                }
            }
            if(btn && btn.bg && btn.bg.color){
                styleString += ' background-color: ' + btn.bg.color + "!important;";
                styleString += ' border-color: ' + btn.bg.color + ";";

                vm.originalData.bg.color = btn.bg.color;
                vm.originalData.borderColor = btn.bg.color;
            }

            if(btn && btn.txtcolor){
              styleString += ' color: ' + btn.txtcolor + "!important;";
              vm.originalData.txtcolor= btn.txtcolor;
            }
            if(btn && btn.border && btn.border.show){
                if(btn.border.color){
                    styleString += ' border-color: '+btn.border.color+ '  !important;';
                    vm.originalData.btn={};
                    vm.originalData.btn.border=btn.border;
                }
                if(btn.border.width){
                    styleString += ' border-width: '+btn.border.width+ 'px   !important;';
                }
                if(!btn.border.radius ){
                    btn.border.radius=0;
                }
                styleString += ' border-radius: '+btn.border.radius+ '%  !important;';

                if(btn.border.style){
                    styleString += ' border-style: '+btn.border.style+ ' !important;';
                }else{
                     styleString += ' border-style: none !important;';
                }
            }
            return styleString;
        };

        function formStyle(form) {
            var styleString = '';
            if (form) {
                if (form.formFontFamily) {
                    styleString += 'font-family: ' + form.formFontFamily + ";";
                }
                if (form.formTextColor) {
                    styleString += 'color: ' + form.formTextColor + ";";
                }
            }
            return styleString;
        };

        function addCustomField(type) {
            console.log("Add custom");
        };

        function addPattern(val) {
            if (val.name === "phone") {
                return vm.formValidations.phone;
            }
            if (val.name === "email") {
                return vm.formValidations.email;
            }
        }

        function checkDuplicateEmail(val) {
            if (val.name === "email") {
                return vm.userExists;
            }
        }
        // on change reset error
        function formFiedlsCHange(val){
             if (val.name === "email") {
                 if(vm.userExists){
                     $scope.setinvalid =false;
                 }
                 vm.userExists=false;
            }
        }

        function formatString(stringval){
            return stringval.replace(/[^\w-\s]/gi, '');
        } 


        vm.createUser = function (form) {
            // Admin check
            $scope.setinvalid = true;
         
            if ($scope.$parent.vm.state)
                return;

            if ($injector.has("userService"))
                userService = $injector.get("userService");

            if ($injector.has("ipCookie"))
                ipCookie = $injector.get("ipCookie");

            var fingerprint = new Fingerprint().get();
            var sessionId = ipCookie("session_cookie") ? ipCookie("session_cookie").id : null;

            var skipWelcomeEmail;

            if (vm.component.skipWelcomeEmail) {
                skipWelcomeEmail = true;
            }

            var sendEmailId = vm.component.sendEmail === "true";

            var _campaignId;
            if (!vm.component.campaignId || sendEmailId) {
                vm.component.campaignId = '';
            } else {
                _campaignId = vm.component.campaignId;
            }

            var _campaignTags = [];
            if (vm._campaignObj && angular.isDefined(vm._campaignObj.searchTags) && vm._campaignObj.searchTags.tags.length) {
                _campaignTags = _.uniq(_.pluck(vm._campaignObj.searchTags.tags, 'data'));
            }

            var first_name = "";
            var last_name = "";

            if (vm.formBuilder.name) {
                var name_arr = vm.formBuilder.name.split(/ (.+)?/);
                first_name = name_arr[0];
                if (name_arr.length > 1) {
                    last_name = name_arr[1];
                }
            }

            var customFields = _.filter(vm.component.contactInfo, function (x) {
                return x.custom == true || x.name === 'message';
            });

            var extra = [];

            customFields.forEach(function (c, i) {
                extra.push({name: c.name, label: c.label, value: vm.formBuilder[c.name] || null});
            });

            var params = $location.$$search;

            var activityFields = angular.copy(vm.formBuilder);

            if(angular.isObject(params) && Object.keys(params).length){
                _.each(params, function(value, key){ 
                    extra.push({
                        name: formatString(key),                        
                        value: formatString(value)
                    });
                    activityFields[key] = value;
                });
            };

            var formatted = {
                fingerprint: fingerprint,
                sessionId: sessionId,
                first: first_name,
                last: last_name,
                details: [
                    {
                        emails: [],
                        phones: [],
                        addresses: []
                    }
                ],
                campaignId: _campaignId,
                campaignTags: _campaignTags,
                emailId: vm.component.emailId,
                sendEmail: vm.component.sendEmail,
                skipWelcomeEmail: skipWelcomeEmail,
                fromEmail: vm.component.fromEmail,
                fromName: vm.component.fromName,
                contact_type: vm.component.tags,
                uniqueEmail: vm.component.uniqueEmail || false,
                activity: {
                    activityType: 'CONTACT_FORM',
                    note: vm.formBuilder.Message || "Contact form data.",
                    sessionId: ipCookie("session_cookie") ? ipCookie("session_cookie").id : null,
                    contact: activityFields
                },
                extra: extra
            };
            if (vm.formBuilder.email)
                formatted.details[0].emails.push({
                    email: vm.formBuilder.email
                });
            if (vm.formBuilder.phone) {
                formatted.details[0].phones.push({
                    number: vm.formBuilder.phone,
                    type: 'm'
                });
            }

            if (vm.formBuilder.address || vm.formBuilder.city || vm.formBuilder.state || vm.formBuilder.zip || vm.formBuilder.country) {
                formatted.details[0].addresses.push({
                    address: vm.formBuilder.address,
                    city: vm.formBuilder.city,
                    state: vm.formBuilder.state,
                    country: vm.formBuilder.country,
                    zip: vm.formBuilder.zip,
                    ssb: true
                });
            }

            //create contact
            userService.addContact(formatted, function (data, err) {
                if (err && err.code === 409) {
                    vm.userExists = true;
                }
                else if (err && err.code !== 409) {
                    vm.formError = true;
                    $timeout(function () {
                        vm.formError = false;
                    }, 5000);
                }
                else if (data) {
                    var name = vm.formBuilder.name;

                    // This variant of the FB Tracking pixel is going away in late 2016
                    // Ref: https://www.facebook.com/business/help/373979379354234
                    if (vm.component.facebookConversionCode) {
                        var _fbq = window._fbq || (window._fbq = []);
                        if (!_fbq.loaded) {
                            var fbds = document.createElement('script');
                            fbds.async = true;
                            fbds.src = '//connect.facebook.net/en_US/fbds.js';
                            var s = document.getElementsByTagName('script')[0];
                            s.parentNode.insertBefore(fbds, s);
                            _fbq.loaded = true;
                        }
                        window._fbq = window._fbq || [];
                        window._fbq.push(['track', vm.component.facebookConversionCode, {'value': '0.00', 'currency': 'USD'}]);
                    }


                    if (!vm.component.redirect) {
                        vm.formSuccess = true;
                        vm.formBuilder = {};
                        form.$setPristine(true);

                        $timeout(function () {
                            vm.formSuccess = false;
                        }, 3000);
                    } else {
                        vm.formSuccess = true;
                        vm.formBuilder = {};
                        form.$setPristine(true);

                        $timeout(function () {
                            vm.formSuccess = false;
                        }, 3000);

                        if (vm.component.redirectType === 'page') {
                            window.location.href = vm.component.redirectUrl;
                        }
                        if (vm.component.redirectType === 'external') {
                            window.location.href = 'http://' + vm.component.redirectUrl;
                        }
                    }
                     $scope.setinvalid = false;
                }
            });
        };


        function getCampaigns() {
            if (vm.component.campaignId) {
                if ($injector.has("campaignService")) {
                    campaignService = $injector.get("campaignService");
                    campaignService.getCampaign(vm.component.campaignId, function (data) {
                        vm._campaignObj = data;
                    });
                }
            }
        }

        function init(element) {
            vm.element = element;
            getCampaigns();
        }


        angular.element(document).ready(function() {
          var unbindWatcher = $scope.$watch(function() {              
              return angular.element(vm.elementClass).length;
          }, function(newValue, oldValue) {
              if (newValue) {
                  unbindWatcher();
                  $timeout(function() {
                    
                    var element = angular.element(vm.elementClass);


                    var originalData = {
                        bg: {
                            color: element.css('background-color')
                        },
                        txtcolor: element.css('color'),
                        borderColor: element.css('border-color')
                    };
                    
                    var btnActiveStyle = null;
                    if(element)
                    {
                      // bind hover and active events to button

                        element.hover(function(){
                            var btnHoverStyle = null;                    
                            if(vm.component.formSettings && vm.component.formSettings.btnStyle && vm.component.formSettings.btnStyle.hover)
                            {
                              btnHoverStyle = vm.component.formSettings.btnStyle.hover;
                            }

                            if (btnHoverStyle) {
                                if (btnHoverStyle.bg && btnHoverStyle.bg.color) {
                                    this.style.setProperty('background-color', btnHoverStyle.bg.color, 'important');
                                    this.style.setProperty('border-color', btnHoverStyle.bg.color, 'important');
                                }
                                vm.setBorderStyle(this,btnHoverStyle);
                            }else {
                               vm.removeBorderStyle(this);
                            }
                            if(btnHoverStyle && btnHoverStyle.txtcolor)
                              this.style.setProperty( 'color', btnHoverStyle.txtcolor, 'important' );

                        }, function(){
                            if(vm.originalData.bg.color)
                              this.style.setProperty( 'background-color', vm.originalData.bg.color, 'important' );
                            else
                              this.style.setProperty( 'background-color', originalData.bg.color, 'important' );
                            if(vm.originalData.txtcolor)
                              this.style.setProperty( 'color', vm.originalData.txtcolor, 'important' );
                            else
                              this.style.setProperty( 'color', originalData.txtcolor, 'important' );
                            if(vm.originalData.borderColor)
                              this.style.setProperty( 'border-color', vm.originalData.borderColor, 'important' );
                            else
                                this.style.setProperty( 'border-color', originalData.borderColor, 'important' );
                            
                            var btn=vm.originalData.btn;
                            if(btn){
                                vm.setBorderStyle(this,btn);
                            }else{
                                vm.removeBorderStyle(this);
                            }
                        });

                        element.on("mousedown touchstart", function(){
                            if(vm.component.formSettings && vm.component.formSettings.btnStyle && vm.component.formSettings.btnStyle.pressed)
                            {
                              btnActiveStyle = vm.component.formSettings.btnStyle.pressed;
                            }
                            if(btnActiveStyle){
                                if(btnActiveStyle.bg && btnActiveStyle.bg.color){
                                  this.style.setProperty( 'background-color', btnActiveStyle.bg.color, 'important' );
                                  this.style.setProperty( 'border-color', btnActiveStyle.bg.color, 'important' );
                                }
                                vm.setBorderStyle(this,btnActiveStyle);

                            } else {
                               vm.removeBorderStyle(this);
                            }
                            if(btnActiveStyle && btnActiveStyle.txtcolor)
                              this.style.setProperty( 'color', btnActiveStyle.txtcolor, 'important' );
                        })

                        element.on("mouseup touchend", function(){
                            var elem = this;
                            $timeout(function() {
                                if(vm.originalData.bg.color)
                                  elem.style.setProperty( 'background-color', vm.originalData.bg.color, 'important' );
                                else
                                  elem.style.setProperty( 'background-color', originalData.bg.color, 'important' );
                                if(vm.originalData.txtcolor)
                                  elem.style.setProperty( 'color', vm.originalData.txtcolor, 'important' );
                                else
                                  elem.style.setProperty( 'color', originalData.txtcolor, 'important' );
                                if(vm.originalData.borderColor)
                                  elem.style.setProperty( 'border-color', vm.originalData.borderColor, 'important' );
                                else
                                  elem.style.setProperty( 'border-color', originalData.borderColor, 'important' );
                                  var btn=vm.originalData.btn;
                                   if(btn){
                                       vm.setBorderStyle(elem,btn);
                                   }else{
                                       vm.removeBorderStyle(elem);
                                   }
                            }, 1000);
                        })
                    }
                  }, 500);
              }
          });
      })
    }
})();
