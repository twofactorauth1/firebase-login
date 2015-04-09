'use strict';

angular.module('dm.style', [])
  .directive('style', function($compile) {
    return {
      restrict: 'E',
      link: function postLink(scope, element) {
        if (element.html() && !$.contains(document.head,element.get(0))) {
          var template = $compile('<style ng-bind-template="' + element.html() + '"></style>');
          element.replaceWith(template(scope));
        }
      }
    };
  });