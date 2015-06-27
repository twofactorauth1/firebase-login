'use strict';
/**
 * load all the components
 */

app.directive('componentLoader', ['$filter', '$compile', function ($filter, $compile) {
  return {
    templateUrl: '/admin/assets/views/partials/component-loader.html',

    //link: function (scope, element, attributes, controller) {
    //
    //  var insertionPoint = element.find('#componentloader');
    //  var components = scope.components;
    //  scope.$watch('components', function (newValue, oldValue) {
    //    if (newValue) {
    //      var template = '';
    //      _.each(newValue, function (value, index) {
    //        var valueProp = 'value' + index;
    //        scope[valueProp] = value;
    //        var directiveString = "<div " + value.type + "-component component=" + valueProp + " version="+ value.version +"></div>";
    //
    //        var compiledElement = $compile(directiveString)(scope);
    //
    //        insertionPoint.append(compiledElement);
    //      });
    //    }
    //  });
    //}
  }
}]);
