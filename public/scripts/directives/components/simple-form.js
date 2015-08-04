'use strict';
/*global app, window, Fingerprint, CryptoJS*/
app.directive('simpleFormComponent', ["ipCookie", '$window', '$timeout', 'userService', 'formValidations', function (ipCookie, $window, $timeout, userService, formValidations) {
  return {
    scope: {
      component: '='
    },
    templateUrl: '/components/component-wrap.html',
    link: function (scope) {

      scope.fieldsLength = function () {
        return _.filter(scope.component.fields, function (_field) {
          return _field.value === true;
        }).length;
      };

      scope.fieldShow = function (name) {
        var field = _.find(scope.component.fields, function (_field) {
          return _field.name === name;
        });
        if (field.value) {
          return true;
        }
      };
      scope.emailValidation = formValidations.email;
      scope.phoneNumberPattern = formValidations.phone;
      scope.user = {};
      scope.createUser = function (simpleForm) {
        scope.userExists = false;
        var fingerprint = new Fingerprint().get();
        var sessionId = ipCookie("session_cookie").id;

        var skipWelcomeEmail;

        if (scope.component.skipWelcomeEmail) {
          skipWelcomeEmail = true;
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
          campaignId: scope.component.campaignId,
          skipWelcomeEmail: skipWelcomeEmail,
          fromEmail: scope.component.fromEmail,
          fromName: scope.component.fromName,
          emailId: scope.component.emailId,
          emailSubject: scope.component.emailSubject,
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
        if (scope.user.phone) {
          formatted.details[0].phones.push({
            number: scope.user.phone,
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
