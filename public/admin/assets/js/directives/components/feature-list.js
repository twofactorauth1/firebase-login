'use strict';
/*global app, moment, angular, window*/
/*jslint unparam:true*/
app.directive('featureListComponent',["$window", function ($window) {
  return {
    scope: {
      component: '='
    },
    templateUrl: '/components/component-wrap.html',
    link: function (scope, element, attrs, ctrl) {

      scope.isEditing = true;
      scope.addFeatureList = function (index) {
        if (!index) {
          index = 0;
        }
        var newFeature = {
          "top": "<div style='text-align:center'><span class=\"fa fa-arrow-right\" style=\"color:#0061a7;font-size:96px;\"></span></div>",
          "content": "<p style=\"text-align: center;\"><span style=\"font-size:24px;\">Feature One</span></p><p style=\"text-align: center;\">Lorem ipsum dolor sit amet, consectetur adipisicing elit. Nisi ab, placeat. Officia qui molestiae incidunt est adipisci.</p><p style=\"text-align: center;\"><a style=\"-moz-box-shadow:inset 0px 1px 0px 0px #54a3f7;-webkit-box-shadow:inset 0px 1px 0px 0px #54a3f7;box-shadow:inset 0px 1px 0px 0px #54a3f7;background:-webkit-gradient(linear, left top, left bottom, color-stop(0.05, #007dc1), color-stop(1, #0061a7));background:-moz-linear-gradient(top, #007dc1 5%, #0061a7 100%);background:-webkit-linear-gradient(top, #007dc1 5%, #0061a7 100%);background:-o-linear-gradient(top, #007dc1 5%, #0061a7 100%);background:-ms-linear-gradient(top, #007dc1 5%, #0061a7 100%);background:linear-gradient(to bottom, #007dc1 5%, #0061a7 100%);filter:progid:DXImageTransform.Microsoft.gradient(startColorstr='#007dc1', endColorstr='#0061a7',GradientType=0);background-color:#007dc1;-moz-border-radius:3px;-webkit-border-radius:3px;border-radius:3px;border:1px solid #124d77;display:inline-block;color:#ffffff;font-family:verdana;font-size:19px;font-weight:normal;font-style:normal;padding:14px 70px;text-decoration:none;text-shadow:0px 1px 0px #154682;\" data-cke-saved-href=\"http://\" href=\"http://\">Learn More</a></p>"
        };
        scope.component.features.splice(index + 1, 0, newFeature);
      };

      scope.deleteFeatureList = function (index) {
        scope.component.features.splice(index, 1);
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
        }, 500)
      });
    }
  };
}]);
