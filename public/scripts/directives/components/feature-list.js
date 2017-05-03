/*global app, moment, angular, window*/
/*jslint unparam:true*/
app.directive('featureListComponent',['$window', '$timeout', function ($window, $timeout) {
  return {
    scope: {
      component: '='
    },
    templateUrl: '/components/component-wrap.html',
    link: function (scope, element, attrs, ctrl) {
        scope.features= {
            featureIndex: 0
        }
        scope.loading = true;
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


        scope.setSelectedFeatureIndex = function(index){
            scope.loading = true;
            scope.features.featureIndex = index;
            $timeout(function() {                
                scope.loading = false;
                var featureImges = angular.element("#" + scope.component._id + " .feature-tab-content .col-md-5 img");
                angular.forEach(featureImges, function(el) {
                    var srcFeatureImage = angular.element(el).attr("src");
                    if (srcFeatureImage) {
                        angular.element(el).wrap('<a href="' + srcFeatureImage + '" title="Project A" data-gallery=""></a>');
                    }

                });
            }, 0);
        }

        scope.setStyles = function(field){
            var styleString = ' ';
            if (field) {
                if (field.align === 'left' || field.align === 'right')
                    styleString += 'float: ' + field.align + " !important;";

                if (field.align === 'center') {
                    styleString += 'margin: 0 auto !important; float:none !important;';
                }
            }
            return styleString;
        }
    }
  };
}]);
