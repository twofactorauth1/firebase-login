'use strict';
/*global app, window, Fingerprint, CryptoJS*/
app.directive('simpleFormComponent', ["ipCookie", '$window', '$timeout', 'userService', 'formValidations', function (ipCookie, $window, $timeout, userService, formValidations) {
  return {
    scope: {
      component: '='
    },
    templateUrl: '/components/component-wrap.html',
    link: function (scope) {
      console.log('scope.component ', scope.component);
      scope.nthRow = 'nthRow';
      if(!angular.isDefined(scope.component.tags)){
        scope.component.tags = [];
        if(scope.component.contact_type)
          scope.component.tags.push(scope.component.contact_type);
      }
      


      scope.fieldClass = function(field){
        var classString = 'col-sm-12';
        
        if(scope.component.formSettings && scope.component.formSettings.fieldsPerRow){
          classString = "col-sm-" + Math.floor(12/scope.component.formSettings.fieldsPerRow);
          scope.nthRow = 'nthRow' + scope.component.formSettings.fieldsPerRow;
        }
        return classString;
      };

      scope.fieldShow = function (name) {
        var field = _.find(scope.component.fields, function (_field) {
          return _field.name === name;
        });

        if(field) {
          if (field.value) {
            return true;
          }
        }
      };

      scope.fieldStyle = function(field){
        var styleString = ' ';
        if (field && field.spacing) {
            if (field.spacing.mb) {
                styleString += 'margin-bottom: ' + field.spacing.mb + 'px;';
            }
        }
        return styleString;
      };

      scope.inputStyle = function(field){
        var styleString = ' ';
        if (field && field.align) {
            styleString += 'text-align: ' + field.align + ";";         
        }
        if (field && field.inputTextSize) {
          styleString += 'font-size: ' + field.inputTextSize  + 'px important;';
        }
        if (field && field.inputFontFamily) {
          styleString += 'font-family: ' + field.inputFontFamily + ";";
        }
        return styleString;
      };
       
      scope.buttonStyle = function(btn){ 
        var styleString = '';
        if(scope.component.formSettings && scope.component.formSettings.fieldsPerRow){
            styleString = "width:" + 100/scope.component.formSettings.fieldsPerRow + "%;";
        }
        if (btn && btn.align) {           
            if(btn.align === 'left' || btn.align === 'right')
              styleString += 'float: ' + btn.align + ";";
            
            if(btn.align === 'center'){
              styleString += 'margin: 0 auto;';
            }
        }
        return styleString;
      };      

      scope.formStyle = function(form){ 
        var styleString = '';        
        if (form && form.formFontFamily) {
          styleString += 'font-family: ' + form.formFontFamily;
        }
        return styleString;
      };

      scope.formValidations = formValidations;
      scope.user = {};
      scope.createUser = function (simpleForm) {
        scope.userExists = false;
        var fingerprint = new Fingerprint().get();
        var sessionId = ipCookie("session_cookie").id;

        var skipWelcomeEmail;

        if (scope.component.skipWelcomeEmail) {
          skipWelcomeEmail = true;
        }

        var _campaignId;
        if (!scope.component.campaignId) {
          scope.component.campaignId = '';
        } else {
          _campaignId = scope.component.campaignId;
        }

        var formatted = {
          fingerprint: fingerprint,
          sessionId: sessionId,
          first: scope.user.first,
          last: scope.user.last,
          details: [{
            emails: [],
            phones: []
          }],
          campaignId: _campaignId,
          emailId: scope.component.emailId,
          sendEmail: scope.component.sendEmail,
          skipWelcomeEmail: skipWelcomeEmail,
          fromEmail: scope.component.fromEmail,
          fromName: scope.component.fromName,
          contact_type: scope.component.tags,
          uniqueEmail: scope.component.uniqueEmail || false,
          activity: {
            activityType: 'CONTACT_FORM',
            note: scope.user.message || "Contact form data.",
            sessionId: ipCookie("session_cookie").id,
            contact: scope.user
          }
        };
        formatted.details[0].emails.push({
          email: scope.user.email
        });
        if (scope.user.phone || scope.user.extension) {
          formatted.details[0].phones.push({
            number: scope.user.phone,
            extension: scope.user.extension,
            type: 'm'
          });
        }

        //create contact
        userService.addContact(formatted, function (data, err) {
          if (err && err.code === 409) {
            scope.userExists = true;
          } 
          else if(err && err.code !== 409){
              scope.formError = true;
              $timeout(function () {
                scope.formError = false;
              }, 5000);
          }
          else if (data) {
            var name;
            if (scope.user.first && scope.user.last) {
              name = scope.user.first + ' ' + scope.user.last;
            } else {
              name = '';
            }

            // This variant of the FB Tracking pixel is going away in late 2016
            // Ref: https://www.facebook.com/business/help/373979379354234
            if (scope.component.facebookConversionCode) {
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
              window._fbq.push(['track', scope.component.facebookConversionCode, {'value':'0.00','currency':'USD'}]);
            }

            // var hash = CryptoJS.HmacSHA256(scope.user.email, "vZ7kG_bS_S-jnsNq4M2Vxjsa5mZCxOCJM9nezRUQ");
            // //send data to intercom
            // $window.intercomSettings = {
            //   name: name,
            //   email: scope.user.email,
            //   phone: scope.user.phone,
            //   user_hash: hash.toString(CryptoJS.enc.Hex),
            //   created_at: Math.floor(Date.now() / 1000),
            //   app_id: "b3st2skm"
            // };

            if (!scope.component.redirect) {
              scope.formSuccess = true;
              scope.user = {};
              simpleForm.$setPristine(true);

              $timeout(function () {
                scope.formSuccess = false;
              }, 3000);
            } else {
              if (scope.component.redirectType === 'page') {
                window.location.href = scope.component.redirectUrl;
              }
              if (scope.component.redirectType === 'external') {
                window.location.href = 'http://' + scope.component.redirectUrl;
              }
            }

          }
        });
      };
    }
  };
}]);
