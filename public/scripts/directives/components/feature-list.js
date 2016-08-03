/*global app, moment, angular, window*/
/*jslint unparam:true*/
app.directive('featureListComponent',['$window', function ($window) {
  return {
    scope: {
      component: '='
    },
    templateUrl: '/components/component-wrap.html',
    link: function (scope, element, attrs, ctrl) {
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
    }
  };
}]);
