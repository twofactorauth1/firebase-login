'use strict';
/*global app, moment, angular, window*/
/*jslint unparam:true*/
app.directive('mastheadComponent',["$window", function ($window) {
  return {
    scope: {
      component: '=',
      control: '='
    },
    templateUrl: '/components/component-wrap.html',
    link: function (scope, element, attrs) {
      scope.addUndernavImages = function()
      {
        if(scope.component.bg && scope.component.bg.img && scope.component.bg.img.undernav)
          scope.addUndernavClasses = true;
        else
          scope.addUndernavClasses = false;
      }
      
      angular.element('body').on("click", ".navbar-toggle", function (e) {
        scope.setUnderbnavMargin();
      });

      angular.element($window).bind('resize', function () {
        scope.setUnderbnavMargin();        
      });
      scope.setUnderbnavMargin = function () {
        scope.allowUndernav = false;
        scope.$parent.addUnderNavSetting(function (data) {
          scope.allowUndernav = data;
        });
        scope.addUndernavImages();
        setTimeout(function () {
          if (scope.addUndernavClasses && scope.allowUndernav) {
            var navHeight = angular.element("#bs-example-navbar-collapse-1").height();
            var margin = 210 + navHeight;
            var impmargin = "margin-top: -"+ margin + 'px !important'; 
            if (angular.element(".undernav200")) {
              angular.element(".undernav200").attr('style',impmargin);
              angular.element(".undernav200").addClass("masthead-undernav");
            }
            
            angular.element(".undernav").addClass("nav-undernav");
            angular.element(".undernav").closest('li.fragment').addClass("li-nav-undernav");

            if (angular.element(".mastHeadUndernav"))
              angular.element(".mastHeadUndernav").css("height", margin);
            if (angular.element(".masthead-actions")){
              angular.element(".masthead-actions").addClass("hover-action");
              //angular.element(".masthead-actions").css("margin-top", 56);
            }
              

          } else {
            if (angular.element(".undernav200"))
              angular.element(".undernav200").attr('style',"margin-top:0px");
            if (angular.element(".masthead-actions"))
              angular.element(".masthead-actions").removeClass("hover-action");
            angular.element(".undernav").removeClass("nav-undernav");
            angular.element(".undernav200").removeClass("masthead-undernav");
            angular.element(".undernav").closest('li.fragment').removeClass("li-nav-undernav");
          }

        }, 300);
      };
      angular.element(document).ready(function () {
        setTimeout(function () {
          scope.setUnderbnavMargin();
        }, 500)
      })
      scope.isEditing = true;
      scope.control.setUnderNav = function()
      {
        scope.setUnderbnavMargin();
      }

    }
  };
}]);
