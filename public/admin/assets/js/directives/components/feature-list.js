'use strict';
/*global app, moment, angular, window*/
/*jslint unparam:true*/
app.directive('featureListComponent',["$window", "$timeout", function ($window, $timeout) {
  return {
    scope: {
      component: '=',
      ssbEditor: '='
    },
    templateUrl: '/components/component-wrap.html',
    link: function (scope, element, attrs, ctrl) {

        scope.isEditing = true;
        scope.addFeatureList = function (index) {
            if (!index) {
                index = 0;
            }
            var newFeature = {
            "top": "<div style='text-align:center'><span class=\"fa fa-arrow-right\" style=\"color:#ffffff;font-size:96px;\"></span></div>",
            "content": "<div style=\"text-align: center;\"><br><span style=\"font-size:24px;\">Feature Title</span></div><div style=\"text-align: center;\"><br>Lorem ipsum dolor sit amet, consectetur adipisicing elit. Nisi ab, placeat. Officia qui molestiae incidunt est adipisci.</div><div style=\"text-align: center;\"><br><a class=\"btn ssb-theme-btn\" data-cke-saved-href=\"http://\" href=\"http://\">Learn More</a></div>"
            };
            scope.component.features.splice(index + 1, 0, newFeature);
        };

        scope.deleteFeatureList = function (index) {
            scope.component.features.splice(index, 1);
        };

        scope.featureStyle = function(component){
            var styleString = " ";

            if(component && component.blockBorder && component.blockBorder.show && component.blockBorder.color){
                styleString += 'border-color: ' + component.blockBorder.color + ';';
                styleString += 'border-width: ' + component.blockBorder.width + 'px;';
                styleString += 'border-style: ' + component.blockBorder.style + ';';
                styleString += 'border-radius: ' + component.blockBorder.radius + '%;';
            }

            if(component.blockbgcolor){
                styleString += 'background: ' + component.blockbgcolor;   
            }

            return styleString;
        }

        scope.featureClass = function(){
            var parent_id = scope.component.anchor || scope.component._id;
            var element = angular.element("#"+parent_id + " div.features-wrap")
            if(element.width() < 768){
                return "feature-xs-width";
            }
            else if(element.width() < 992){
                return "feature-sm-width";
            }
            else{
                return "";
            }
        }
    }
  };
}]);
