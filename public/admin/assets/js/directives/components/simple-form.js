'use strict';
/*global app, moment, angular, window*/
/*jslint unparam:true*/
app.directive('simpleFormComponent',["formValidations", function (formValidations) {
  return {
    scope: {
      component: '=',
      ssbEditor: '='
    },
    templateUrl: '/components/component-wrap.html',
    link: function (scope, element, attrs) {
      scope.isEditing = true;
      scope.formValidations = formValidations;
      var nameExists = _.find(scope.component.fields, function (_field) {
        return _field.name === 'extension';
      });
      if(!nameExists)
      {
        scope.component.fields.push({"display" : "Phone Extension", "value" : false,"name" : "extension"})
      }

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
