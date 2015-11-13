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

      scope.fieldsLength = function () {
        return _.filter(scope.component.fields, function (_field) {
          return _field.value === true;
        }).length;
      };

      scope.clearValidations= function(){
        scope.userExists = false;
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
          contact_type: scope.component.contact_type,
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

          } else if (data) {
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
