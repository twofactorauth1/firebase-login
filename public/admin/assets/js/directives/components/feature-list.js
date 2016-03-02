'use strict';
/*global app, moment, angular, window*/
/*jslint unparam:true*/
app.directive('featureListComponent',["$window", function ($window) {
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
          "top": "<div style='text-align:center'><span class=\"fa fa-arrow-right\" style=\"color:ffffff;font-size:96px;\"></span></div>",
          "content": "<div style=\"text-align: center;\"><br><span style=\"font-size:24px;\">Feature Title</span></div><div style=\"text-align: center;\"><br>Lorem ipsum dolor sit amet, consectetur adipisicing elit. Nisi ab, placeat. Officia qui molestiae incidunt est adipisci.</div><div style=\"text-align: center;\"><br><a class=\"btn ssb-theme-btn\" data-cke-saved-href=\"http://\" href=\"http://\">Learn More</a></div>"
        };

        scope.component.features.splice(index + 1, 0, newFeature);
        scope.resizeFeatureTiles();
      };

      scope.deleteFeatureList = function (index) {
        scope.component.features.splice(index, 1);
        scope.resizeFeatureTiles();
      };

      scope.resizeFeatureTiles = function (argument) {
        var parent_id = scope.component.anchor || scope.component._id;
        var element = angular.element("#"+parent_id + " div.feature-height")
        if (element && element.length) {
          var maxFeatureHeight = Math.max.apply(null, element.map(function () {
            return this.offsetHeight;
          }).get());
          element.css("min-height", maxFeatureHeight);
        }
      };
      angular.element($window).bind('resize', function () {
        scope.resizeFeatureTiles();
      });
      angular.element(document).ready(function () {
        setTimeout(function () {
          scope.resizeFeatureTiles();
        }, 1000)
      });
    }
  };
}]);
