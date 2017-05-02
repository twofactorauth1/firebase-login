app.directive('stFilteredCollection', function () {
  return {
    require: '^stTable',
    link: function (scope, element, attr, ctrl) {
      scope.$watch(ctrl.getFilteredCollection, function(val) {
        scope.filteredCollection = val;
      })
    }
  }
});