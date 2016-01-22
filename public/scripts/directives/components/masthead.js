app.directive('mastheadComponent', ['$window', function ($window) {
    return {
        scope: {
            component: '='
        },
        templateUrl: '/components/component-wrap.html',
        link: function (scope, element, attrs) {
            console.log('mastheadComponent ');
            scope.$watch('component', function(){
                if (scope.component.bg && scope.component.bg.img && scope.component.bg.img.url && scope.component.bg.img.show && scope.component.bg.img.undernav)
                    scope.addUndernavClasses = true;
                angular.element('body').on("click", ".navbar-toggle", function (e) {
                    scope.setUnderbnavMargin();
                });

                angular.element(document).ready(function () {
                    setTimeout(function () {
                        scope.setUnderbnavMargin();
                        console.log("masthead loaded");
                    }, 0);
                });
                angular.element($window).bind('resize', function () {
                    scope.setUnderbnavMargin();
                });
                scope.setUnderbnavMargin = function () {
                    if(scope.$parent.addUnderNavSetting)
                        scope.$parent.addUnderNavSetting(scope.component._id, function (data) {
                            scope.allowUndernav = data.allowUndernav;
                            scope.navComponent = data.navComponent;
                        });
                    setTimeout(function () {
                        var mastheadElement = angular.element(".component_wrap_" + scope.component._id + ".undernav200");
                        var mastheadUnderNavElement = angular.element(".masthead_" + scope.component._id + ".mastHeadUndernav");
                        if (scope.addUndernavClasses && scope.allowUndernav) {
                            var navHeight = angular.element(".undernav").height();
                            var margin = navHeight;
                            if (mastheadElement) {
                                mastheadElement.css("margin-top", -margin);
                                if (scope.allowFullScreen)
                                    mastheadElement.css("height", $window.innerHeight + navHeight);
                            }

                            angular.element(".undernav").addClass("nav-undernav");
                            var addNavBg = true;
                            if (scope.navComponent) {
                                if (scope.navComponent.bg && scope.navComponent.bg.img && !scope.navComponent.bg.img.show && scope.navComponent.bg.color) {
                                    addNavBg = false;
                                }
                            }
                            if (addNavBg)
                                angular.element(".nav-undernav .bg").addClass("bg-nav-undernav");
                            else
                                angular.element(".nav-undernav .bg").removeClass("bg-nav-undernav");
                            angular.element(".undernav").closest('li.fragment').addClass("li-nav-undernav");

                            if (mastheadUnderNavElement)
                                mastheadUnderNavElement.css("height", margin);
                            if (angular.element(".masthead-actions"))
                                angular.element(".masthead-actions").css("margin-top", margin - 4);
                            $(window).trigger('scroll');
                        } else {
                            if (mastheadElement)
                                mastheadElement.css("margin-top", 0);
                            if (angular.element(".masthead-actions"))
                                angular.element(".masthead-actions").css("margin-top", 0);
                        }
                    }, 300);
                };
            });

        }
    }
}]);
