'use strict';
/*global mainApp*/
mainApp.controller('LayoutCtrl', ['$scope', '$rootScope', 'pagesService', '$window', '$location', '$document', '$timeout', function ($scope, $rootScope, pagesService, $window, $location, $document, $timeout) {
    $scope.isEditing = false;
    $scope.blog_post = null;
    console.log('layout crtl');
    function checkIntercom(data) {
        if (data.hideIntercom) {
            $scope.$parent.hideIntercom = true;
        }
    }

    $scope.addUnderNavSetting = function (masthead_id, fn) {
        var data = {
            allowUndernav: false,
            navComponent: null
        };
        if ($scope.components && $scope.components.length > 0) {
            $scope.components.forEach(function (value, index) {
                if (value && value.type === 'masthead' && value._id == masthead_id) {
                    if (index != 0 && $scope.components[index - 1].type == "navigation") {
                        data.allowUndernav = true;
                        data.navComponent = $scope.components[index - 1];
                    } else
                        data.allowUndernav = false;
                }
            });
        }
        fn(data);
    };

    $scope.defaultSpacings = {
        'pt': 0,
        'pb': 0,
        'pl': 0,
        'pr': 0,
        'mt': 0,
        'mb': 0,
        'mr': 'auto',
        'ml': 'auto',
        'mw': '100%',
        'usePage': false
    };
    pagesService($scope.websiteId, function (err, data) {
        console.log('pagesService ', data);
        if (err) {
            console.warn('no page found', $location.$$path);
            if ($location.$$path === '/login') {
                $window.location.href = '/login';
            } else {
                $window.location.href = '/404';
            }

        } else {
            $scope.page = data;
            $rootScope.title = $scope.page.title;
            $rootScope.pageHandle = $scope.page.handle;
            $scope.sections = data.sections;
            $scope.components = data.components;
            if (data.handle === 'single-post') {
                var post_component = _.findWhere($scope.page.components, {
                    type: 'single-post'
                });
                if (post_component) {
                    $scope.blog_post = post_component;
                }
            }

            checkIntercom(data);
            angular.element(document).ready(function () {
                $document.scrollTop(0);
                $timeout(function () {
                    var locId = $location.$$hash;
                    if (locId) {
                        var element = document.getElementById(locId);
                        if (element && element.length) {
                            $document.scrollToElementAnimated(element, 0, 1000);
                        }
                    }
                }, 3000);
            })
        }
    });
}]);
