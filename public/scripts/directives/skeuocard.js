'use strict';

angular.module('mainApp.directives', [])
  .directive('indigewebSkeuocard', function() {
    return {
      require: [],
      restrict: 'C',
      transclude: false,
      templateUrl: '../../views/partials/_skeuocard.html',
      link: function(scope, element, attrs, controllers) {
        scope.card = new Skeuocard($("#skeuocard"));
      }
    };
});