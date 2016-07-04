(function(){

app.controller('SiteBuilderFormBuilderComponentController', ssbFormBuilderComponentController);

ssbFormBuilderComponentController.$inject = ['$scope', '$attrs', '$filter', '$transclude', '$injector', 'formValidations', '$timeout'];
/* @ngInject */
function ssbFormBuilderComponentController($scope, $attrs, $filter, $transclude, $injector, formValidations, $timeout) {

	console.info('ssb-form-builder directive init...')

	var vm = this;

	vm.init = init;

	vm.userExists = false;

	vm.formBuilder = {};

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

    vm.nthRow = 'nth-row';

    vm.isEditing = $scope.$parent.vm && $scope.$parent.vm.uiState;


	function fieldClass(field){
		var classString = 'col-sm-12';

		if(vm.component.formSettings && vm.component.formSettings.fieldsPerRow > 0){
		classString = "col-sm-" + Math.floor(12/vm.component.formSettings.fieldsPerRow);
		if(vm.component.formSettings.spacing && vm.component.formSettings.spacing.pr)
			vm.nthRow = 'nth-row' + vm.component.formSettings.fieldsPerRow;
		}
		return classString;
	};


	function fieldStyle(field){
	var styleString = ' ';
	if (field && field.spacing) {
	    if (field.spacing.mb) {
	        styleString += 'margin-bottom: ' + field.spacing.mb + 'px;';
	    }
	}
    if(field && field.fieldsPerRow){
        styleString += "min-width:" + Math.floor(100/field.fieldsPerRow) + '%';
    }
	return styleString;
	};

    function inputContainerStyle(field){
        var styleString = ' ';
        if(field){
            if(field.align === 'left' || field.align === 'right')
                styleString += 'float: ' + field.align + " !important;";

            if(field.align === 'center'){
               styleString += 'margin: 0 auto !important; float:none !important;';
            }
        }
        return styleString;
      };

	function inputStyle(field){

		var styleString = ' ';
		if(field){
			if (field && field.inputTextSize) {
			  styleString += 'font-size: ' + field.inputTextSize  + 'px !important;';
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



	function buttonStyle(btn){
		var styleString = '';

		if (btn && btn.align) {
		    if(btn.align === 'left' || btn.align === 'right')
		      styleString += 'float: ' + btn.align + " !important;";

		    if(btn.align === 'center'){
		      styleString += 'margin: 0 auto !important; float:none !important;';
		    }
		}
		return styleString;
	};

	function formStyle(form){
		var styleString = '';
        if(form){
            if (form.formFontFamily) {
                styleString += 'font-family: ' + form.formFontFamily + ";";
            }
            if (form.formTextColor) {
                styleString += 'color: ' + form.formTextColor + ";";
            }
        }
		return styleString;
	};

    function addCustomField(type){
        console.log("Add custom");
    };

    function addPattern(val){
        if(val.name === "phone"){
            return vm.formValidations.phone;
        }
        if(val.name === "email"){
            return vm.formValidations.email;
        }
    }

    function checkDuplicateEmail(val){
        if(val.name === "email"){
            return vm.userExists;
        }
    }



	vm.createUser = function (form) {
		// Admin check
		if($scope.$parent.vm.state)
			return;

		if($injector.has("userService"))
			userService = $injector.get("userService");

		if($injector.has("ipCookie"))
			ipCookie = $injector.get("ipCookie");

        var fingerprint = new Fingerprint().get();
        var sessionId = ipCookie("session_cookie").id;

        var skipWelcomeEmail;

        if (vm.component.skipWelcomeEmail) {
          skipWelcomeEmail = true;
        }

        var _campaignId;
        if (!vm.component.campaignId) {
          vm.component.campaignId = '';
        } else {
          _campaignId = vm.component.campaignId;
        }

        var first_name = "";
        var last_name = "";

        if(vm.formBuilder.name){
        	var name_arr = vm.formBuilder.name.split(/ (.+)?/);
        	first_name = name_arr[0];
        	if(name_arr.length > 1){
        	  last_name = name_arr[1];
        	}
        }

				var customFields = _.filter(vm.component.contactInfo, function (x) {
					return x.custom == true;
				});

				var extra = [];

				customFields.forEach(function (c, i) {
					extra.push({name: c.name, label: c.label, value: vm.formBuilder[c.name] || null});
				});

        var formatted = {
          fingerprint: fingerprint,
          sessionId: sessionId,
          first: first_name,
          last: last_name,
          details: [{
            emails: [],
            phones: [],
            addresses: []
          }],
          campaignId: _campaignId,
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
            sessionId: ipCookie("session_cookie").id,
            contact: vm.formBuilder
          },
		  extra: extra
        };
        if(vm.formBuilder.email)
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
            zip: vm.formBuilder.zip
          });
        }

        //create contact
        userService.addContact(formatted, function (data, err) {
          if (err && err.code === 409) {
            vm.userExists = true;
          }
          else if(err && err.code !== 409){
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
              window._fbq.push(['track', vm.component.facebookConversionCode, {'value':'0.00','currency':'USD'}]);
            }


            if (!vm.component.redirect) {
              vm.formSuccess = true;
              vm.formBuilder = {};
              form.$setPristine(true);

              $timeout(function () {
                vm.formSuccess = false;
              }, 3000);
            } else {
              if (vm.component.redirectType === 'page') {
                window.location.href = vm.component.redirectUrl;
              }
              if (vm.component.redirectType === 'external') {
                window.location.href = 'http://' + vm.component.redirectUrl;
              }
            }

          }
        });
      };


	function init(element) {
		vm.element = element;
	}

}


})();
