(function() {
  angular.module('var.directives').directive('emailDrop', function() {
    return {
      restrict: 'A',
      scope: {
        dragFn: '='
      },
      link: function(scope, elm, attr) {
        elm.bind("dragover", function(event) {
          event.preventDefault();
        });

        elm.bind("drop", function(event) {
          scope.dragFn();
        });
      }
    };
  });
})();
