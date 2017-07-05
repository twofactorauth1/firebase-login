'use strict';

angular.module('angularAddToHomeScreen')
    .directive('ngAddToHomeScreen', ['$homeScreenDetector', 'aathsLocales', function ($homeScreenDetector, aathsLocales) {
        var hydrateInstructions = function (hsdInstance) {
            var device = hsdInstance.device() || 'device';
            var instructions;
            var icon;

            if (hsdInstance.iOS10() || hsdInstance.iOS9() || hsdInstance.iOS8() || hsdInstance.iOS7() || hsdInstance.iOS6()) {
                instructions = aathsLocales.en.iOS;
                if (hsdInstance.iOS10()) {
                    icon = 'iOS8';
                } else if (hsdInstance.iOS9()) {
                    icon = 'iOS8';
                } else if (hsdInstance.iOS8()) {
                    icon = 'iOS8';
                } else if (hsdInstance.iOS7()) {
                    icon = 'iOS7';
                } else {
                    icon = 'iOS6';
                }
            }

            instructions = instructions
                .replace('%icon', function () {
                    return '<span class="aaths-' + icon + '-icon"></span>';
                })
                .replace('%device', device);
            return '<div class="aaths-instructions">' + instructions + '</div>';
        };

        // Runs during compile
        return {
            // name: '',
            // priority: 1,
            // terminal: true,
            scope: {
                closeCallback: '=closeCallback'
            }, // {} = isolate, true = child, false/undefined = no change
            // controller: function($scope, $element, $attrs, $transclude) {},
            // require: 'ngModel', // Array = multiple requires, ? = optional, ^ = check parent elements
            // restrict: 'A', // E = Element, A = Attribute, C = Class, M = Comment
            template: '<button class="aaths-close" ng-click="aathsClose()">{{ closeText }}</button><div ng-transclude></div>',
            // templateUrl: '',
            // replace: true,
            transclude: true,
            // compile: function(tElement, tAttrs, function transclude(function(scope, cloneLinkingFn){ return function linking(scope, elm, attrs){}})),
            link: function ($scope, iElm) {
                $scope.aathsClose = function () {
                    iElm.parent().removeClass("aaths-main");
                    iElm.remove();
                    if (angular.isFunction($scope.closeCallback)) {
                        $scope.closeCallback();
                        createCookie("showAddToHome","addtohome",365);
                    }
                };
                var hsd = new $homeScreenDetector();
                $scope.applicable = hsd.safari() && (hsd.iOS10() || hsd.iOS9() || hsd.iOS8() || hsd.iOS7() || hsd.iOS6()) && !hsd.fullscreen();
                $scope.closeText = 'Close';
                if ($scope.applicable) {
                    var decodedCookie = readCookie('showAddToHome');
                    if (decodedCookie != "addtohome") {
                        iElm.addClass('aaths-container').prepend(hydrateInstructions(hsd));
                        iElm.parent().addClass("aaths-main");
                        createCookie("showAddToHome","addtohome",365);
                    } else {
                        iElm.remove();
                    }

                } else {
                    iElm.remove();
                }
            }
        };
        function createCookie(name,value,days) {
            var expires = "";
            if (days) {
                var date = new Date();
                date.setTime(date.getTime() + (days*24*60*60*1000));
                expires = "; expires=" + date.toUTCString();
            }
            document.cookie = name + "=" + value + expires + "; path=/";
        }

        function readCookie(name) {
            var nameEQ = name + "=";
            var ca = decodeURIComponent(document.cookie).split(';');
            for(var i=0;i < ca.length;i++) {
                var c = ca[i];
                while (c.charAt(0)==' ') c = c.substring(1,c.length);
                if (c.indexOf(nameEQ) == 0) return c.substring(nameEQ.length,c.length);
            }
            return null;
        }
    }]);
