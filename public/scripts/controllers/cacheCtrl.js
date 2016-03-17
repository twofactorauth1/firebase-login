'use strict';
/*global mainApp*/
mainApp.controller('CacheCtrl', ['$scope', 'embeddedSiteDataService', '$window', '$location', '$document', '$timeout', function ($scope, embeddedSiteDataService, $window, $location, $document, $timeout) {
    $scope.isEditing = false;
    $scope.blog_post = null;
    console.log('cache ctrl');
    /*
    function checkIntercom(data) {
        if (data.hideIntercom) {
            $scope.$parent.hideIntercom = true;
        }
    }*/
    $scope.addUnderNavSetting = function (masthead_id, fn) {
        var data = {
            allowUndernav : false,
            navComponent: null
        }

        if ($scope.components.length > 0) {
            $scope.components.forEach(function (value, index) {
                if (value && value.type === 'masthead' && value._id == masthead_id) {
                    if (index != 0 && $scope.components[index - 1].type == "navigation") {
                        data.allowUndernav = true;
                        data.navComponent =  $scope.components[index - 1];
                    } else {
                        data.allowUndernav = false;
                    }
                }
            });
        } else if ($scope.sections.length > 0) {
            $scope.sections.forEach(function (sectionValue, sectionIndex) {
                sectionValue.components.forEach(function (value, index) {
                    if (value && value.type === 'masthead' && value._id == masthead_id) {
                        var navComponent = _.findWhere($scope.sections[sectionIndex - 1].components, { type: 'navigation' });
                        if (
                            sectionIndex != 0 &&
                            navComponent !== undefined
                        ) {
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

    $scope.$on('getCurrentPage', function (event, args) {
        args.currentpage = $scope.page;
    });


    $scope.components = [];
    embeddedSiteDataService.getPageData($scope.websiteId, function (err, data) {
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
            $scope.sections = data.sections;

            _.each(data.sections, function(section, index1){
                if (section) {
                    if(section.ssb === false) {
                        $scope.components = $scope.components.concat(section.components);
                    } else {
                        //this is what the template should be:
                        //<ssb-page-section section="section" index="$index" class="ssb-page-section"></ssb-page-section>
                        $scope['sections_' + index1] = section;
                    }
                }
            });
            _.each($scope.components, function(cmp, index){
                $scope['components_' + index] = cmp;
            });
            console.log('$scope.components_0:', $scope.components_0);

            if (data.handle === 'single-post') {
                var post_component = _.findWhere($scope.page.components, {
                    type: 'single-post'
                });
                if (post_component) {
                    $scope.blog_post = post_component;
                }
            }

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




}]);
