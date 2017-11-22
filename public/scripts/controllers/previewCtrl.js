/*global mainApp,console,angular,document */
mainApp.controller('PreviewCtrl', ['$scope', '$rootScope', 'previewPagesService', 'SsbPageSectionService', '$window', '$location', '$document', '$timeout',
    function ($scope, $rootScope, previewPagesService, SsbPageSectionService, $window, $location, $document, $timeout) {
		'use strict';
        $scope.isEditing = false;

        console.log('preview ctrl');

        function checkIntercom(data) {
            if (data.hideIntercom) {
                $scope.$parent.hideIntercom = true;
            }
        }

        $scope.addUnderNavSetting = function (masthead_id, fn) {
            var data = {
                allowUndernav : false,
                navComponent: null
            };

            if ($scope.components && $scope.components.length > 0) {
                $scope.components.forEach(function (value, index) {
                    if (value && value.type === 'masthead' && value._id == masthead_id) {
                        if (index !== 0 && $scope.components[index - 1].type == "navigation") {
                            data.allowUndernav = true;
                            data.navComponent =  $scope.components[index - 1];
                        } else {
                            data.allowUndernav = false;
                        }
                    }
                });
            } else if ($scope.sections && $scope.sections.length > 0) {
                $scope.sections.forEach(function (sectionValue, sectionIndex) {
                    sectionValue.components.forEach(function (value) {
                        if (value && value.type === 'masthead' && value._id == masthead_id && $scope.sections[sectionIndex - 1]) {
                            var navComponent = _.findWhere($scope.sections[sectionIndex - 1].components, { type: 'navigation' });
                            if (sectionIndex !== 0 && navComponent !== undefined) {
                                data.allowUndernav = true;
                                data.navComponent = navComponent;
                            } else {
                                data.allowUndernav = false;
                            }
                        }
                    });
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
            $scope.$emit('external.scripts.page.data', {page: data});
            console.log('previewPagesService ', data);
            if (err) {
                console.warn('no page found', $location.$$path);
                if ($location.$$path === '/login') {
                    $window.location.href = '/login';
                } else {
                    $window.location.href = '/404';
                }

            } else {
                $timeout(function () {
                    SsbPageSectionService.setSectionOffset(0);
                    $scope.page = data;
                    $rootScope.title = $scope.page.title;
                    $rootScope.pageHandle = $scope.page.handle;
                    $scope.sections = data.sections;
                    $window.indigenous.firstVisibleElement=false;
                    checkIntercom(data);
                    angular.element(document).ready(function () {
                        $document.scrollTop(0);
                        $timeout(function () {
                            if ($location.$$hash) {
                                var element = document.getElementById($location.$$hash);
                                if (element) {
                                    $document.scrollToElementAnimated(element, 0, 1000);
                                }
                            }
                        }, 3000);
                    });
                }, 500);
                
            }
        });
    }
]);
