'use strict';
/**
 * Any element that gets a 404 image get replaced
 */
app.directive('errSrc', function () {
  return {
    scope: {
      errSrc: '@',
      errContact: '='
    },
    link: function (scope, element, attrs) {

      var colors = ["turquoise", "emerland", "peterriver", "amethyst", "wetasphalt", "greensea", "nephritis", "belizehole", "wisteria", "midnightblue", "sunflower", "carrot", "alizarin", "clouds", "concrete", "orange", "pumpkin", "pomegranate", "silver", "asbestos"];

      scope.$watch(function () {
        return attrs['ngSrc'];
      }, function (value) {
        if (!value && scope.errContact) {
          element.hide();
          var contentTr = angular.element('<div class="two-letter-label ' + _.sample(colors) + '">' + scope.getContactLetters() + '</div>');
          contentTr.insertAfter(element);
        } else {
          element.attr('src', scope.errSrc);
        }
      });

      element.bind('error', function () {
        if (scope.errSrc.length > 0) {
          element.attr('src', scope.errSrc);
        } else {
          element.hide();
          var contentTr = angular.element('<div class="two-letter-label ' + _.sample(colors) + '">' + scope.getContactLetters() + '</div>');
          contentTr.insertAfter(element);
        }
      });

      var icons = ['beer', 'diamond', 'fighter-jet', 'gamepad', 'flag-checkered', 'key', 'leaf', 'motorcycle', 'ship', 'space-shuttle'];

      scope.getContactLetters = function () {
        var letters = '';
        var contact = scope.errContact;
        //get first letter of email
        if (scope.errContact.details.length > 0 && scope.errContact.details[0].emails[0].email) {
          letters = scope.errContact.details[0].emails[0].email.charAt(0);
        }
        //get initials
        if (scope.errContact.first) {
          letters = scope.errContact.first.charAt(0);
        }
        if (scope.errContact.last) {
          letters = letters + ' ' + scope.errContact.last.charAt(0);
        }

        if (letters.length <= 0) {
          letters = '<span class="fa fa-' + _.sample(icons) + '"></span>';
        }
        return letters;
      }
    }
  }
});
