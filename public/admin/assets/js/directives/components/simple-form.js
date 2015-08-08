'use strict';
/*global app, moment, angular, window*/
/*jslint unparam:true*/
app.directive('simpleFormComponent',["formValidations", function (formValidations) {
  return {
    scope: {
      component: '='
    },
    templateUrl: '/components/component-wrap.html',
    link: function (scope, element, attrs) {
      scope.isEditing = true;
      scope.emailValidation = formValidations.email;
      scope.phoneNumberPattern = formValidations.phone;
      scope.fieldsLength = function () {
        return _.filter(scope.component.fields, function (_field) {
          return _field.value === true;
        }).length;
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
    }
  };
}]);
