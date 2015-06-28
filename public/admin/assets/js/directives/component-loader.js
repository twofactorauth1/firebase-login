'use strict';
/**
 * load all the components
 */

app.directive('componentLoader', ['$timeout', function ($timeout) {
  return {
    templateUrl: '/admin/assets/views/partials/component-loader.html',

    link: function (scope, element, attributes, controller) {

      CKEDITOR.disableAutoInline = true;

    }
  }
}]);
