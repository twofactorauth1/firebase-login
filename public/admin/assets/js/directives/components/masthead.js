'use strict';
/*global app, moment, angular, window*/
/*jslint unparam:true*/
app.directive('mastheadComponent',["$window", function ($window) {
  return {
    scope: {
      component: '='
    },
    templateUrl: '/components/component-wrap.html',
    link: function (scope, element, attrs) {
      scope.addUndernavImages = function()
      {
        if(scope.component.bg && scope.component.bg.img && scope.component.bg.img.show && scope.component.bg.img.undernav)
          scope.addUndernavClasses = true;
        else
          scope.addUndernavClasses = false;
      }
      
      angular.element('body').on("click", ".navbar-toggle", function (e) {
        scope.setUnderbnavMargin();
      });

      angular.element($window).bind('resize', function () {
        console.log("resize");
        scope.setUnderbnavMargin();        
      });
      scope.setUnderbnavMargin = function () {
        scope.allowUndernav = false;
        scope.$parent.addUnderNavSetting(scope.component._id, function (data) {
          scope.allowUndernav = data;
        });
        scope.addUndernavImages();
        setTimeout(function () {          
          var mastheadElement = angular.element(".component_wrap_"+scope.component._id+".undernav200");
          var mastheadUnderNavElement = angular.element(".masthead_"+scope.component._id+".mastHeadUndernav");
          if (scope.addUndernavClasses && scope.allowUndernav) {
            var navHeight = angular.element("#bs-example-navbar-collapse-1").height();
            var margin = 210 + navHeight;
            var impmargin = "margin-top: -"+ margin + 'px !important'; 
            if (mastheadElement) {
              mastheadElement.attr('style',impmargin);
              //mastheadElement.addClass("masthead-undernav");
            }
            
            angular.element(".undernav").addClass("nav-undernav");
            angular.element(".undernav").closest('li.fragment').addClass("li-nav-undernav");

            if (mastheadUnderNavElement)
              mastheadUnderNavElement.css("height", margin);
            if (angular.element(".masthead-actions")){
              angular.element(".masthead-actions").addClass("hover-action");
            }
              

          } else {
            if (mastheadElement)
              mastheadElement.attr('style',"margin-top:0px");
            if (angular.element(".masthead-actions"))
              angular.element(".masthead-actions").removeClass("hover-action");
            angular.element(".undernav").removeClass("nav-undernav");
            //mastheadElement.removeClass("masthead-undernav");
            angular.element(".undernav").closest('li.fragment').removeClass("li-nav-undernav");
          }
          $(window).trigger('scroll');
        }, 300);
      };
      
      scope.$watch('component.bg.img', function (newValue, oldValue) {
        if (angular.isDefined(newValue)){
          console.log("Watch performed");
          scope.setUnderbnavMargin();
        }
      }, true);
      scope.isEditing = true;
    }
  };
}]);
