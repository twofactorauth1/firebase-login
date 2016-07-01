'use strict';
/*global mainApp*/
mainApp.controller('PreviewCtrl', ['$scope', '$rootScope', 'previewPagesService', '$window', '$location', '$document', '$timeout',
    function ($scope, $rootScope, previewPagesService, $window, $location, $document, $timeout) {
        $scope.isEditing = false;

        console.log('preview ctrl');

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
            $scope.components = $scope.page.components;
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

        previewPagesService($scope.websiteId, function (err, data) {
            console.log('previewPagesService ', data);
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
                checkIntercom(data);
                angular.element(document).ready(function () {
                    setTimeout(function () {
                        var locId = $location.$$hash;
                        if (locId) {
                            var element = document.getElementById(locId);
                            if (element) {
                                $document.scrollToElementAnimated(element, 0, 1000);
                            }
                        }
                    }, 3000);
                })
            }
        });
    }
]);
