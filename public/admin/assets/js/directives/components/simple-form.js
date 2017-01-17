'use strict';
/*global app, moment, angular, window*/
/*jslint unparam:true*/
app.directive('simpleFormComponent',["formValidations", "$timeout", function (formValidations, $timeout) {
  return {
    scope: {
      component: '=',
      ssbEditor: '='
    },
    templateUrl: '/components/component-wrap.html',
    link: function (scope, element, attrs) {

      scope.isEditing = true;
      scope.nthRow = 'nth-row';
      scope.formValidations = formValidations;
      scope.elementClass =  '.simple-form-'+ scope.component._id + " .form-submit-button";
      scope.originalData = {
          bg: {
             
          }
      };
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

        if(scope.component.formSettings && scope.component.formSettings.fieldsPerRow > 0){
          classString = "col-sm-" + Math.floor(12/scope.component.formSettings.fieldsPerRow);
          if(scope.component.formSettings.spacing && scope.component.formSettings.spacing.pr)
            scope.nthRow = 'nth-row' + scope.component.formSettings.fieldsPerRow;
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
            styleString += 'font-size: ' + field.inputTextSize  + 'px !important;';
        }
        if (field && field.inputFontFamily) {
            styleString += 'font-family: ' + field.inputFontFamily + ";";
        }
        if (field && field.inputBgColor) {
            styleString += 'background-color: ' + field.inputBgColor + "!important;";
        }
        if (field && field.inputBorderColor) {
            styleString += 'border-color: ' + field.inputBorderColor + ";";
        }
        if (field && field.inputTextColor) {
            styleString += 'color: ' + field.inputTextColor + ";";
        }
        return styleString;
      };

      scope.buttonStyle = function(btn, style){
        var styleString = '';
        if (btn && btn.align) {
            if(btn.align === 'left' || btn.align === 'right')
              styleString += 'float: ' + btn.align + ";";

            if(btn.align === 'center'){
              styleString += 'margin: 0 auto;';
            }
        }
        if(style && style.bg && style.bg.color){
          styleString += ' background-color: ' + style.bg.color + "!important;";
          styleString += ' border-color: ' + style.bg.color + ";";
          scope.originalData.color = style.bg.color;
          scope.originalData.borderColor = style.bg.color;
        }

        if(style && style.txtcolor){
          styleString += ' color: ' + style.txtcolor + "!important;";
          scope.originalData.txtcolor= element.css('color');
        }

        return styleString;
        
      };

      scope.formStyle = function(form){
        var styleString = '';
        if(form){
            if (form.formFontFamily) {
                styleString += 'font-family: ' + form.formFontFamily + ";";
            }
            if (form.formTextColor) {
                styleString += 'color: ' + form.formTextColor + ";";
            }
        }
        return styleString;
      };

      angular.element(document).ready(function() {
          var unbindWatcher = scope.$watch(function() {              
              return angular.element(scope.elementClass).length;
          }, function(newValue, oldValue) {
              if (newValue) {
                  unbindWatcher();
                  $timeout(function() {
                    
                    var element = angular.element(scope.elementClass);


                    var originalData = {
                        bg: {
                            color: element.css('background-color')
                        },
                        txtcolor: element.css('color'),
                        borderColor: element.css('border-color')
                    };
                    
                    var btnActiveStyle = null;
                    if(element)
                    {
                      // bind hover and active events to button

                        element.hover(function(){
                            var btnHoverStyle = null;                    
                            if(scope.component.formSettings && scope.component.formSettings.btnStyle && scope.component.formSettings.btnStyle.hover)
                            {
                              btnHoverStyle = scope.component.formSettings.btnStyle.hover;
                            }

                            if(btnHoverStyle && btnHoverStyle.bg && btnHoverStyle.bg.color){
                              this.style.setProperty( 'background-color', btnHoverStyle.bg.color, 'important' );
                              this.style.setProperty( 'border-color', btnHoverStyle.bg.color, 'important' );
                            }
                            if(btnHoverStyle && btnHoverStyle.txtcolor)
                              this.style.setProperty( 'color', btnHoverStyle.txtcolor, 'important' );

                        }, function(){
                            if(scope.originalData.bg.color)
                              this.style.setProperty( 'background-color', scope.originalData.bg.color, 'important' );
                            else
                              this.style.setProperty( 'background-color', originalData.bg.color, 'important' );
                            if(scope.originalData.txtcolor)
                              this.style.setProperty( 'color', scope.originalData.txtcolor, 'important' );
                            else
                              this.style.setProperty( 'color', originalData.txtcolor, 'important' );
                            if(scope.originalData.borderColor)
                              this.style.setProperty( 'border-color', scope.originalData.borderColor, 'important' );
                            else
                              this.style.setProperty( 'border-color', originalData.borderColor, 'important' );
                        });

                        element.on("mousedown touchstart", function(){
                            if(scope.component.formSettings && scope.component.formSettings.btnStyle && scope.component.formSettings.btnStyle.pressed)
                            {
                              btnActiveStyle = scope.component.formSettings.btnStyle.pressed;
                            }
                            if(btnActiveStyle && btnActiveStyle.bg && btnActiveStyle.bg.color){
                              this.style.setProperty( 'background-color', btnActiveStyle.bg.color, 'important' );
                              this.style.setProperty( 'border-color', btnActiveStyle.bg.color, 'important' );
                            }
                            if(btnActiveStyle && btnActiveStyle.txtcolor)
                              this.style.setProperty( 'color', btnActiveStyle.txtcolor, 'important' );
                        })
                    }
                  }, 500);
              }
          });
      })

    }
  };
}]);
