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
      scope.nthRow = 'nthRow';
      scope.formValidations = formValidations;
      if(!angular.isDefined(scope.component.tags)){
        scope.component.tags = [];
        if(scope.component.contact_type)
          scope.component.tags.push(scope.component.contact_type);
      }
      var nameExists = _.find(scope.component.fields, function (_field) {
        return _field.name === 'extension';
      });
      if(!nameExists)
      {
        scope.component.fields.push({"display" : "Phone Extension", "value" : false,"name" : "extension"})
      }

      scope.fieldClass = function(field){
        var classString = 'col-sm-12';
        
        if(scope.component.formSettings && scope.component.formSettings.fieldsPerRow){
          classString = "col-sm-" + Math.floor(12/scope.component.formSettings.fieldsPerRow);
          scope.nthRow = 'nthRow' + scope.component.formSettings.fieldsPerRow;
        }
        return classString;
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

      scope.fieldStyle = function(field){
        var styleString = ' ';
        if (field && field.spacing) {
            if (field.spacing.mb) {
                styleString += 'margin-bottom: ' + field.spacing.mb + 'px;';
            }
        }
        return styleString;
      };

      scope.inputStyle = function(field){
        var styleString = ' ';
        if (field && field.align) {
            styleString += 'text-align: ' + field.align + ";";         
        }
        if (field && field.inputTextSize) {
          styleString += 'font-size: ' + field.inputTextSize  + 'px;';
        }
        if (field && field.inputFontFamily) {
          styleString += 'font-family: ' + field.inputFontFamily + ";";
        }
        return styleString;
      };
       
      scope.buttonStyle = function(btn){ 
        var styleString = '';
        if(scope.component.formSettings && scope.component.formSettings.fieldsPerRow){
            styleString = "width:" + 100/scope.component.formSettings.fieldsPerRow + "%;";
        }
        if (btn && btn.align) {           
            if(btn.align === 'left' || btn.align === 'right')
              styleString += 'float: ' + btn.align + ";";
            
            if(btn.align === 'center'){
              styleString += 'margin: 0 auto;';
            }
        }
        return styleString;
      };      

      scope.formStyle = function(form){ 
        var styleString = '';        
        if (form && form.formFontFamily) {
          styleString += 'font-family: ' + form.formFontFamily;
        }
        return styleString;
      };
    }
  };
}]);
