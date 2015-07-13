'use strict';
/*global app, moment, angular, window, Fingerprint*/
/*jslint unparam:true*/
app.directive('simpleFormComponent', ["ipCookie", '$window', '$timeout', 'userService', function (ipCookie, $window, $timeout, userService) {
  return {
    scope: {
      component: '=',
      version: '='
    },
    templateUrl: '/components/component-wrap.html',
    link: function (scope, element, attrs) {
      scope.fieldShow = function (name) {
        var field = _.find(scope.component.fields, function (_field) {
          return _field.name === name;
        });
        if (field.value) {
          return true;
        }
      };

      scope.phoneNumberPattern = /^\(?(\d{3})\)?[ .-]?(\d{3})[ .-]?(\d{4})$/;
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
          fromEmail: scope.component.from_email,
          activity: {
            activityType: 'CONTACT_FORM',
            note: scope.user.message || "Contact form data.",
            sessionId: ipCookie("session_cookie")["id"],
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
              name = 'John Doe';
            }

            var hash = CryptoJS.HmacSHA256(scope.user.email, "vZ7kG_bS_S-jnsNq4M2Vxjsa5mZCxOCJM9nezRUQ");
            //send data to intercom
            $window.intercomSettings = {
              name: name,
              email: scope.user.email,
              phone: scope.user.phone,
              user_hash: hash.toString(CryptoJS.enc.Hex),
              created_at: new Date().getTime() / 1000,
              app_id: "b3st2skm"
            };

            scope.formSuccess = true;
            scope.user = {};
            simpleForm.$setPristine(true);

            $timeout(function () {
              scope.formSuccess = false;
            }, 3000);

          }
        });
      };
    }
  }
}]);
